"""Tests de la configuration."""

import pytest

from app.config import Settings


@pytest.mark.parametrize(
    ("given", "expected"),
    [
        ("postgres://u:p@host/db", "postgresql+psycopg://u:p@host/db"),  # format Render / Heroku
        ("postgresql://u:p@host/db?sslmode=require", "postgresql+psycopg://u:p@host/db?sslmode=require"),  # Neon
        ("postgresql+psycopg://u:p@host/db", "postgresql+psycopg://u:p@host/db"),  # déjà bon
    ],
)
def test_adresse_de_la_base_normalisee(given, expected):
    assert Settings(database_url=given).database_url == expected


def test_neon_migrations_par_la_connexion_directe():
    pooled = "postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/db?sslmode=require"
    direct = "postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=require"
    s = Settings(database_url=pooled, database_url_unpooled=direct)
    assert s.uses_pgbouncer is True
    assert s.migration_database_url == "postgresql+psycopg://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=require"


def test_sans_neon_alembic_utilise_la_base_locale():
    s = Settings(database_url="postgresql://u:p@localhost/db", database_url_unpooled=None)
    assert s.uses_pgbouncer is False
    assert s.migration_database_url == "postgresql+psycopg://u:p@localhost/db"


def test_cookies_securises_en_production():
    assert Settings(environment="production").secure_cookies is True
    assert Settings(environment="development").secure_cookies is False
