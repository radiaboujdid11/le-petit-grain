"""Configuration de l'application, lue depuis les variables d'environnement / le fichier .env.

pydantic-settings fonctionne comme un modèle Pydantic : chaque attribut a un type,
et la valeur est lue dans l'environnement (ex. FRONTEND_ORIGIN) puis validée.
"""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Lit le fichier .env s'il existe ; ignore les variables inconnues
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Le Petit Grain API"
    environment: Literal["development", "test", "production"] = "development"
    # Seule origine autorisée à appeler l'API depuis un navigateur (CORS)
    frontend_origin: str = "http://localhost:3000"
    # Adresse de la base PostgreSQL (format SQLAlchemy, pilote psycopg 3).
    # Valeur par défaut = base locale de docker-compose.yml ; en production, fournie par .env
    database_url: str = "postgresql+psycopg://lpg:lpg_dev_password@localhost:5432/lepetitgrain"
    # Neon : adresse DIRECTE (sans « -pooler »), utilisée seulement par Alembic pour les migrations.
    # Le pooler de Neon (PgBouncer, mode transaction) ne garde pas l'état de session
    # dont les migrations ont besoin. Absente en local : Alembic prend database_url.
    database_url_unpooled: str | None = None
    # Limitation des requêtes (désactivée dans la plupart des tests)
    rate_limit_enabled: bool = True
    # Durée d'une session admin
    admin_session_days: int = 7

    @field_validator("database_url", "database_url_unpooled")
    @classmethod
    def use_psycopg_driver(cls, url: str | None) -> str | None:
        """Render / Neon fournissent « postgres://… » ou « postgresql://… » :
        on précise le pilote psycopg 3 attendu par SQLAlchemy."""
        if url is None:
            return None
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix):]
        return url

    @property
    def migration_database_url(self) -> str:
        """Adresse utilisée par Alembic : la directe si elle existe (Neon), sinon la normale."""
        return self.database_url_unpooled or self.database_url

    @property
    def uses_pgbouncer(self) -> bool:
        """Vrai si l'application passe par le pooler de Neon (« -pooler » dans le nom d'hôte)."""
        return "-pooler." in self.database_url

    @property
    def secure_cookies(self) -> bool:
        """Cookies « Secure » (HTTPS uniquement) en production."""
        return self.environment == "production"


@lru_cache  # le fichier .env n'est lu qu'une seule fois
def get_settings() -> Settings:
    return Settings()
