"""Routes publiques : infos boutique, créneaux disponibles, formulaire de contact."""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.i18n import Locale, get_locale
from app.core.rate_limit import form_limiter
from app.core.timezone import now_utc, to_local
from app.database import get_db
from app.models import Closure, ContactMessage, OpeningHours
from app.schemas.orders import SlotOut
from app.schemas.shop import ClosureOut, ContactIn, OpeningHoursOut, ShopInfo
from app.services import notifications
from app.services.schedule import get_settings, pickup_slots, reservation_slots

router = APIRouter(tags=["boutique"])


@router.get("/shop/info", response_model=ShopInfo)
def shop_info(db: Session = Depends(get_db)):
    settings = get_settings(db)
    hours = db.scalars(select(OpeningHours).order_by(OpeningHours.weekday))
    today = to_local(now_utc()).date()
    closures = db.scalars(select(Closure).where(Closure.day >= today).order_by(Closure.day).limit(20))
    return ShopInfo(
        hours=[OpeningHoursOut.model_validate(h) for h in hours],
        closures=[ClosureOut.model_validate(c) for c in closures],
        max_party_size=settings.max_party_size,
        reservation_days_ahead=settings.reservation_days_ahead,
        pickup_days_ahead=settings.pickup_days_ahead,
    )


def _days_from_today(day: date) -> int:
    return (day - to_local(now_utc()).date()).days


@router.get("/pickup-slots", response_model=list[SlotOut])
def list_pickup_slots(day: Annotated[date, Query(alias="date")], db: Session = Depends(get_db)):
    if not 0 <= _days_from_today(day) <= get_settings(db).pickup_days_ahead:
        return []
    return [SlotOut(**vars(s)) for s in pickup_slots(db, day, now_utc())]


@router.get("/reservations/availability", response_model=list[SlotOut])
def reservation_availability(
    day: Annotated[date, Query(alias="date")],
    party_size: Annotated[int, Query(ge=1, le=20)],
    db: Session = Depends(get_db),
):
    settings = get_settings(db)
    if not 0 <= _days_from_today(day) <= settings.reservation_days_ahead or party_size > settings.max_party_size:
        return []
    return [SlotOut(**vars(s)) for s in reservation_slots(db, day, party_size, now_utc())]


@router.post("/contact", status_code=status.HTTP_201_CREATED, dependencies=[Depends(form_limiter)])
def send_contact_message(
    data: ContactIn, db: Session = Depends(get_db), locale: Locale = Depends(get_locale)
):
    db.add(ContactMessage(name=data.name, email=data.email, message=data.message, locale=locale))
    db.commit()
    notifications.contact_received(data.name, data.email, data.message)
    return {"status": "received"}
