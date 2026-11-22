"""Sécurité : hachage des mots de passe (argon2) et jetons aléatoires.

- Un mot de passe n'est JAMAIS stocké : seulement son empreinte argon2 (lente exprès,
  pour décourager les attaques par force brute).
- Les jetons (session admin, lien de réservation) sont longs et aléatoires ; la base
  n'en garde que l'empreinte SHA-256 : une fuite de la base ne donne aucun lien valide.
"""

import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_token() -> tuple[str, str]:
    """Renvoie (jeton en clair à donner au client, empreinte à stocker)."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


# Alphabet sans caractères ambigus (pas de 0/O, 1/I) pour les références lues au comptoir
_REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def short_reference(prefix: str, length: int = 5) -> str:
    """Ex. short_reference("LPG") → « LPG-7K2QX »."""
    return f"{prefix}-" + "".join(secrets.choice(_REF_ALPHABET) for _ in range(length))
