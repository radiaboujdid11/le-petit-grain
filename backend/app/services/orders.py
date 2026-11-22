"""Création d'une commande à emporter.

Règle de sécurité n° 1 : le navigateur n'envoie que des slugs et des quantités.
Les PRIX sont lus en base et le total est recalculé ici : impossible de « tricher ».
"""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import AppError
from app.core.security import short_reference
from app.models import Category, Order, OrderItem, Product
from app.schemas.orders import OrderCreate
from app.services.schedule import get_settings, is_valid_pickup


def _unique_order_number(db: Session) -> str:
    while True:
        number = short_reference("LPG")
        if db.scalar(select(Order.id).where(Order.order_number == number)) is None:
            return number


def create_order(db: Session, data: OrderCreate, locale: str, now: datetime) -> Order:
    if not data.items:
        raise AppError("EMPTY_CART", 400)

    # Verrou sur les réglages : les commandes simultanées sont traitées une par une,
    # le nombre maximal de commandes par créneau est donc toujours respecté.
    get_settings(db, lock=True)

    # Regroupe les quantités par produit (si le même slug apparaît deux fois)
    quantities: dict[str, int] = {}
    for item in data.items:
        quantities[item.slug] = quantities.get(item.slug, 0) + item.quantity

    products = {
        p.slug: p
        for p in db.scalars(
            select(Product)
            .join(Product.category)
            .where(Product.slug.in_(quantities), Category.is_active)
            .options(joinedload(Product.category))
        )
    }
    if len(products) != len(quantities) or not all(p.is_available for p in products.values()):
        raise AppError("PRODUCT_UNAVAILABLE", 409)

    if not is_valid_pickup(db, data.pickup_at, now):
        raise AppError("INVALID_PICKUP_SLOT", 409)

    order = Order(
        order_number=_unique_order_number(db),
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        pickup_at=data.pickup_at,
        notes=data.notes,
        locale=locale,
        total_cents=0,
    )
    for slug, quantity in quantities.items():
        product = products[slug]
        line_total = product.price_cents * quantity  # prix de la BASE, pas du navigateur
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_slug=product.slug,
                product_name_fr=product.name_fr,
                product_name_en=product.name_en,
                unit_price_cents=product.price_cents,
                quantity=quantity,
                line_total_cents=line_total,
            )
        )
        order.total_cents += line_total

    db.add(order)
    db.flush()
    return order
