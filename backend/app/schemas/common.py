"""Champs réutilisés par plusieurs formulaires, avec leurs règles de validation."""

from typing import Annotated

from pydantic import AfterValidator, EmailStr, StringConstraints


def _clean_phone(value: str) -> str:
    """Accepte « 06 12 34 56 78 », « +212 612-345-678 »… : garde 9 à 15 chiffres."""
    digits = "".join(c for c in value if c.isdigit())
    if not 9 <= len(digits) <= 15:
        raise ValueError("numéro de téléphone invalide")
    return ("+" if value.strip().startswith("+") else "") + digits


CustomerName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, max_length=30), AfterValidator(_clean_phone)]
Email = EmailStr
Notes = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]
