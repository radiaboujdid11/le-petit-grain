"""Commandes à emporter (paiement sur place au retrait)."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Statuts possibles, dans l'ordre du cycle de vie d'une commande
ORDER_STATUSES = ("pending", "confirmed", "preparing", "ready", "picked_up", "cancelled")

# Changements de statut autorisés (le reste est refusé par l'API)
ORDER_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"preparing", "cancelled"},
    "preparing": {"ready", "cancelled"},
    "ready": {"picked_up", "cancelled"},
    "picked_up": set(),
    "cancelled": set(),
}


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint("total_cents >= 0", name="total_positive"),
        CheckConstraint(f"status IN {ORDER_STATUSES}", name="status_valid"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # Identifiant public impossible à deviner, utilisé dans l'URL de confirmation
    public_id: Mapped[uuid.UUID] = mapped_column(unique=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(12), unique=True)  # ex. « LPG-7K2QX »
    status: Mapped[str] = mapped_column(String(20), default="pending", server_default="pending")
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(30))
    customer_email: Mapped[str] = mapped_column(String(254))
    pickup_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    notes: Mapped[str] = mapped_column(Text, default="", server_default="")
    total_cents: Mapped[int]  # TOUJOURS calculé par le backend
    locale: Mapped[str] = mapped_column(String(2), default="fr")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )


class OrderItem(Base):
    """Ligne de commande. Nom et prix sont COPIÉS au moment de l'achat :
    si le prix change plus tard, l'historique (et le chiffre d'affaires) reste juste."""

    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("quantity > 0", name="quantity_positive"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    # SET NULL : supprimer un produit ne supprime pas l'historique des ventes
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    product_slug: Mapped[str] = mapped_column(String(120))
    product_name_fr: Mapped[str] = mapped_column(String(160))
    product_name_en: Mapped[str] = mapped_column(String(160))
    unit_price_cents: Mapped[int]
    quantity: Mapped[int]
    line_total_cents: Mapped[int]

    order: Mapped[Order] = relationship(back_populates="items")
