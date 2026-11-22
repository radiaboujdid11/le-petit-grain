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


def test_cookies_securises_en_production():
    assert Settings(environment="production").secure_cookies is True
    assert Settings(environment="development").secure_cookies is False
