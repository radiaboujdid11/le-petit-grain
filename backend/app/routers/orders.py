"""Routes publiques des commandes à emporter."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import AppError
from app.core.i18n import Locale, get_locale
from app.core.rate_limit import form_limiter
from app.core.timezone import now_utc
from app.database import get_db
from app.models import Order
from app.schemas.orders import OrderCreate, OrderOut
from app.services.orders import create_order

router = APIRouter(tags=["commandes"])


@router.post(
    "/orders",
    response_model=OrderOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(form_limiter)],
)
def place_order(data: OrderCreate, db: Session = Depends(get_db), locale: Locale = Depends(get_locale)):
    order = create_order(db, data, locale, now_utc())
    db.commit()
    db.refresh(order)
    return OrderOut.from_model(order, locale)


@router.get("/orders/{public_id}", response_model=OrderOut)
def get_order(public_id: uuid.UUID, db: Session = Depends(get_db), locale: Locale = Depends(get_locale)):
    order = db.scalar(
        select(Order).where(Order.public_id == public_id).options(selectinload(Order.items))
    )
    if order is None:
        raise AppError("ORDER_NOT_FOUND", 404)
    return OrderOut.from_model(order, locale)
