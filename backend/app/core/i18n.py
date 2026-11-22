"""Langue de la réponse (fr / en), choisie avec l'en-tête HTTP « Accept-Language ».

Le frontend enverra « Accept-Language: fr » ou « en » selon l'URL (/fr ou /en).
Un navigateur envoie par exemple « en-US,en;q=0.9,fr;q=0.8 » : on prend la
première langue que le site connaît.
"""

from typing import Literal

from fastapi import Header

Locale = Literal["fr", "en"]
DEFAULT_LOCALE: Locale = "fr"


def parse_accept_language(header: str | None) -> Locale:
    """« en-US,en;q=0.9 » → "en" ; en-tête absent ou langue inconnue → "fr"."""
    if not header:
        return DEFAULT_LOCALE
    for part in header.split(","):
        # « en-US;q=0.9 » → « en-US » → « en »
        language = part.split(";")[0].strip().split("-")[0].lower()
        if language in ("fr", "en"):
            return language  # type: ignore[return-value]
    return DEFAULT_LOCALE


def get_locale(accept_language: str | None = Header(default=None)) -> Locale:
    """Dépendance FastAPI : fournit la langue à une route (lit l'en-tête Accept-Language)."""
    return parse_accept_language(accept_language)
