"""Tous les modèles (tables). Les importer ici permet à Alembic de tous les « voir »."""

from app.models.catalog import Category, Product

__all__ = ["Category", "Product"]
