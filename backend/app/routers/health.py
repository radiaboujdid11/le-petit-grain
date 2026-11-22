"""Route de santé : vérifie que le serveur ET la base de données répondent.

Utile en développement, et pour Render (phase 7) qui surveille cette adresse.
"""

from typing import Literal

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db

router = APIRouter(tags=["santé"])


class HealthResponse(BaseModel):
    """Forme de la réponse : FastAPI la valide et l'affiche dans la documentation."""

    status: Literal["ok", "degraded"]
    environment: str
    database: Literal["ok", "unavailable"]


@router.get("/health", response_model=HealthResponse)
def health(response: Response, db: Session = Depends(get_db)) -> HealthResponse:
    # Depends(get_db) : FastAPI appelle get_db et nous donne la session
    try:
        db.execute(text("SELECT 1"))  # la requête la plus simple possible
        database = "ok"
    except SQLAlchemyError:
        database = "unavailable"
        # 503 = « service indisponible » : signale le problème aux outils de surveillance
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthResponse(
        status="ok" if database == "ok" else "degraded",
        environment=get_settings().environment,
        database=database,
    )
