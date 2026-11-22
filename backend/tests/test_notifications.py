"""Tests des e-mails : le café est prévenu, le client reçoit sa confirmation (si activé),
et un échec d'envoi ne fait jamais échouer la commande ou la réservation."""

import pytest

from app.config import get_settings
from app.services import notifications
from tests.test_orders import CUSTOMER, order_payload
from tests.test_reservations import GUEST, slots

SHOP = "cafe@example.com"


@pytest.fixture
def mailbox(monkeypatch):
    """Active les e-mails avec une fausse clé et capture ce qui serait envoyé."""
    settings = get_settings()
    monkeypatch.setattr(settings, "resend_api_key", "re_test")
    monkeypatch.setattr(settings, "notify_email", SHOP)
    monkeypatch.setattr(settings, "customer_emails", False)
    sent: list[dict] = []
    monkeypatch.setattr(notifications, "_post", lambda payload, key: sent.append(payload))
    return sent


def test_sans_cle_aucun_envoi(api, monkeypatch):
    calls = []
    monkeypatch.setattr(notifications, "_post", lambda payload, key: calls.append(payload))
    monkeypatch.setattr(get_settings(), "resend_api_key", None)
    assert notifications.send_email("x@example.com", "Sujet", "<p>ok</p>") is False
    assert calls == []


def test_nouvelle_commande_previent_le_cafe(api, mailbox):
    response = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "croissant-amandes", "quantity": 2}]))
    assert response.status_code == 201
    number = response.json()["order_number"]

    assert len(mailbox) == 1  # confirmations client désactivées par défaut
    mail = mailbox[0]
    assert mail["to"] == [SHOP] and number in mail["subject"]
    assert mail["reply_to"] == CUSTOMER["customer_email"]
    assert "2 × " in mail["html"] and CUSTOMER["customer_phone"].replace(" ", "")[:4] in mail["html"].replace(" ", "")


def test_confirmation_client_si_activee(api, mailbox, monkeypatch):
    monkeypatch.setattr(get_settings(), "customer_emails", True)
    api.post("/api/v1/orders", json=order_payload(api, [{"slug": "croissant-amandes", "quantity": 1}]))
    assert [m["to"] for m in mailbox] == [[SHOP], [CUSTOMER["customer_email"]]]
    assert "/fr/order/" in mailbox[1]["html"]


def test_reservation_creee_modifiee_annulee(api, mailbox, monkeypatch):
    monkeypatch.setattr(get_settings(), "customer_emails", True)
    available = [s for s in slots(api) if s["available"]]
    created = api.post("/api/v1/reservations", json={"start_at": available[0]["start"], "party_size": 2, **GUEST}).json()
    token = created["manage_token"]
    # Café + client ; le client reçoit le lien de gestion
    assert [m["to"] for m in mailbox] == [[SHOP], [GUEST["customer_email"]]]
    assert f"/reservation/manage/{token}" in mailbox[1]["html"]

    api.patch(f"/api/v1/reservations/manage/{token}", json={"start_at": available[1]["start"], "party_size": 3})
    api.post(f"/api/v1/reservations/manage/{token}/cancel")
    assert "modifiée" in mailbox[2]["subject"] and "annulée" in mailbox[3]["subject"]


def test_message_de_contact(api, mailbox):
    api.post("/api/v1/contact", json={"name": "Nora", "email": "nora@example.com", "message": "Avez-vous des gâteaux sans gluten ?"})
    assert mailbox[0]["to"] == [SHOP] and mailbox[0]["reply_to"] == "nora@example.com"


def test_texte_client_echappe(api, mailbox):
    # Un nom piégé ne doit pas injecter de HTML dans l'e-mail du café
    api.post("/api/v1/contact", json={"name": "<b>Pirate</b>", "email": "p@example.com", "message": "<script>alert(1)</script> bonjour"})
    assert "<script>" not in mailbox[0]["html"] and "&lt;script&gt;" in mailbox[0]["html"]


def test_echec_d_envoi_ne_bloque_pas_la_commande(api, monkeypatch):
    monkeypatch.setattr(get_settings(), "resend_api_key", "re_test")
    monkeypatch.setattr(get_settings(), "notify_email", SHOP)

    def broken(payload, key):
        raise TimeoutError("Resend injoignable")

    monkeypatch.setattr(notifications, "_post", broken)
    response = api.post("/api/v1/orders", json=order_payload(api, [{"slug": "croissant-amandes", "quantity": 1}]))
    assert response.status_code == 201
