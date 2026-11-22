"""Tests des commandes à emporter : prix recalculés, créneaux, disponibilité, validation."""

from datetime import timedelta

import pytest
from sqlalchemy import select

from app.core.timezone import today_local
from app.models import Product, ShopSettings

CUSTOMER = {
    "customer_name": "Salma Bennani",
    "customer_phone": "06 12 34 56 78",
    "customer_email": "salma@example.com",
}


def first_free_slot(api, days_ahead: int = 2) -> str:
    day = (today_local() + timedelta(days=days_ahead)).isoformat()
    slots = api.get("/api/v1/pickup-slots", params={"date": day}).json()
    assert slots, "aucun créneau : vérifier les horaires"
    return next(s["start"] for s in slots if s["available"])


def order_payload(api, items, **overrides):
    return {"items": items, "pickup_at": first_free_slot(api), **CUSTOMER} | overrides


def test_creneaux_de_retrait(api):
    day = (today_local() + timedelta(days=2)).isoformat()
    slots = api.get("/api/v1/pickup-slots", params={"date": day}).json()
    # Toutes les 15 min, entre l'ouverture (+20 min) et 15 min avant la fermeture
    assert slots[0]["label"] in {"07:50", "08:00", "08:15", "08:30"}
    assert all(s["available"] for s in slots)


def test_creneaux_hors_periode_vides(api):
    far = (today_local() + timedelta(days=60)).isoformat()
    assert api.get("/api/v1/pickup-slots", params={"date": far}).json() == []


def test_le_prix_est_recalcule_par_le_backend(api):
    # Le navigateur tente d'envoyer un faux prix : il est IGNORÉ
    items = [
        {"slug": "croissant-amandes", "quantity": 2, "price_cents": 1},
        {"slug": "espresso", "quantity": 1},
    ]
    response = api.post("/api/v1/orders", json=order_payload(api, items))
    assert response.status_code == 201, response.json()
    order = response.json()
    assert order["total_cents"] == 2 * 2200 + 1500
    assert order["status"] == "pending"
    assert order["order_number"].startswith("LPG-")
    assert {i["slug"]: i["quantity"] for i in order["items"]} == {"croissant-amandes": 2, "espresso": 1}


def test_suivi_de_commande_par_identifiant_public(api):
    created = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "msemen", "quantity": 3}])).json()
    fetched = api.get(f"/api/v1/orders/{created['public_id']}", headers={"Accept-Language": "en"}).json()
    assert fetched["order_number"] == created["order_number"]
    assert fetched["items"][0]["name"] == "Msemen"


def test_commande_inconnue_404(api):
    response = api.get("/api/v1/orders/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.json()["code"] == "ORDER_NOT_FOUND"


def test_produit_epuise_refuse(api, db_session):
    db_session.scalar(select(Product).where(Product.slug == "espresso")).is_available = False
    db_session.flush()
    response = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "espresso", "quantity": 1}]))
    assert response.status_code == 409
    assert response.json()["code"] == "PRODUCT_UNAVAILABLE"


def test_produit_inconnu_refuse(api):
    response = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "licorne", "quantity": 1}]))
    assert response.json()["code"] == "PRODUCT_UNAVAILABLE"


def test_panier_vide_refuse(api):
    response = api.post("/api/v1/orders", json=order_payload(api, []))
    assert response.status_code == 400
    assert response.json()["code"] == "EMPTY_CART"


def test_creneau_hors_horaires_refuse(api):
    night = (today_local() + timedelta(days=2)).isoformat() + "T03:00:00+00:00"
    payload = order_payload(api, [{"slug": "espresso", "quantity": 1}], pickup_at=night)
    response = api.post("/api/v1/orders", json=payload)
    assert response.status_code == 409
    assert response.json()["code"] == "INVALID_PICKUP_SLOT"


def test_creneau_complet(api, db_session):
    db_session.get(ShopSettings, 1).max_orders_per_pickup_slot = 1
    db_session.flush()
    payload = order_payload(api, [{"slug": "espresso", "quantity": 1}])
    assert api.post("/api/v1/orders", json=payload).status_code == 201
    second = api.post("/api/v1/orders", json=payload)  # même créneau, désormais plein
    assert second.json()["code"] == "INVALID_PICKUP_SLOT"


@pytest.mark.parametrize(
    ("field", "value"),
    [("customer_email", "pas-un-email"), ("customer_phone", "12"), ("customer_name", "A")],
)
def test_validation_message_clair_en_anglais(api, field, value):
    payload = order_payload(api, [{"slug": "espresso", "quantity": 1}], **{field: value})
    response = api.post("/api/v1/orders", json=payload, headers={"Accept-Language": "en"})
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert body["message"] == "Some information is missing or invalid."
    assert field in body["fields"]


def test_quantite_trop_grande_refusee(api):
    response = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "espresso", "quantity": 99}]))
    assert response.status_code == 422
