"""Configuration commune des tests (pytest lit ce fichier automatiquement).

Les tests utilisent la base SÉPARÉE « lepetitgrain_test » : on peut la vider
sans risque pour les données de développement.
"""

import os

# À faire AVANT d'importer l'application : la configuration est lue à l'import.
os.environ["ENVIRONMENT"] = "test"
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://lpg:lpg_dev_password@localhost:5432/lepetitgrain_test",
)

import pytest  # noqa: E402  (import après la configuration, volontairement)
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    """Un client HTTP de test ; les « surcharges » de dépendances sont annulées après chaque test."""
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
