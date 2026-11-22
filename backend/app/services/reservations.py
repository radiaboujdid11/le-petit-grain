"""Réservations de table : création, modification, annulation, SANS surréservation.

Le contrôle de capacité est fait sous VERROU (ligne des réglages, SELECT … FOR UPDATE) :
si deux personnes réservent la dernière place à la même milliseconde, la seconde
attend la fin de la première, puis voit la salle pleine.
"""

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import hash_token, new_token, short_reference
from app.core.timezone import to_local
from app.models import Reservation
from app.services.schedule import get_settings, reservation_slots


def _check_slot(db: Session, start: datetime, party_size: int, now: datetime, exclude_id=None):
    settings = get_settings(db, lock=True)  # verrou jusqu'à la fin de la transaction
    if not 1 <= party_size <= settings.max_party_size:
        raise AppError("INVALID_PARTY_SIZE", 422)
    day = to_local(start).date()
    if (day - to_local(now).date()).days > settings.reservation_days_ahead:
        raise AppError("INVALID_RESERVATION_SLOT", 409)
    slots = reservation_slots(db, day, party_size, now, exclude_id)
    if not any(s.start == start and s.available for s in slots):
        raise AppError("INVALID_RESERVATION_SLOT", 409)
    return start + timedelta(minutes=settings.reservation_duration_minutes)


def create_reservation(db: Session, data, locale: str, now: datetime) -> tuple[Reservation, str]:
    """Renvoie (réservation, jeton du lien de gestion en clair : à donner UNE fois au client)."""
    end = _check_slot(db, data.start_at, data.party_size, now)
    token, token_hash = new_token()
    reference = short_reference("R")
    while db.scalar(select(Reservation.id).where(Reservation.reference == reference)):
        reference = short_reference("R")
    reservation = Reservation(
        reference=reference,
        manage_token_hash=token_hash,
        start_at=data.start_at,
        end_at=end,
        party_size=data.party_size,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        notes=data.notes,
        locale=locale,
    )
    db.add(reservation)
    db.flush()
    return reservation, token


def find_by_token(db: Session, token: str) -> Reservation:
    reservation = db.scalar(
        select(Reservation).where(Reservation.manage_token_hash == hash_token(token))
    )
    if reservation is None:
        raise AppError("RESERVATION_NOT_FOUND", 404)
    return reservation


def update_reservation(db: Session, reservation: Reservation, start: datetime, party: int, now):
    if reservation.status == "cancelled":
        raise AppError("RESERVATION_CANCELLED", 409)
    reservation.end_at = _check_slot(db, start, party, now, exclude_id=reservation.id)
    reservation.start_at = start
    reservation.party_size = party
    db.flush()
    return reservation


def cancel_reservation(db: Session, reservation: Reservation) -> Reservation:
    reservation.status = "cancelled"
    db.flush()
    return reservation
