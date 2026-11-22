"""Tests du choix de la langue à partir de l'en-tête Accept-Language."""

import pytest

from app.core.i18n import parse_accept_language


@pytest.mark.parametrize(
    ("header", "expected"),
    [
        ("fr", "fr"),
        ("en", "en"),
        ("en-US,en;q=0.9,fr;q=0.8", "en"),  # navigateur anglais
        ("fr-FR,fr;q=0.9", "fr"),  # navigateur français
        ("de-DE,en;q=0.8", "en"),  # allemand inconnu → première langue connue
        ("ar-MA", "fr"),  # langue non gérée → français par défaut
        ("", "fr"),
        (None, "fr"),  # en-tête absent
    ],
)
def test_parse_accept_language(header, expected):
    assert parse_accept_language(header) == expected
