"""Schémas de l'espace admin : les deux langues sont visibles et modifiables."""

from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=120)]
Text120 = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]


class LoginIn(BaseModel):
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=1, max_length=200)]


class AdminMe(BaseModel):
    email: str


# ---------- Catalogue

class CategoryAdminIn(BaseModel):
    slug: Slug
    name_fr: Text120
    name_en: Text120
    sort_order: int = 0
    is_active: bool = True


class CategoryAdminOut(CategoryAdminIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_count: int = 0


class ProductAdminIn(BaseModel):
    category_id: int
    slug: Slug
    name_fr: Text120
    name_en: Text120
    description_fr: Annotated[str, Field(max_length=1000)] = ""
    description_en: Annotated[str, Field(max_length=1000)] = ""
    price_cents: Annotated[int, Field(ge=0, le=1_000_000)]
    image_url: Annotated[str, Field(max_length=500)] | None = None
    is_available: bool = True
    is_bestseller: bool = False
    is_vegetarian: bool = False
    contains_nuts: bool = False
    contains_gluten: bool = False
    sort_order: int = 0


class ProductAdminPatch(BaseModel):
    """Modification partielle : seuls les champs envoyés sont changés."""

    category_id: int | None = None
    slug: Slug | None = None
    name_fr: Text120 | None = None
    name_en: Text120 | None = None
    description_fr: Annotated[str, Field(max_length=1000)] | None = None
    description_en: Annotated[str, Field(max_length=1000)] | None = None
    price_cents: Annotated[int, Field(ge=0, le=1_000_000)] | None = None
    image_url: Annotated[str, Field(max_length=500)] | None = None
    is_available: bool | None = None
    is_bestseller: bool | None = None
    is_vegetarian: bool | None = None
    contains_nuts: bool | None = None
    contains_gluten: bool | None = None
    sort_order: int | None = None


class ProductAdminOut(ProductAdminIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Commandes et réservations

OrderStatus = Literal["pending", "confirmed", "preparing", "ready", "picked_up", "cancelled"]


class OrderStatusIn(BaseModel):
    status: OrderStatus


class OrderItemAdmin(BaseModel):
    name: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int


class OrderAdminOut(BaseModel):
    id: int
    order_number: str
    status: str
    pickup_at: datetime
    customer_name: str
    customer_phone: str
    customer_email: str
    notes: str
    total_cents: int
    created_at: datetime
    items: list[OrderItemAdmin]
    allowed_statuses: list[str]  # statuts possibles à partir du statut actuel


class ReservationAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    status: str
    start_at: datetime
    end_at: datetime
    party_size: int
    customer_name: str
    customer_phone: str
    customer_email: str
    notes: str


# ---------- Tableau de bord

class DayRevenue(BaseModel):
    date: date
    revenue_cents: int
    orders: int


class TopProduct(BaseModel):
    name: str
    quantity: int
    revenue_cents: int


class HourCount(BaseModel):
    hour: int
    orders: int


class Stats(BaseModel):
    days: int
    total_revenue_cents: int
    orders_count: int
    average_basket_cents: int
    revenue_by_day: list[DayRevenue]
    top_products: list[TopProduct]
    peak_hours: list[HourCount]
    reservations_count: int
    guests_count: int
    reservation_fill_rate: float  # 0 à 1
    pending_orders: int
    unread_messages: int
