"""Point d'entrée pour Vercel : Vercel cherche une variable « app » dans index.py.

On réutilise simplement l'application FastAPI définie dans app/main.py.
La base (Neon) est déjà créée et remplie : aucune migration n'est lancée ici.
"""

from app.main import app

__all__ = ["app"]
