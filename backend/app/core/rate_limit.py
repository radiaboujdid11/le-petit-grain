"""Limitation du nombre de requêtes (décision L) : protège la connexion admin et les
formulaires publics contre les abus (robots, essais de mots de passe en rafale).

Simple « fenêtre glissante » en mémoire, par adresse IP. Suffisant pour un seul serveur ;
avec plusieurs serveurs, on utiliserait Redis.
"""

import time
from collections import defaultdict, deque

from fastapi import Request

from app.config import get_settings
from app.core.errors import AppError


class RateLimiter:
    def __init__(self, name: str, limit: int, window_seconds: int):
        self.name = name
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def reset(self) -> None:
        self._hits.clear()

    def __call__(self, request: Request) -> None:
        """Dépendance FastAPI : lève une erreur 429 si l'IP a dépassé la limite."""
        if not get_settings().rate_limit_enabled:
            return
        key = request.client.host if request.client else "inconnu"
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > self.window:  # oublie les requêtes trop anciennes
            hits.popleft()
        if len(hits) >= self.limit:
            raise AppError("TOO_MANY_REQUESTS", status_code=429)
        hits.append(now)


login_limiter = RateLimiter("login", limit=5, window_seconds=60)
form_limiter = RateLimiter("form", limit=10, window_seconds=60)
