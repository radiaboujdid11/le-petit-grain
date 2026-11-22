"""Tous les modèles (tables). Les importer ici permet à Alembic de tous les « voir »."""

from app.models.admin import AdminSession, AdminUser, ContactMessage
from app.models.catalog import Category, Product
from app.models.orders import ORDER_STATUSES, ORDER_TRANSITIONS, Order, OrderItem
from app.models.reservations import Reservation
from app.models.shop import OpeningHours, ShopSettings

__all__ = [
    "AdminSession",
    "AdminUser",
    "Category",
    "ContactMessage",
    "ORDER_STATUSES",
    "ORDER_TRANSITIONS",
    "OpeningHours",
    "Order",
    "OrderItem",
    "Product",
    "Reservation",
    "ShopSettings",
]
