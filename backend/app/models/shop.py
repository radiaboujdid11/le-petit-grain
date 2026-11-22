"""Réglages de la boutique : horaires d'ouverture, jours de fermeture et paramètres (une seule ligne)."""

from datetime import date, time

from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class OpeningHours(Base):
    """Horaires d'un jour de la semaine (0 = lundi … 6 = dimanche)."""

    __tablename__ = "opening_hours"
    __table_args__ = (CheckConstraint("weekday BETWEEN 0 AND 6", name="weekday_range"),)

    weekday: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    is_closed: Mapped[bool] = mapped_column(default=False, server_default="false")
    open_time: Mapped[time]
    close_time: Mapped[time]


class Closure(Base):
    """Jour de fermeture exceptionnelle (fête, congés, travaux…).

    Ce jour-là, aucun créneau de retrait ni de réservation n'est proposé,
    quels que soient les horaires habituels de la semaine.
    """

    __tablename__ = "closures"

    day: Mapped[date] = mapped_column(primary_key=True)
    reason: Mapped[str] = mapped_column(String(120), default="", server_default="")


class ShopSettings(Base):
    """Paramètres modifiables par l'admin. Une seule ligne, d'identifiant 1."""

    __tablename__ = "shop_settings"
    __table_args__ = (CheckConstraint("id = 1", name="single_row"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False, default=1)
    # Réservations
    seating_capacity: Mapped[int] = mapped_column(default=30)  # places assises
    reservation_slot_minutes: Mapped[int] = mapped_column(default=30)  # écart entre créneaux
    reservation_duration_minutes: Mapped[int] = mapped_column(default=90)  # durée d'occupation
    max_party_size: Mapped[int] = mapped_column(default=8)
    reservation_days_ahead: Mapped[int] = mapped_column(default=30)
    # Commandes à emporter
    pickup_slot_minutes: Mapped[int] = mapped_column(default=15)
    pickup_min_lead_minutes: Mapped[int] = mapped_column(default=20)  # délai de préparation
    max_orders_per_pickup_slot: Mapped[int] = mapped_column(default=6)
    pickup_days_ahead: Mapped[int] = mapped_column(default=6)
