"""Tests des jours de fermeture exceptionnelle : aucun créneau ce jour-là, gestion par l'admin."""

from datetime import timedelta

from app.core.timezone import today_local
from app.models import Closure
from tests.test_admin import admin_api  # noqa: F401  (fixture du client connecté en admin)

API = "/api/v1"


def _day(days_ahead: int = 2) -> str:
    return (today_local() + timedelta(days=days_ahead)).isoformat()


def test_jour_ferme_aucun_creneau(api, db_session):
    day = _day()
    assert api.get(f"{API}/reservations/availability", params={"date": day, "party_size": 2}).json()
    assert api.get(f"{API}/pickup-slots", params={"date": day}).json()

    db_session.add(Closure(day=today_local() + timedelta(days=2), reason="Aïd"))
    db_session.flush()

    assert api.get(f"{API}/reservations/availability", params={"date": day, "party_size": 2}).json() == []
    assert api.get(f"{API}/pickup-slots", params={"date": day}).json() == []
    # Le lendemain reste ouvert
    assert api.get(f"{API}/pickup-slots", params={"date": _day(3)}).json()


def test_fermetures_a_venir_dans_les_infos_publiques(api, db_session):
    db_session.add(Closure(day=today_local() + timedelta(days=5), reason="Congés"))
    db_session.add(Closure(day=today_local() - timedelta(days=5), reason="Passée"))
    db_session.flush()
    closures = api.get(f"{API}/shop/info").json()["closures"]
    assert closures == [{"day": _day(5), "reason": "Congés"}]


def test_routes_fermetures_protegees(api):
    assert api.get(f"{API}/admin/closures").status_code == 401
    assert api.put(f"{API}/admin/closures/{_day()}", json={"day": _day()}).status_code == 401


def test_admin_ajoute_modifie_puis_supprime_une_fermeture(admin_api):  # noqa: F811
    day = _day(4)
    response = admin_api.put(f"{API}/admin/closures/{day}", json={"day": day, "reason": "Inventaire"})
    assert response.status_code == 200
    admin_api.put(f"{API}/admin/closures/{day}", json={"day": day, "reason": "Travaux"})
    assert admin_api.get(f"{API}/admin/closures").json() == [{"day": day, "reason": "Travaux"}]
    assert admin_api.get(f"{API}/pickup-slots", params={"date": day}).json() == []

    assert admin_api.delete(f"{API}/admin/closures/{day}").status_code == 204
    assert admin_api.get(f"{API}/admin/closures").json() == []
    assert admin_api.get(f"{API}/pickup-slots", params={"date": day}).json()
    assert admin_api.delete(f"{API}/admin/closures/{day}").status_code == 404


def test_date_incoherente_refusee(admin_api):  # noqa: F811
    response = admin_api.put(f"{API}/admin/closures/{_day(4)}", json={"day": _day(5)})
    assert response.status_code == 422
