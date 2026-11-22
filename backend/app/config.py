"""Configuration de l'application, lue depuis les variables d'environnement / le fichier .env.

pydantic-settings fonctionne comme un modèle Pydantic : chaque attribut a un type,
et la valeur est lue dans l'environnement (ex. FRONTEND_ORIGIN) puis validée.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Lit le fichier .env s'il existe ; ignore les variables inconnues
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Le Petit Grain API"
    environment: Literal["development", "test", "production"] = "development"
    # Seule origine autorisée à appeler l'API depuis un navigateur (CORS)
    frontend_origin: str = "http://localhost:3000"


@lru_cache  # le fichier .env n'est lu qu'une seule fois
def get_settings() -> Settings:
    return Settings()
