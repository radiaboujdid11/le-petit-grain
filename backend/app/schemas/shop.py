"""Informations publiques de la boutique, réglages et messages de contact."""

from datetime import date, datetime, time
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.schemas.common import CustomerName, Email


class OpeningHoursOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # lecture directe depuis le modèle SQLAlchemy

    weekday: int
    is_closed: bool
    open_time: time
    close_time: time


class ClosureIn(BaseModel):
    day: date
    reason: Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)] = ""


class ClosureOut(ClosureIn):
    model_config = ConfigDict(from_attributes=True)


class ShopInfo(BaseModel):
    hours: list[OpeningHoursOut]
    closures: list[ClosureOut]  # fermetures exceptionnelles à venir
    max_party_size: int
    reservation_days_ahead: int
    pickup_days_ahead: int


class SettingsIn(BaseModel):
    seating_capacity: Annotated[int, Field(ge=1, le=500)]
    reservation_slot_minutes: Annotated[int, Field(ge=10, le=120)]
    reservation_duration_minutes: Annotated[int, Field(ge=15, le=300)]
    max_party_size: Annotated[int, Field(ge=1, le=50)]
    reservation_days_ahead: Annotated[int, Field(ge=1, le=180)]
    pickup_slot_minutes: Annotated[int, Field(ge=5, le=60)]
    pickup_min_lead_minutes: Annotated[int, Field(ge=0, le=240)]
    max_orders_per_pickup_slot: Annotated[int, Field(ge=1, le=100)]
    pickup_days_ahead: Annotated[int, Field(ge=0, le=30)]


class SettingsOut(SettingsIn):
    model_config = ConfigDict(from_attributes=True)


class AdminSettings(BaseModel):
    settings: SettingsOut
    hours: list[OpeningHoursOut]


class AdminSettingsIn(BaseModel):
    settings: SettingsIn
    hours: Annotated[list[OpeningHoursOut], Field(min_length=7, max_length=7)]


class ContactIn(BaseModel):
    name: CustomerName
    email: Email
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=10, max_length=2000)]


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    message: str
    locale: str
    is_read: bool
    created_at: datetime
