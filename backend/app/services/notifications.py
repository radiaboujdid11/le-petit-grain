"""E-mails envoyés par le site, via l'API HTTP de Resend (https://resend.com).

- Au café (NOTIFY_EMAIL) : nouvelle commande, nouvelle réservation, réservation modifiée
  ou annulée par le client, message du formulaire de contact.
- Au client (si CUSTOMER_EMAILS=true) : confirmation de commande, confirmation de
  réservation avec le lien pour la modifier.

Règle d'or : un e-mail qui échoue ne fait JAMAIS échouer la commande ou la réservation.
L'erreur est seulement notée dans les journaux. Sans clé Resend, rien n'est envoyé.
"""

import json
import logging
import urllib.request
from html import escape

from app.config import get_settings
from app.core.timezone import to_local
from app.models import Order, Reservation

logger = logging.getLogger(__name__)
RESEND_URL = "https://api.resend.com/emails"


def _post(payload: dict, api_key: str) -> None:
    """Appel HTTP à Resend (remplacé par une fausse fonction dans les tests)."""
    request = urllib.request.Request(
        RESEND_URL,
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
                 "User-Agent": "le-petit-grain-api"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=8) as response:  # noqa: S310 (adresse fixe, https)
        response.read()


def send_email(to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    settings = get_settings()
    if not settings.resend_api_key or not to:
        return False
    payload = {"from": settings.email_from, "to": [to], "subject": subject, "html": html}
    if reply_to:
        payload["reply_to"] = reply_to
    try:
        _post(payload, settings.resend_api_key)
        return True
    except Exception:  # réseau, clé invalide, quota… : on note, on ne bloque pas
        logger.exception("Envoi d'e-mail impossible (%s)", subject)
        return False


# ---------------------------------------------------------------- Mise en forme

def _money(cents: int, locale: str = "fr") -> str:
    return f"{cents / 100:.2f}".replace(".", ",") + " DH" if locale == "fr" else f"{cents / 100:.2f} MAD"


def _when(value, locale: str = "fr") -> str:
    local = to_local(value)
    return local.strftime("%d/%m/%Y à %H:%M") if locale == "fr" else local.strftime("%d/%m/%Y at %H:%M")


def _layout(title: str, rows: list[tuple[str, str]], intro: str = "", footer: str = "") -> str:
    """Gabarit sobre aux couleurs du site (les valeurs sont déjà échappées)."""
    lines = "".join(
        f'<tr><td style="padding:6px 12px 6px 0;color:#805333;white-space:nowrap;vertical-align:top">{k}</td>'
        f'<td style="padding:6px 0;color:#211710">{v}</td></tr>'
        for k, v in rows
    )
    return (
        '<div style="font-family:Georgia,serif;background:#f2e6d5;padding:24px">'
        '<div style="max-width:560px;margin:auto;background:#fff;padding:28px;border-top:4px solid #b9824e">'
        '<p style="margin:0;letter-spacing:3px;font-size:12px;color:#805333">LE PETIT GRAIN</p>'
        f'<h1 style="font-weight:normal;color:#211710;font-size:22px">{title}</h1>'
        f'{f"<p style=color:#493020>{intro}</p>" if intro else ""}'
        f'<table style="border-collapse:collapse;font-size:15px">{lines}</table>'
        f'{f"<p style=margin-top:24px;color:#493020>{footer}</p>" if footer else ""}'
        "</div></div>"
    )


def _site() -> str:
    return get_settings().frontend_origin.rstrip("/")


# ---------------------------------------------------------------- Commandes

def order_created(order: Order) -> None:
    settings = get_settings()
    items = "<br>".join(f"{i.quantity} × {escape(i.product_name_fr)}" for i in order.items)
    rows = [
        ("Commande", escape(order.order_number)),
        ("Retrait", _when(order.pickup_at)),
        ("Client", escape(order.customer_name)),
        ("Téléphone", escape(order.customer_phone)),
        ("E-mail", escape(order.customer_email)),
        ("Articles", items),
        ("Total", f"<strong>{_money(order.total_cents)}</strong> (paiement au retrait)"),
    ]
    if order.notes:
        rows.append(("Remarque", escape(order.notes)))
    send_email(
        settings.notify_email or "",
        f"Nouvelle commande {order.order_number} · retrait {_when(order.pickup_at)}",
        _layout("Nouvelle commande à préparer", rows, footer=f'<a href="{_site()}/fr/admin/orders">Ouvrir les commandes</a>'),
        reply_to=order.customer_email,
    )
    if settings.customer_emails:
        en = order.locale == "en"
        items_customer = "<br>".join(
            f"{i.quantity} × {escape(i.product_name_en if en else i.product_name_fr)}" for i in order.items
        )
        send_email(
            order.customer_email,
            f"{'Your order' if en else 'Votre commande'} {order.order_number} · Le Petit Grain",
            _layout(
                "Thank you for your order!" if en else "Merci pour votre commande !",
                [
                    ("Order" if en else "Commande", escape(order.order_number)),
                    ("Pickup" if en else "Retrait", _when(order.pickup_at, order.locale)),
                    ("Items" if en else "Articles", items_customer),
                    ("Total", _money(order.total_cents, order.locale)),
                ],
                intro="Pay when you pick up in store." if en else "Vous réglez au retrait, en boutique.",
                footer=f'<a href="{_site()}/{order.locale}/order/{order.public_id}">'
                f'{"Track my order" if en else "Suivre ma commande"}</a>',
            ),
        )


# ---------------------------------------------------------------- Réservations

def _reservation_rows(r: Reservation) -> list[tuple[str, str]]:
    rows = [
        ("Réservation", escape(r.reference)),
        ("Date", _when(r.start_at)),
        ("Personnes", str(r.party_size)),
        ("Client", escape(r.customer_name)),
        ("Téléphone", escape(r.customer_phone)),
        ("E-mail", escape(r.customer_email)),
    ]
    if r.notes:
        rows.append(("Remarque", escape(r.notes)))
    return rows


def reservation_created(r: Reservation, token: str) -> None:
    settings = get_settings()
    send_email(
        settings.notify_email or "",
        f"Nouvelle réservation {r.reference} · {_when(r.start_at)} · {r.party_size} pers.",
        _layout("Nouvelle réservation", _reservation_rows(r),
                footer=f'<a href="{_site()}/fr/admin/reservations">Ouvrir les réservations</a>'),
        reply_to=r.customer_email,
    )
    if settings.customer_emails:
        en = r.locale == "en"
        send_email(
            r.customer_email,
            f"{'Your table is booked' if en else 'Votre table est réservée'} · Le Petit Grain",
            _layout(
                "See you soon!" if en else "À très bientôt !",
                [
                    ("Booking" if en else "Réservation", escape(r.reference)),
                    ("Date", _when(r.start_at, r.locale)),
                    ("Guests" if en else "Personnes", str(r.party_size)),
                ],
                footer=f'<a href="{_site()}/{r.locale}/reservation/manage/{token}">'
                f'{"Change or cancel my booking" if en else "Modifier ou annuler ma réservation"}</a>',
            ),
        )


def reservation_changed(r: Reservation, cancelled: bool = False) -> None:
    what = "annulée" if cancelled else "modifiée"
    send_email(
        get_settings().notify_email or "",
        f"Réservation {r.reference} {what} par le client",
        _layout(f"Réservation {what} par le client", _reservation_rows(r)),
        reply_to=r.customer_email,
    )


# ---------------------------------------------------------------- Contact

def contact_received(name: str, email: str, message: str) -> None:
    send_email(
        get_settings().notify_email or "",
        f"Message de {name} (site Le Petit Grain)",
        _layout("Nouveau message", [("De", escape(name)), ("E-mail", escape(email)),
                                    ("Message", escape(message).replace("\n", "<br>"))]),
        reply_to=email,
    )
