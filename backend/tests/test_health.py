"""Tests de la route /api/v1/health.

TestClient simule un navigateur : il appelle l'API sans lancer de vrai serveur.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_repond_ok():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_route_inconnue_renvoie_404():
    response = client.get("/api/v1/nexiste-pas")
    assert response.status_code == 404


def test_cors_autorise_le_frontend():
    # Le navigateur envoie une requête « preflight » OPTIONS avant d'appeler l'API
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_refuse_un_autre_site():
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "https://site-pirate.example", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in response.headers
