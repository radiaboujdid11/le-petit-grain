"""Tests de la route /api/v1/health (serveur, base de données, CORS).

« client » est une fixture définie dans conftest.py : pytest la fournit automatiquement.
"""

from sqlalchemy.exc import OperationalError

from app.database import get_db


def test_health_ok_avec_la_base(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "environment": "test", "database": "ok"}


def test_health_signale_une_base_indisponible(client):
    # On remplace la vraie session par une fausse qui échoue, pour simuler une panne
    class SessionEnPanne:
        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("connexion refusée"))

    app = client.app
    app.dependency_overrides[get_db] = lambda: SessionEnPanne()

    response = client.get("/api/v1/health")
    assert response.status_code == 503
    assert response.json()["database"] == "unavailable"
    assert response.json()["status"] == "degraded"


def test_route_inconnue_renvoie_404(client):
    assert client.get("/api/v1/nexiste-pas").status_code == 404


def test_cors_autorise_le_frontend(client):
    # Le navigateur envoie une requête « preflight » OPTIONS avant d'appeler l'API
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_refuse_un_autre_site(client):
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "https://site-pirate.example", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in response.headers
