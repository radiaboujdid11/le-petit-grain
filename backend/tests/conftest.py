"""Configuration commune des tests (pytest lit ce fichier automatiquement).

Les tests utilisent la base SÉPARÉE « lepetitgrain_test » : on peut la vider
sans risque pour les données de développement.
"""

import os
from pathlib import Path

# À faire AVANT d'importer l'application : la configuration est lue à l'import.
os.environ["ENVIRONMENT"] = "test"
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://lpg:lpg_dev_password@localhost:5432/lepetitgrain_test",
)

import pytest  # noqa: E402  (imports après la configuration, volontairement)
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402

ALEMBIC_INI = Path(__file__).resolve().parent.parent / "alembic.ini"


@pytest.fixture(scope="session", autouse=True)
def database_schema():
    """Une fois pour toute la session de tests : base vidée puis recréée PAR LES MIGRATIONS.

    Les migrations sont donc testées à chaque lancement (montée ET descente).
    """
    config = Config(str(ALEMBIC_INI))
    command.downgrade(config, "base")  # supprime toutes les tables
    command.upgrade(config, "head")  # les recrée avec la dernière version
    yield


@pytest.fixture
def db_session():
    """Session de base pour UN test, dans une transaction annulée à la fin.

    Chaque test part donc d'une base propre, sans avoir à tout supprimer à la main.
    « create_savepoint » : un commit() dans le test reste annulable.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client():
    """Un client HTTP de test ; les « surcharges » de dépendances sont annulées après chaque test."""
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
