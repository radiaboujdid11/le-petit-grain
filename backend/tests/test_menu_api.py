"""Tests des routes publiques du menu, avec le vrai menu (scripts/seed_menu.py)."""

import pytest
from sqlalchemy import func, select

from app.database import get_db
from app.models import Category, Product
from scripts.seed_menu import CATEGORIES, PRODUCTS, seed_menu


@pytest.fixture
def api(client, db_session):
    """Client dont l'API utilise la session de test (transaction annulée après le test)."""
    seed_menu(db_session)
    client.app.dependency_overrides[get_db] = lambda: db_session
    return client


# ---------- Catégories ----------

def test_categories_dans_l_ordre_et_en_francais(api):
    data = api.get("/api/v1/categories", headers={"Accept-Language": "fr"}).json()
    assert [c["slug"] for c in data] == [slug for slug, _, _ in CATEGORIES]
    assert data[0] == {"slug": "coffee", "name": "Cafés"}


def test_categories_en_anglais(api):
    data = api.get("/api/v1/categories", headers={"Accept-Language": "en"}).json()
    assert data[0]["name"] == "Coffee"


def test_categorie_inactive_masquee_avec_ses_produits(api, db_session):
    db_session.scalar(select(Category).where(Category.slug == "bakery")).is_active = False
    db_session.flush()

    slugs = [c["slug"] for c in api.get("/api/v1/categories").json()]
    assert "bakery" not in slugs
    products = api.get("/api/v1/products").json()
    assert all(p["category"]["slug"] != "bakery" for p in products)
    assert api.get("/api/v1/products/msemen").status_code == 404


# ---------- Liste des produits ----------

def test_tous_les_produits(api):
    assert len(api.get("/api/v1/products").json()) == len(PRODUCTS)


def test_filtre_par_categorie(api):
    data = api.get("/api/v1/products", params={"category": "croissants"}).json()
    assert len(data) == 5
    assert {p["category"]["slug"] for p in data} == {"croissants"}


def test_filtre_best_sellers(api):
    data = api.get("/api/v1/products", params={"bestseller": "true"}).json()
    assert {p["slug"] for p in data} == {
        "croissant-chocolat", "fondant-chocolat", "brownie-fondant", "cupcake-mure",
    }


def test_filtre_sans_fruits_a_coque(api):
    data = api.get("/api/v1/products", params={"nut_free": "true"}).json()
    assert data and all(p["contains_nuts"] is False for p in data)
    assert "croissant-amandes" not in {p["slug"] for p in data}


def test_tri_par_prix_croissant_et_decroissant(api):
    asc = [p["price_cents"] for p in api.get("/api/v1/products", params={"sort": "price_asc"}).json()]
    desc = [p["price_cents"] for p in api.get("/api/v1/products", params={"sort": "price_desc"}).json()]
    assert asc == sorted(asc)
    assert desc == sorted(desc, reverse=True)


def test_tri_inconnu_refuse(api):
    assert api.get("/api/v1/products", params={"sort": "n_importe_quoi"}).status_code == 422


def test_produit_en_rupture_reste_liste(api, db_session):
    db_session.scalar(select(Product).where(Product.slug == "msemen")).is_available = False
    db_session.flush()
    product = api.get("/api/v1/products/msemen").json()
    assert product["is_available"] is False


# ---------- Fiche produit ----------

def test_fiche_produit_en_anglais(api):
    data = api.get("/api/v1/products/croissant-amandes", headers={"Accept-Language": "en"}).json()
    assert data["name"] == "Almond croissant"
    assert data["price_cents"] == 2200
    assert data["category"] == {"slug": "croissants", "name": "Croissants"}
    assert data["contains_nuts"] is True


def test_produit_introuvable_message_en_francais(api):
    response = api.get("/api/v1/products/licorne", headers={"Accept-Language": "fr"})
    assert response.status_code == 404
    assert response.json() == {
        "code": "PRODUCT_NOT_FOUND",
        "message": "Ce produit n'existe pas ou n'est plus proposé.",
    }


def test_produit_introuvable_message_en_anglais(api):
    response = api.get("/api/v1/products/licorne", headers={"Accept-Language": "en"})
    assert response.json()["message"].startswith("This product does not exist")


# ---------- Script de remplissage ----------

def test_seed_idempotent(db_session):
    seed_menu(db_session)
    seed_menu(db_session)  # deuxième passage : aucun doublon
    assert db_session.scalar(select(func.count()).select_from(Category)) == len(CATEGORIES)
    assert db_session.scalar(select(func.count()).select_from(Product)) == len(PRODUCTS)
