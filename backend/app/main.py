"""Point d'entrée de l'API FastAPI.

Lancer en développement (depuis le dossier backend/) :
    .venv\\Scripts\\python.exe -m uvicorn app.main:app --reload
Documentation interactive : http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

# CORS : seul le frontend a le droit d'appeler l'API depuis un navigateur
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,  # nécessaire plus tard pour le cookie de session admin
    allow_methods=["*"],
    allow_headers=["*"],
)

# Toutes les routes sont préfixées par /api/v1 (voir docs/ARCHITECTURE.md)
app.include_router(health.router, prefix="/api/v1")
