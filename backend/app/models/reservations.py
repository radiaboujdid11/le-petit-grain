"""Réservations de table."""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

RESERVATION_STATUSES = ("confirmed", "cancelled")


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        CheckConstraint("party_size > 0", name="party_positive"),
        CheckConstraint("end_at > start_at", name="end_after_start"),
        CheckConstraint(f"status IN {RESERVATION_STATUSES}", name="status_valid"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(12), unique=True)  # ex. « R-4F7KQ »
    # Empreinte (SHA-256) du lien de gestion : le lien lui-même n'est jamais stocké
    manage_token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="confirmed", server_default="confirmed")
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    party_size: Mapped[int]
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(30))
    customer_email: Mapped[str] = mapped_column(String(254))
    notes: Mapped[str] = mapped_column(Text, default="", server_default="")
    locale: Mapped[str] = mapped_column(String(2), default="fr")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
