"""Erreurs de l'API, toujours au même format, dans la langue du visiteur :

    { "code": "PRODUCT_NOT_FOUND", "message": "Ce produit n'existe pas." }

Le « code » est stable (le frontend peut s'en servir) ; le « message » est lisible.
Les erreurs de validation (422) ajoutent « fields » : la liste des champs en erreur.
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.i18n import parse_accept_language

# Messages par code d'erreur, en français et en anglais
MESSAGES: dict[str, dict[str, str]] = {
    "PRODUCT_NOT_FOUND": {
        "fr": "Ce produit n'existe pas ou n'est plus proposé.",
        "en": "This product does not exist or is no longer available.",
    },
    "PRODUCT_UNAVAILABLE": {
        "fr": "Un article de votre panier n'est plus disponible aujourd'hui.",
        "en": "An item in your cart is no longer available today.",
    },
    "EMPTY_CART": {"fr": "Votre panier est vide.", "en": "Your cart is empty."},
    "INVALID_PICKUP_SLOT": {
        "fr": "Ce créneau de retrait n'est pas disponible. Merci d'en choisir un autre.",
        "en": "This pickup time is not available. Please choose another one.",
    },
    "ORDER_NOT_FOUND": {"fr": "Commande introuvable.", "en": "Order not found."},
    "INVALID_STATUS_TRANSITION": {
        "fr": "Ce changement de statut n'est pas autorisé.",
        "en": "This status change is not allowed.",
    },
    "INVALID_RESERVATION_SLOT": {
        "fr": "Ce créneau n'est pas disponible (complet, passé ou hors horaires).",
        "en": "This time slot is not available (full, past or outside opening hours).",
    },
    "INVALID_PARTY_SIZE": {
        "fr": "Le nombre de personnes n'est pas valide pour une réservation en ligne.",
        "en": "This party size cannot be booked online.",
    },
    "RESERVATION_NOT_FOUND": {
        "fr": "Réservation introuvable ou lien invalide.",
        "en": "Reservation not found or invalid link.",
    },
    "RESERVATION_CANCELLED": {
        "fr": "Cette réservation est annulée.",
        "en": "This reservation has been cancelled.",
    },
    "INVALID_CREDENTIALS": {
        "fr": "E-mail ou mot de passe incorrect.",
        "en": "Incorrect email or password.",
    },
    "NOT_AUTHENTICATED": {
        "fr": "Connexion administrateur requise.",
        "en": "Administrator login required.",
    },
    "NOT_FOUND": {"fr": "Élément introuvable.", "en": "Item not found."},
    "SLUG_TAKEN": {
        "fr": "Cet identifiant d'URL (slug) est déjà utilisé.",
        "en": "This URL identifier (slug) is already in use.",
    },
    "CATEGORY_NOT_EMPTY": {
        "fr": "Impossible de supprimer une catégorie qui contient des produits.",
        "en": "A category that still contains products cannot be deleted.",
    },
    "TOO_MANY_REQUESTS": {
        "fr": "Trop de tentatives. Merci de patienter une minute.",
        "en": "Too many attempts. Please wait a minute.",
    },
    "VALIDATION_ERROR": {
        "fr": "Certaines informations sont manquantes ou invalides.",
        "en": "Some information is missing or invalid.",
    },
}


class AppError(Exception):
    """Erreur « métier » : on la lève dans une route, le gestionnaire la transforme en réponse."""

    def __init__(self, code: str, status_code: int = 400):
        self.code = code
        self.status_code = status_code


def error_body(code: str, request: Request) -> dict:
    locale = parse_accept_language(request.headers.get("accept-language"))
    return {"code": code, "message": MESSAGES.get(code, {}).get(locale, code)}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    def handle_app_error(request: Request, error: AppError) -> JSONResponse:
        return JSONResponse(status_code=error.status_code, content=error_body(error.code, request))

    @app.exception_handler(RequestValidationError)
    def handle_validation_error(request: Request, error: RequestValidationError) -> JSONResponse:
        # Liste des champs en erreur : ex. ["customer_email", "items"]
        fields = sorted({str(e["loc"][-1]) for e in error.errors() if e.get("loc")})
        body = error_body("VALIDATION_ERROR", request) | {"fields": fields}
        return JSONResponse(status_code=422, content=body)
