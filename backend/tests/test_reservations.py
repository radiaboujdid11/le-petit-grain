"""Tests des réservations : capacité, chevauchements, lien de gestion, et SURTOUT
aucune surréservation, même avec deux demandes simultanées."""

import threading
from datetime import datetime, timedelta

from sqlalchemy import delete

from app.core.errors import AppError
from app.core.timezone import now_utc, today_local
from app.database import SessionLocal
from app.models import Reservation, ShopSettings
from app.schemas.reservations import ReservationCreate
from app.services.reservations import create_reservation

GUEST = {"customer_name": "Youssef Alami", "customer_phone": "+212 661 22 33 44", "customer_email": "y@example.com"}


def slots(api, party=2, days_ahead=3):
    day = (today_local() + timedelta(days=days_ahead)).isoformat()
    return api.get("/api/v1/reservations/availability", params={"date": day, "party_size": party}).json()


def book(api, start, party=2):
    return api.post("/api/v1/reservations", json={"start_at": start, "party_size": party, **GUEST})


def test_disponibilites(api):
    available = slots(api)
    assert available and all(s["available"] for s in available)
    # Toutes les 30 min ; la dernière table se libère avant la fermeture (durée 90 min)
    assert available[0]["label"] == "07:30" or available[0]["label"] == "08:00"


def test_reserver_puis_gerer_avec_le_lien_unique(api):
    start = slots(api)[4]["start"]
    created = book(api, start).json()
    assert created["reference"].startswith("R-")
    token = created["manage_token"]

    assert api.get(f"/api/v1/reservations/manage/{token}").json()["party_size"] == 2

    new_start = slots(api)[6]["start"]
    changed = api.patch(f"/api/v1/reservations/manage/{token}", json={"start_at": new_start, "party_size": 4})
    assert changed.status_code == 200
    assert changed.json()["party_size"] == 4

    cancelled = api.post(f"/api/v1/reservations/manage/{token}/cancel").json()
    assert cancelled["status"] == "cancelled"
    # Une réservation annulée ne peut plus être modifiée
    again = api.patch(f"/api/v1/reservations/manage/{token}", json={"start_at": new_start, "party_size": 2})
    assert again.json()["code"] == "RESERVATION_CANCELLED"


def test_lien_invalide(api):
    response = api.get("/api/v1/reservations/manage/faux-jeton")
    assert response.status_code == 404
    assert response.json()["code"] == "RESERVATION_NOT_FOUND"


def test_capacite_respectee_sur_les_chevauchements(api, db_session):
    db_session.get(ShopSettings, 1).seating_capacity = 4
    db_session.flush()
    all_slots = slots(api)
    start = all_slots[4]["start"]
    assert book(api, start, party=3).status_code == 201

    # 30 min plus tard : la table précédente est encore occupée (durée 90 min) → 3 + 2 > 4
    overlapping = all_slots[5]["start"]
    refused = book(api, overlapping, party=2)
    assert refused.status_code == 409
    assert refused.json()["code"] == "INVALID_RESERVATION_SLOT"

    # 90 min plus tard : la première table est libérée → accepté
    after = all_slots[7]["start"]
    assert book(api, after, party=2).status_code == 201


def test_groupe_trop_grand_refuse(api):
    start = slots(api)[2]["start"]
    response = book(api, start, party=12)
    assert response.json()["code"] == "INVALID_PARTY_SIZE"


def test_creneau_passe_refuse(api):
    yesterday = (now_utc() - timedelta(days=1)).isoformat()
    assert book(api, yesterday).status_code == 409


def test_aucune_surreservation_avec_deux_demandes_simultanees():
    """Deux clients réservent la DERNIÈRE place au même instant : un seul doit réussir.
    Ce test utilise de vraies transactions (commit) dans deux fils d'exécution parallèles."""
    with SessionLocal() as setup:
        settings = setup.get(ShopSettings, 1)
        old_capacity, settings.seating_capacity = settings.seating_capacity, 2
        setup.commit()

    day = today_local() + timedelta(days=5)
    with SessionLocal() as s:
        from app.services.schedule import reservation_slots

        start = reservation_slots(s, day, 2, now_utc())[3].start

    results: list[str] = []
    barrier = threading.Barrier(2)  # les deux fils démarrent exactement ensemble

    def attempt():
        with SessionLocal() as session:
            barrier.wait()
            try:
                create_reservation(session, ReservationCreate(start_at=start, party_size=2, **GUEST), "fr", now_utc())
                session.commit()
                results.append("ok")
            except AppError as error:
                session.rollback()
                results.append(error.code)

    threads = [threading.Thread(target=attempt) for _ in range(2)]
    try:
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=30)
        assert sorted(results) == ["INVALID_RESERVATION_SLOT", "ok"]
    finally:
        with SessionLocal() as cleanup:  # remet la base de test dans son état initial
            cleanup.execute(delete(Reservation).where(Reservation.start_at == start))
            cleanup.get(ShopSettings, 1).seating_capacity = old_capacity
            cleanup.commit()


def test_le_type_datetime_est_bien_avec_fuseau():
    assert isinstance(now_utc(), datetime) and now_utc().tzinfo is not None
