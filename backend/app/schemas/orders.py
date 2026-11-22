"""Commandes : ce que le navigateur envoie, et ce que l'API renvoie."""

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import AwareDatetime, BaseModel, Field

from app.models import Order
from app.schemas.common import CustomerName, Email, Notes, Phone


class CartItemIn(BaseModel):
    slug: str = Field(max_length=120)
    quantity: Annotated[int, Field(ge=1, le=20)]  # 1 à 20 par article


class OrderCreate(BaseModel):
    # AUCUN prix ici : seulement des slugs et des quantités
    items: Annotated[list[CartItemIn], Field(max_length=30)]
    pickup_at: AwareDatetime  # créneau choisi (avec fuseau)
    customer_name: CustomerName
    customer_phone: Phone
    customer_email: Email
    notes: Notes = ""


class OrderItemOut(BaseModel):
    slug: str
    name: str
    unit_price_cents: int
    quantity: int
    line_total_cents: int


class OrderOut(BaseModel):
    public_id: uuid.UUID
    order_number: str
    status: str
    pickup_at: datetime
    customer_name: str
    total_cents: int
    items: list[OrderItemOut]
    created_at: datetime

    @classmethod
    def from_model(cls, order: Order, locale: str) -> "OrderOut":
        return cls(
            public_id=order.public_id,
            order_number=order.order_number,
            status=order.status,
            pickup_at=order.pickup_at,
            customer_name=order.customer_name,
            total_cents=order.total_cents,
            created_at=order.created_at,
            items=[
                OrderItemOut(
                    slug=i.product_slug,
                    name=i.product_name_en if locale == "en" else i.product_name_fr,
                    unit_price_cents=i.unit_price_cents,
                    quantity=i.quantity,
                    line_total_cents=i.line_total_cents,
                )
                for i in order.items
            ],
        )


class SlotOut(BaseModel):
    start: datetime
    label: str
    available: bool
