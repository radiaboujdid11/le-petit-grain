"""Horaires et créneaux : retrait des commandes et réservations de table.

Toutes les fonctions reçoivent « now » en paramètre (au lieu de lire l'horloge) :
les tests peuvent ainsi simuler n'importe quel moment.
"""

from dataclasses import dataclass
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.timezone import local_datetime, to_local
from app.models import OpeningHours, Order, Reservation, ShopSettings


@dataclass
class Slot:
    start: datetime  # avec fuseau
    label: str  # heure locale, ex. « 08:15 »
    available: bool


def get_settings(db: Session, lock: bool = False) -> ShopSettings:
    """Les réglages (ligne unique). lock=True verrouille la ligne jusqu'à la fin de la
    transaction : deux commandes/réservations simultanées passent alors l'une après l'autre."""
    query = select(ShopSettings).where(ShopSettings.id == 1)
    if lock:
        query = query.with_for_update()
    return db.scalars(query).one()


def opening_window(db: Session, day: date) -> tuple[datetime, datetime] | None:
    """(ouverture, fermeture) en heure de Casablanca, ou None si la boutique est fermée."""
    hours = db.get(OpeningHours, day.weekday())
    if hours is None or hours.is_closed:
        return None
    return local_datetime(day, hours.open_time), local_datetime(day, hours.close_time)


def _range(start: datetime, last: datetime, step_minutes: int):
    current = start
    while current <= last:
        yield current
        current += timedelta(minutes=step_minutes)


# ---------------------------------------------------------------- Retrait des commandes

def pickup_slots(db: Session, day: date, now: datetime) -> list[Slot]:
    settings = get_settings(db)
    window = opening_window(db, day)
    if window is None:
        return []
    open_at, close_at = window
    # Premier retrait possible : ouverture + délai de préparation ; dernier : 15 min avant la fermeture
    earliest = max(open_at, now) + timedelta(minutes=settings.pickup_min_lead_minutes)
    last = close_at - timedelta(minutes=settings.pickup_slot_minutes)

    # Nombre de commandes actives par créneau (une seule requête SQL)
    counts = dict(
        db.execute(
            select(Order.pickup_at, func.count())
            .where(Order.pickup_at.between(open_at, close_at), Order.status != "cancelled")
            .group_by(Order.pickup_at)
        ).all()
    )
    slots = []
    for start in _range(open_at, last, settings.pickup_slot_minutes):
        if start < earliest:
            continue
        taken = sum(n for t, n in counts.items() if t == start)
        slots.append(Slot(start, start.strftime("%H:%M"), taken < settings.max_orders_per_pickup_slot))
    return slots


def is_valid_pickup(db: Session, pickup_at: datetime, now: datetime) -> bool:
    day = to_local(pickup_at).date()
    settings = get_settings(db)
    if not 0 <= (day - to_local(now).date()).days <= settings.pickup_days_ahead:
        return False
    return any(s.start == pickup_at and s.available for s in pickup_slots(db, day, now))


# ---------------------------------------------------------------- Réservations de table

def seats_taken(db: Session, start: datetime, end: datetime, exclude_id: int | None = None) -> int:
    """Personnes déjà installées sur l'intervalle [start, end[ (réservations qui se chevauchent)."""
    query = select(func.coalesce(func.sum(Reservation.party_size), 0)).where(
        Reservation.status == "confirmed",
        Reservation.start_at < end,
        Reservation.end_at > start,
    )
    if exclude_id is not None:
        query = query.where(Reservation.id != exclude_id)
    return db.scalar(query)


def reservation_slots(
    db: Session, day: date, party_size: int, now: datetime, exclude_id: int | None = None
) -> list[Slot]:
    settings = get_settings(db)
    window = opening_window(db, day)
    if window is None:
        return []
    open_at, close_at = window
    duration = timedelta(minutes=settings.reservation_duration_minutes)
    slots = []
    # Dernière réservation possible : la table doit être libérée avant la fermeture
    for start in _range(open_at, close_at - duration, settings.reservation_slot_minutes):
        if start <= now:
            continue
        free = settings.seating_capacity - seats_taken(db, start, start + duration, exclude_id)
        slots.append(Slot(start, start.strftime("%H:%M"), party_size <= free))
    return slots
