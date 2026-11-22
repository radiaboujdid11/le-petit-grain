"""Fuseau horaire de la boutique : toutes les dates sont STOCKÉES en UTC
et converties en heure de Casablanca pour les horaires, créneaux et statistiques.
(Le paquet « tzdata » fournit les règles du fuseau, y compris sous Windows.)"""

from datetime import date, datetime, time, timezone
from zoneinfo import ZoneInfo

SHOP_TZ = ZoneInfo("Africa/Casablanca")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def today_local() -> date:
    return datetime.now(SHOP_TZ).date()


def local_datetime(day: date, at: time) -> datetime:
    """Une date + une heure « de Casablanca » → datetime avec fuseau."""
    return datetime.combine(day, at, tzinfo=SHOP_TZ)


def to_local(moment: datetime) -> datetime:
    return moment.astimezone(SHOP_TZ)
