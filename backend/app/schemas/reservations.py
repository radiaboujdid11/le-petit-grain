"""Réservations de table."""

from datetime import datetime
from typing import Annotated

from pydantic import AwareDatetime, BaseModel, Field

from app.models import Reservation
from app.schemas.common import CustomerName, Email, Notes, Phone


class ReservationCreate(BaseModel):
    start_at: AwareDatetime
    party_size: Annotated[int, Field(ge=1, le=20)]
    customer_name: CustomerName
    customer_phone: Phone
    customer_email: Email
    notes: Notes = ""


class ReservationUpdate(BaseModel):
    start_at: AwareDatetime
    party_size: Annotated[int, Field(ge=1, le=20)]


class ReservationOut(BaseModel):
    reference: str
    status: str
    start_at: datetime
    end_at: datetime
    party_size: int
    customer_name: str

    @classmethod
    def from_model(cls, r: Reservation) -> "ReservationOut":
        return cls(
            reference=r.reference,
            status=r.status,
            start_at=r.start_at,
            end_at=r.end_at,
            party_size=r.party_size,
            customer_name=r.customer_name,
        )


class ReservationCreated(ReservationOut):
    # Jeton du lien de gestion : renvoyé UNE SEULE FOIS, à la création
    manage_token: str
