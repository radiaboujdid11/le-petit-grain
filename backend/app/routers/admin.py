"""Espace admin (préfixe /api/v1/admin). TOUTES les routes, sauf la connexion,
exigent une session valide (dépendance require_admin)."""

from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.auth import close_session, open_session, require_admin
from app.core.errors import AppError
from app.core.rate_limit import login_limiter
from app.core.security import verify_password
from app.core.timezone import local_datetime, now_utc
from app.database import get_db
from app.models import (
    ORDER_TRANSITIONS,
    AdminUser,
    Category,
    ContactMessage,
    OpeningHours,
    Order,
    Product,
    Reservation,
)
from app.schemas.admin import (
    AdminMe,
    CategoryAdminIn,
    CategoryAdminOut,
    LoginIn,
    OrderAdminOut,
    OrderItemAdmin,
    OrderStatusIn,
    ProductAdminIn,
    ProductAdminOut,
    ProductAdminPatch,
    ReservationAdminOut,
    Stats,
)
from app.schemas.shop import AdminSettings, AdminSettingsIn, ContactOut, OpeningHoursOut, SettingsOut
from app.services.schedule import get_settings
from app.services.stats import compute_stats

router = APIRouter(prefix="/admin", tags=["admin"])
protected = [Depends(require_admin)]


# ------------------------------------------------------------------ Connexion

