"""Routes publiques du menu : catégories, liste des produits (avec filtres), fiche produit.

Seules les catégories ACTIVES (et leurs produits) sont visibles.
Les produits en rupture restent listés, avec is_available = false (affichés « épuisé »).
"""

from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import AppError
from app.core.i18n import Locale, get_locale
from app.database import get_db
from app.models import Category, Product
from app.schemas.catalog import CategoryOut, ProductOut

router = APIRouter(tags=["menu"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), locale: Locale = Depends(get_locale)):
    query = select(Category).where(Category.is_active).order_by(Category.sort_order, Category.id)
    return [CategoryOut.from_model(c, locale) for c in db.scalars(query)]


@router.get("/products", response_model=list[ProductOut])
def list_products(
    # Paramètres d'URL facultatifs : /products?category=croissants&bestseller=true
    category: str | None = None,
    bestseller: bool | None = None,
    vegetarian: bool | None = None,
    nut_free: bool | None = None,
    # Literal : toute autre valeur est refusée automatiquement (erreur 422)
    sort: Literal["default", "price_asc", "price_desc"] = "default",
    db: Session = Depends(get_db),
    locale: Locale = Depends(get_locale),
):
    query = (
        select(Product)
        .join(Product.category)
        .where(Category.is_active)
        # joinedload : charge la catégorie dans la même requête SQL (évite une requête par produit)
        .options(joinedload(Product.category))
    )
    # Chaque filtre ajoute une condition « WHERE » seulement s'il est demandé
    if category:
        query = query.where(Category.slug == category)
    if bestseller is not None:
        query = query.where(Product.is_bestseller == bestseller)
    if vegetarian:
        query = query.where(Product.is_vegetarian)
    if nut_free:
        query = query.where(Product.contains_nuts.is_(False))

    order = {
        "default": (Category.sort_order, Product.sort_order, Product.id),
        "price_asc": (Product.price_cents, Product.id),
        "price_desc": (Product.price_cents.desc(), Product.id),
    }[sort]
    query = query.order_by(*order)

    return [ProductOut.from_model(p, locale) for p in db.scalars(query)]


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db), locale: Locale = Depends(get_locale)):
    query = (
        select(Product)
        .join(Product.category)
        .where(Product.slug == slug, Category.is_active)
        .options(joinedload(Product.category))
    )
    product = db.scalars(query).first()
    if product is None:
        raise AppError("PRODUCT_NOT_FOUND", status_code=404)
    return ProductOut.from_model(product, locale)
