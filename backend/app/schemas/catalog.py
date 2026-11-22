"""Réponses publiques du menu.

On ne renvoie PAS directement les modèles de la base : le schéma choisit les champs
visibles et ne donne qu'une langue (name au lieu de name_fr / name_en).
"""

from pydantic import BaseModel

from app.core.i18n import Locale
from app.models import Category, Product


class CategoryOut(BaseModel):
    slug: str
    name: str

    @classmethod
    def from_model(cls, category: Category, locale: Locale) -> "CategoryOut":
        return cls(slug=category.slug, name=getattr(category, f"name_{locale}"))


class ProductOut(BaseModel):
    slug: str
    name: str
    description: str
    price_cents: int  # le frontend formate : 2500 → « 25,00 DH » / « 25.00 MAD »
    image_url: str | None
    category: CategoryOut
    is_available: bool
    is_bestseller: bool
    is_vegetarian: bool
    contains_nuts: bool
    contains_gluten: bool

    @classmethod
    def from_model(cls, product: Product, locale: Locale) -> "ProductOut":
        # getattr(product, "name_fr") = product.name_fr : on choisit la colonne selon la langue
        return cls(
            slug=product.slug,
            name=getattr(product, f"name_{locale}"),
            description=getattr(product, f"description_{locale}"),
            price_cents=product.price_cents,
            image_url=product.image_url,
            category=CategoryOut.from_model(product.category, locale),
            is_available=product.is_available,
            is_bestseller=product.is_bestseller,
            is_vegetarian=product.is_vegetarian,
            contains_nuts=product.contains_nuts,
            contains_gluten=product.contains_gluten,
        )
