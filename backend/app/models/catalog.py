"""Tables du catalogue : catégories et produits (schéma : docs/ARCHITECTURE.md, section 4).

Syntaxe SQLAlchemy 2 : « Mapped[int] » indique le type Python de la colonne,
« mapped_column(...) » ses options côté base (unique, valeur par défaut…).
"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)  # ex. « croissants » (URL)
    name_fr: Mapped[str] = mapped_column(String(120))
    name_en: Mapped[str] = mapped_column(String(120))
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")

    # Accès pratique aux produits d'une catégorie : category.products
    products: Mapped[list["Product"]] = relationship(back_populates="category")

    def __repr__(self) -> str:  # affichage lisible pendant le débogage
        return f"<Category {self.slug}>"


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        # Un prix ne peut jamais être négatif : la BASE le refuse, même en cas de bug ailleurs
        CheckConstraint("price_cents >= 0", name="price_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # ondelete="RESTRICT" : impossible de supprimer une catégorie qui contient des produits
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    name_fr: Mapped[str] = mapped_column(String(160))
    name_en: Mapped[str] = mapped_column(String(160))
    description_fr: Mapped[str] = mapped_column(Text, default="", server_default="")
    description_en: Mapped[str] = mapped_column(Text, default="", server_default="")
    price_cents: Mapped[int]  # prix en centimes : 2500 = 25,00 DH
    image_url: Mapped[str | None] = mapped_column(String(500))  # « | None » = facultatif

    # Disponibilité et mise en avant
    is_available: Mapped[bool] = mapped_column(default=True, server_default="true")
    is_bestseller: Mapped[bool] = mapped_column(default=False, server_default="false")
    # Filtres du menu (décision I)
    is_vegetarian: Mapped[bool] = mapped_column(default=False, server_default="false")
    contains_nuts: Mapped[bool] = mapped_column(default=False, server_default="false")
    contains_gluten: Mapped[bool] = mapped_column(default=False, server_default="false")

    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")
    # Dates en UTC (timestamptz), remplies par PostgreSQL lui-même
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category: Mapped[Category] = relationship(back_populates="products")

    def __repr__(self) -> str:
        return f"<Product {self.slug}>"
