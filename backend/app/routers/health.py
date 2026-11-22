"""Route de santé : permet de vérifier que le serveur répond (utile aussi pour Render)."""

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter(tags=["santé"])


class HealthResponse(BaseModel):
    """Forme de la réponse : FastAPI la valide et l'affiche dans la documentation."""

    status: str
    environment: str


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", environment=get_settings().environment)