@router.post("/auth/login", response_model=AdminMe, dependencies=[Depends(login_limiter)])
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    admin = db.scalar(select(AdminUser).where(AdminUser.email == data.email.lower()))
    # Même message que l'e-mail existe ou non : on ne révèle pas quels comptes existent
    if admin is None or not verify_password(admin.password_hash, data.password):
        raise AppError("INVALID_CREDENTIALS", 401)
    open_session(db, response, admin)
    return AdminMe(email=admin.email)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    close_session(db, request, response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/auth/me", response_model=AdminMe)
def me(admin: AdminUser = Depends(require_admin)):
    return AdminMe(email=admin.email)


# ------------------------------------------------------------------ Tableau de bord

@router.get("/stats", response_model=Stats, dependencies=protected)
def stats(days: Annotated[int, Query(ge=7, le=365)] = 30, db: Session = Depends(get_db)):
    return compute_stats(db, days, now_utc())


# ------------------------------------------------------------------ Catégories

def _category_out(db: Session, c: Category) -> CategoryAdminOut:
    count = db.scalar(select(func.count()).select_from(Product).where(Product.category_id == c.id))
    return CategoryAdminOut.model_validate(c).model_copy(update={"product_count": count})


@router.get("/categories", response_model=list[CategoryAdminOut], dependencies=protected)
def list_categories(db: Session = Depends(get_db)):
    return [_category_out(db, c) for c in db.scalars(select(Category).order_by(Category.sort_order))]


@router.post("/categories", response_model=CategoryAdminOut, status_code=201, dependencies=protected)
def create_category(data: CategoryAdminIn, db: Session = Depends(get_db)):
    category = Category(**data.model_dump())
    _save(db, category)
    return _category_out(db, category)


@router.put("/categories/{category_id}", response_model=CategoryAdminOut, dependencies=protected)
def update_category(category_id: int, data: CategoryAdminIn, db: Session = Depends(get_db)):
    category = _get(db, Category, category_id)
    for key, value in data.model_dump().items():
        setattr(category, key, value)
    _save(db, category)
    return _category_out(db, category)


@router.delete("/categories/{category_id}", status_code=204, dependencies=protected)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = _get(db, Category, category_id)
    if db.scalar(select(func.count()).select_from(Product).where(Product.category_id == category_id)):
        raise AppError("CATEGORY_NOT_EMPTY", 409)
    db.delete(category)
    db.commit()


# ------------------------------------------------------------------ Produits

@router.get("/products", response_model=list[ProductAdminOut], dependencies=protected)
def list_products(db: Session = Depends(get_db)):
    query = select(Product).join(Product.category).order_by(Category.sort_order, Product.sort_order)
    return list(db.scalars(query))


@router.post("/products", response_model=ProductAdminOut, status_code=201, dependencies=protected)
def create_product(data: ProductAdminIn, db: Session = Depends(get_db)):
    _get(db, Category, data.category_id)
    product = Product(**data.model_dump())
    _save(db, product)
    return product


@router.patch("/products/{product_id}", response_model=ProductAdminOut, dependencies=protected)
def update_product(product_id: int, data: ProductAdminPatch, db: Session = Depends(get_db)):
    product = _get(db, Product, product_id)
    changes = data.model_dump(exclude_unset=True)  # seulement les champs envoyés
    if "category_id" in changes:
        _get(db, Category, changes["category_id"])
    for key, value in changes.items():
        setattr(product, key, value)
    _save(db, product)
    return product


@router.delete("/products/{product_id}", status_code=204, dependencies=protected)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db.delete(_get(db, Product, product_id))  # l'historique des ventes est conservé (SET NULL)
    db.commit()


# ------------------------------------------------------------------ Commandes

def _order_out(order: Order) -> OrderAdminOut:
    return OrderAdminOut(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        pickup_at=order.pickup_at,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_email=order.customer_email,
        notes=order.notes,
        total_cents=order.total_cents,
        created_at=order.created_at,
        items=[
            OrderItemAdmin(
                name=i.product_name_fr,
                quantity=i.quantity,
                unit_price_cents=i.unit_price_cents,
                line_total_cents=i.line_total_cents,
            )
            for i in order.items
        ],
        allowed_statuses=sorted(ORDER_TRANSITIONS[order.status]),
    )


def _day_range(day: date) -> tuple[datetime, datetime]:
    start = local_datetime(day, datetime.min.time())
    return start, start + timedelta(days=1)


@router.get("/orders", response_model=list[OrderAdminOut], dependencies=protected)
def list_orders(
    day: Annotated[date | None, Query(alias="date")] = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    db: Session = Depends(get_db),
):
    query = select(Order).options(selectinload(Order.items)).order_by(Order.pickup_at)
    if day:
        start, end = _day_range(day)
        query = query.where(Order.pickup_at >= start, Order.pickup_at < end)
    if status_filter:
        query = query.where(Order.status == status_filter)
    return [_order_out(o) for o in db.scalars(query.limit(300))]


@router.patch("/orders/{order_id}/status", response_model=OrderAdminOut, dependencies=protected)
def change_order_status(order_id: int, data: OrderStatusIn, db: Session = Depends(get_db)):
    order = _get(db, Order, order_id)
    if data.status not in ORDER_TRANSITIONS[order.status]:
        raise AppError("INVALID_STATUS_TRANSITION", 409)
    order.status = data.status
    db.commit()
    return _order_out(order)


# ------------------------------------------------------------------ Réservations

@router.get("/reservations", response_model=list[ReservationAdminOut], dependencies=protected)
def list_reservations(day: Annotated[date | None, Query(alias="date")] = None, db: Session = Depends(get_db)):
    query = select(Reservation).order_by(Reservation.start_at)
    if day:
        start, end = _day_range(day)
        query = query.where(Reservation.start_at >= start, Reservation.start_at < end)
    return list(db.scalars(query.limit(300)))


@router.post("/reservations/{reservation_id}/cancel", response_model=ReservationAdminOut, dependencies=protected)
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = _get(db, Reservation, reservation_id)
    reservation.status = "cancelled"
    db.commit()
    return reservation


# ------------------------------------------------------------------ Réglages

def _settings_out(db: Session) -> AdminSettings:
    hours = db.scalars(select(OpeningHours).order_by(OpeningHours.weekday))
    return AdminSettings(
        settings=SettingsOut.model_validate(get_settings(db)),
        hours=[OpeningHoursOut.model_validate(h) for h in hours],
    )


@router.get("/settings", response_model=AdminSettings, dependencies=protected)
def read_settings(db: Session = Depends(get_db)):
    return _settings_out(db)


@router.put("/settings", response_model=AdminSettings, dependencies=protected)
def write_settings(data: AdminSettingsIn, db: Session = Depends(get_db)):
    settings = get_settings(db, lock=True)
    for key, value in data.settings.model_dump().items():
        setattr(settings, key, value)
    for item in data.hours:
        hours = db.get(OpeningHours, item.weekday) or OpeningHours(weekday=item.weekday)
        hours.is_closed, hours.open_time, hours.close_time = item.is_closed, item.open_time, item.close_time
        if not item.is_closed and item.close_time <= item.open_time:
            raise AppError("VALIDATION_ERROR", 422)
        db.add(hours)
    db.commit()
    return _settings_out(db)


# ------------------------------------------------------------------ Messages de contact

@router.get("/messages", response_model=list[ContactOut], dependencies=protected)
def list_messages(db: Session = Depends(get_db)):
    return list(db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(200)))


@router.post("/messages/{message_id}/read", response_model=ContactOut, dependencies=protected)
def mark_read(message_id: int, db: Session = Depends(get_db)):
    message = _get(db, ContactMessage, message_id)
    message.is_read = True
    db.commit()
    return message


# ------------------------------------------------------------------ Outils

def _get(db: Session, model, item_id: int):
    item = db.get(model, item_id)
    if item is None:
        raise AppError("NOT_FOUND", 404)
    return item


def _save(db: Session, item) -> None:
    """Enregistre ; un slug déjà pris (contrainte unique) devient une erreur claire."""
    db.add(item)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if "slug" in str(error.orig):
            raise AppError("SLUG_TAKEN", 409) from error
        raise
    db.refresh(item)
