"""Authentification admin par session dans un cookie httpOnly.

httpOnly : le JavaScript de la page ne peut PAS lire le cookie (protège contre le vol
de session par une faille XSS). SameSite=Lax : le cookie n'est pas envoyé par les
formulaires d'autres sites (protège contre le CSRF).
"""

from datetime import timedelta

from fastapi import Depends, Request, Response
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.errors import AppError
from app.core.security import hash_token, new_token
from app.core.timezone import now_utc
from app.database import get_db
from app.models import AdminSession, AdminUser

COOKIE_NAME = "lpg_admin_session"


def open_session(db: Session, response: Response, admin: AdminUser) -> None:
    settings = get_settings()
    token, token_hash = new_token()
    expires = now_utc() + timedelta(days=settings.admin_session_days)
    # Ménage : supprime les sessions expirées
    db.execute(delete(AdminSession).where(AdminSession.expires_at < now_utc()))
    db.add(AdminSession(token_hash=token_hash, admin_user_id=admin.id, expires_at=expires))
    db.commit()
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=settings.admin_session_days * 86400,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


def close_session(db: Session, request: Request, response: Response) -> None:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        db.execute(delete(AdminSession).where(AdminSession.token_hash == hash_token(token)))
        db.commit()
    response.delete_cookie(COOKIE_NAME, path="/")


def require_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    """Dépendance à mettre sur TOUTES les routes admin : sinon erreur 401."""
    token = request.cookies.get(COOKIE_NAME)
    if token:
        admin = db.scalar(
            select(AdminUser)
            .join(AdminSession, AdminSession.admin_user_id == AdminUser.id)
            .where(AdminSession.token_hash == hash_token(token), AdminSession.expires_at > now_utc())
        )
        if admin:
            return admin
    raise AppError("NOT_AUTHENTICATED", 401)
