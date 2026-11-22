"""Routes publiques des réservations, et gestion par lien unique (sans compte client)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.i18n import Locale, get_locale
from app.core.rate_limit import form_limiter
from app.core.timezone import now_utc
from app.database import get_db
from app.services import notifications
from app.schemas.reservations import (
    ReservationCreate,
    ReservationCreated,
    ReservationOut,
    ReservationUpdate,
)
from app.services.reservations import (
    cancel_reservation,
    create_reservation,
    find_by_token,
    update_reservation,
)

router = APIRouter(tags=["réservations"])


@router.post(
    "/reservations",
    response_model=ReservationCreated,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(form_limiter)],
)
def book_table(data: ReservationCreate, db: Session = Depends(get_db), locale: Locale = Depends(get_locale)):
    reservation, token = create_reservation(db, data, locale, now_utc())
    db.commit()
    notifications.reservation_created(reservation, token)
    return ReservationCreated(**ReservationOut.from_model(reservation).model_dump(), manage_token=token)


@router.get("/reservations/manage/{token}", response_model=ReservationOut)
def view_reservation(token: str, db: Session = Depends(get_db)):
    return ReservationOut.from_model(find_by_token(db, token))


@router.patch("/reservations/manage/{token}", response_model=ReservationOut)
def change_reservation(token: str, data: ReservationUpdate, db: Session = Depends(get_db)):
    reservation = find_by_token(db, token)
    update_reservation(db, reservation, data.start_at, data.party_size, now_utc())
    db.commit()
    notifications.reservation_changed(reservation)
    return ReservationOut.from_model(reservation)


@router.post("/reservations/manage/{token}/cancel", response_model=ReservationOut)
def cancel(token: str, db: Session = Depends(get_db)):
    reservation = cancel_reservation(db, find_by_token(db, token))
    db.commit()
    notifications.reservation_changed(reservation, cancelled=True)
    return ReservationOut.from_model(reservation)
