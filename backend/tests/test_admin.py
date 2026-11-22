"""Tests de l'espace admin : connexion, protection des routes, gestion, statistiques."""

from datetime import timedelta

import pytest
from sqlalchemy import select

from app.config import get_settings
from app.core.rate_limit import login_limiter
from app.core.security import hash_password
from app.core.timezone import now_utc
from app.models import AdminUser, Order, OrderItem, Product

ADMIN = {"email": "admin@lepetitgrain.example", "password": "Cafe-Secret-2026"}


@pytest.fixture
def admin_api(api, db_session):
    """Client connecté en admin."""
    db_session.add(AdminUser(email=ADMIN["email"], password_hash=hash_password(ADMIN["password"])))
    db_session.flush()
    assert api.post("/api/v1/admin/auth/login", json=ADMIN).status_code == 200
    return api


def test_mot_de_passe_stocke_hache(db_session):
    hashed = hash_password("secret")
    assert hashed != "secret" and hashed.startswith("$argon2")


def test_routes_admin_protegees(api):
    for path in ["/api/v1/admin/stats", "/api/v1/admin/orders", "/api/v1/admin/products", "/api/v1/admin/settings"]:
        response = api.get(path)
        assert response.status_code == 401
        assert response.json()["code"] == "NOT_AUTHENTICATED"


def test_mauvais_mot_de_passe(api, db_session):
    db_session.add(AdminUser(email=ADMIN["email"], password_hash=hash_password(ADMIN["password"])))
    db_session.flush()
    response = api.post("/api/v1/admin/auth/login", json=ADMIN | {"password": "faux"})
    assert response.status_code == 401
    assert response.json()["code"] == "INVALID_CREDENTIALS"


def test_connexion_cookie_httponly_puis_deconnexion(api, db_session):
    db_session.add(AdminUser(email=ADMIN["email"], password_hash=hash_password(ADMIN["password"])))
    db_session.flush()
    response = api.post("/api/v1/admin/auth/login", json=ADMIN)
    cookie_header = response.headers["set-cookie"].lower()
    assert "httponly" in cookie_header and "samesite=lax" in cookie_header
    assert api.get("/api/v1/admin/auth/me").json()["email"] == ADMIN["email"]

    api.post("/api/v1/admin/auth/logout")
    assert api.get("/api/v1/admin/auth/me").status_code == 401


def test_limitation_des_tentatives_de_connexion(api):
    settings = get_settings()
    settings.rate_limit_enabled = True
    login_limiter.reset()
    try:
        codes = [api.post("/api/v1/admin/auth/login", json=ADMIN).status_code for _ in range(6)]
        assert codes[:5] == [401] * 5
        assert codes[5] == 429
    finally:
        settings.rate_limit_enabled = False
        login_limiter.reset()


def test_rendre_un_produit_indisponible(admin_api):
    products = admin_api.get("/api/v1/admin/products").json()
    espresso = next(p for p in products if p["slug"] == "espresso")
    patched = admin_api.patch(f"/api/v1/admin/products/{espresso['id']}", json={"is_available": False})
    assert patched.json()["is_available"] is False
    assert admin_api.get("/api/v1/products/espresso").json()["is_available"] is False


def test_slug_deja_pris(admin_api):
    category_id = admin_api.get("/api/v1/admin/categories").json()[0]["id"]
    payload = {"category_id": category_id, "slug": "espresso", "name_fr": "X", "name_en": "X", "price_cents": 100}
    response = admin_api.post("/api/v1/admin/products", json=payload)
    assert response.status_code == 409
    assert response.json()["code"] == "SLUG_TAKEN"


def test_categorie_non_vide_non_supprimable(admin_api):
    category = admin_api.get("/api/v1/admin/categories").json()[0]
    assert category["product_count"] > 0
    assert admin_api.delete(f"/api/v1/admin/categories/{category['id']}").json()["code"] == "CATEGORY_NOT_EMPTY"


def _make_order(db_session, status="pending", total=4400):
    product = db_session.scalar(select(Product).where(Product.slug == "croissant-amandes"))
    order = Order(
        order_number=f"LPG-T{status[:4].upper()}",
        status=status,
        customer_name="Test",
        customer_phone="0612345678",
        customer_email="t@example.com",
        pickup_at=now_utc() - timedelta(hours=1),
        total_cents=total,
    )
    order.items.append(
        OrderItem(product_id=product.id, product_slug=product.slug, product_name_fr=product.name_fr,
                  product_name_en=product.name_en, unit_price_cents=2200, quantity=2, line_total_cents=total)
    )
    db_session.add(order)
    db_session.flush()
    return order


def test_cycle_des_statuts_de_commande(admin_api, db_session):
    order = _make_order(db_session)
    url = f"/api/v1/admin/orders/{order.id}/status"
    # Sauter des étapes est interdit
    assert admin_api.patch(url, json={"status": "picked_up"}).json()["code"] == "INVALID_STATUS_TRANSITION"
    for step in ["confirmed", "preparing", "ready", "picked_up"]:
        assert admin_api.patch(url, json={"status": step}).json()["status"] == step
    # Une commande récupérée ne peut plus changer
    assert admin_api.patch(url, json={"status": "cancelled"}).status_code == 409


def test_statistiques_ne_comptent_que_les_commandes_recuperees(admin_api, db_session):
    _make_order(db_session, status="picked_up", total=4400)
    _make_order(db_session, status="cancelled", total=9900)
    stats = admin_api.get("/api/v1/admin/stats", params={"days": 7}).json()
    assert stats["total_revenue_cents"] == 4400
    assert stats["orders_count"] == 1
    assert stats["average_basket_cents"] == 4400
    assert stats["top_products"][0]["name"] == "Croissant aux amandes"
    assert len(stats["revenue_by_day"]) == 7


def test_reglages_et_horaires(admin_api):
    current = admin_api.get("/api/v1/admin/settings").json()
    current["settings"]["seating_capacity"] = 42
    current["hours"][6]["is_closed"] = True  # fermé le dimanche
    saved = admin_api.put("/api/v1/admin/settings", json=current).json()
    assert saved["settings"]["seating_capacity"] == 42
    assert saved["hours"][6]["is_closed"] is True


def test_message_de_contact_visible_dans_l_admin(admin_api):
    sent = admin_api.post(
        "/api/v1/contact",
        json={"name": "Nadia", "email": "nadia@example.com", "message": "Faites-vous des gâteaux d'anniversaire ?"},
    )
    assert sent.status_code == 201
    messages = admin_api.get("/api/v1/admin/messages").json()
    assert messages[0]["name"] == "Nadia" and messages[0]["is_read"] is False
    read = admin_api.post(f"/api/v1/admin/messages/{messages[0]['id']}/read").json()
    assert read["is_read"] is True
