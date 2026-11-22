"""Tests des tables du catalogue : les règles sont garanties PAR LA BASE elle-même."""

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy.exc import IntegrityError

from app.database import Base
from app.models import Category, Product


def make_category(**overrides) -> Category:
    """Fabrique une catégorie valide ; on ne précise que ce qui change dans le test."""
    data = {"slug": "croissants", "name_fr": "Croissants", "name_en": "Croissants"}
    return Category(**(data | overrides))


def make_product(category: Category, **overrides) -> Product:
    data = {
        "category": category,
        "slug": "croissant-amandes",
        "name_fr": "Croissant aux amandes",
        "name_en": "Almond croissant",
        "price_cents": 2200,
    }
    return Product(**(data | overrides))


def test_creer_une_categorie_et_un_produit(db_session):
    category = make_category()
    db_session.add(make_product(category))
    db_session.commit()

    product = db_session.query(Product).one()
    assert product.category.slug == "croissants"  # la relation fonctionne
    assert category.products == [product]
    # Valeurs par défaut remplies par la base
    assert product.is_available is True
    assert product.is_bestseller is False
    assert product.description_fr == ""
    assert product.created_at.tzinfo is not None  # date avec fuseau (UTC)


def test_slug_de_produit_unique(db_session):
    category = make_category()
    db_session.add_all([make_product(category), make_product(category, name_fr="Doublon")])
    with pytest.raises(IntegrityError, match="uq_products_slug"):
        db_session.commit()


def test_slug_de_categorie_unique(db_session):
    db_session.add_all([make_category(), make_category(name_fr="Doublon")])
    with pytest.raises(IntegrityError, match="uq_categories_slug"):
        db_session.commit()


def test_prix_negatif_refuse(db_session):
    db_session.add(make_product(make_category(), price_cents=-100))
    with pytest.raises(IntegrityError, match="ck_products_price_positive"):
        db_session.commit()


def test_produit_sans_categorie_refuse(db_session):
    db_session.add(make_product(category=None))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_impossible_de_supprimer_une_categorie_non_vide(db_session):
    category = make_category()
    db_session.add(make_product(category))
    db_session.commit()

    # On supprime directement en SQL pour vérifier la règle de la base (ON DELETE RESTRICT).
    # Une requête SQL directe s'exécute immédiatement : l'erreur arrive dès execute().
    with pytest.raises(IntegrityError, match="fk_products_category_id_categories"):
        db_session.execute(Category.__table__.delete().where(Category.id == category.id))


def test_migrations_a_jour_avec_les_modeles(db_session):
    """Si on modifie un modèle sans créer de migration, ce test échoue."""
    context = MigrationContext.configure(db_session.connection())
    differences = compare_metadata(context, Base.metadata)
    assert differences == []
