"""Erreurs de l'API, toujours au même format, dans la langue du visiteur :

    { "code": "PRODUCT_NOT_FOUND", "message": "Ce produit n'existe pas." }

Le « code » est stable (le frontend peut s'en servir) ; le « message » est lisible.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.i18n import parse_accept_language

# Messages par code d'erreur, en français et en anglais
MESSAGES: dict[str, dict[str, str]] = {
    "PRODUCT_NOT_FOUND": {
        "fr": "Ce produit n'existe pas ou n'est plus proposé.",
        "en": "This product does not exist or is no longer available.",
    },
}


class AppError(Exception):
    """Erreur « métier » : on la lève dans une route, le gestionnaire la transforme en réponse."""

    def __init__(self, code: str, status_code: int = 400):
        self.code = code
        self.status_code = status_code


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    def handle_app_error(request: Request, error: AppError) -> JSONResponse:
        locale = parse_accept_language(request.headers.get("accept-language"))
        message = MESSAGES.get(error.code, {}).get(locale, error.code)
        return JSONResponse(
            status_code=error.status_code,
            content={"code": error.code, "message": message},
        )
