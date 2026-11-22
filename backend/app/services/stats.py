"""Statistiques du tableau de bord.

Le chiffre d'affaires ne compte QUE les commandes « picked_up » (récupérées), car le
paiement se fait au retrait. Les dates sont regroupées en heure de Casablanca.
"""

from datetime import date, datetime, timedelta

from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.core.timezone import SHOP_TZ, local_datetime, to_local
from app.models import ContactMessage, OpeningHours, Order, OrderItem, Reservation
from app.schemas.admin import DayRevenue, HourCount, Stats, TopProduct
from app.services.schedule import get_settings

TZ_NAME = "Africa/Casablanca"


def compute_stats(db: Session, days: int, now: datetime) -> Stats:
    today = to_local(now).date()
    first_day = today - timedelta(days=days - 1)
    start = local_datetime(first_day, datetime.min.time())
    end = local_datetime(today + timedelta(days=1), datetime.min.time())

    paid = (Order.status == "picked_up", Order.pickup_at >= start, Order.pickup_at < end)
    local_pickup = func.timezone(TZ_NAME, Order.pickup_at)  # heure locale côté PostgreSQL

    # Chiffre d'affaires et nombre de commandes par jour
    rows = db.execute(
        select(func.date(local_pickup), func.sum(Order.total_cents), func.count())
        .where(*paid)
        .group_by(func.date(local_pickup))
    ).all()
    by_day = {d: (int(revenue), count) for d, revenue, count in rows}
    revenue_by_day = [
        DayRevenue(date=d, revenue_cents=by_day.get(d, (0, 0))[0], orders=by_day.get(d, (0, 0))[1])
        for d in (first_day + timedelta(days=i) for i in range(days))
    ]
    total_revenue = sum(r.revenue_cents for r in revenue_by_day)
    orders_count = sum(r.orders for r in revenue_by_day)

    # Produits les plus vendus
    top = db.execute(
        select(OrderItem.product_name_fr, func.sum(OrderItem.quantity), func.sum(OrderItem.line_total_cents))
        .join(Order)
        .where(*paid)
        .group_by(OrderItem.product_name_fr)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(8)
    ).all()

    # Heures de pointe (heure de retrait, en heure locale)
    hours = db.execute(
        select(extract("hour", local_pickup), func.count()).where(*paid).group_by(extract("hour", local_pickup))
    ).all()
    hour_counts = {int(h): c for h, c in hours}

    # Réservations et taux de remplissage :
    # (personnes × durée réservée) / (capacité × minutes d'ouverture) sur la période
    settings = get_settings(db)
    reservations = db.scalars(
        select(Reservation).where(
            Reservation.status == "confirmed", Reservation.start_at >= start, Reservation.start_at < end
        )
    ).all()
    guests = sum(r.party_size for r in reservations)
    reserved_minutes = sum(r.party_size * (r.end_at - r.start_at).total_seconds() / 60 for r in reservations)
    opening = {h.weekday: h for h in db.scalars(select(OpeningHours))}
    capacity_minutes = 0.0
    for i in range(days):
        hours_of_day = opening.get((first_day + timedelta(days=i)).weekday())
        if hours_of_day and not hours_of_day.is_closed:
            open_minutes = (
                datetime.combine(date.min, hours_of_day.close_time)
                - datetime.combine(date.min, hours_of_day.open_time)
            ).total_seconds() / 60
            capacity_minutes += open_minutes * settings.seating_capacity
    fill_rate = reserved_minutes / capacity_minutes if capacity_minutes else 0.0

    return Stats(
        days=days,
        total_revenue_cents=total_revenue,
        orders_count=orders_count,
        average_basket_cents=round(total_revenue / orders_count) if orders_count else 0,
        revenue_by_day=revenue_by_day,
        top_products=[TopProduct(name=n, quantity=int(q), revenue_cents=int(r)) for n, q, r in top],
        peak_hours=[HourCount(hour=h, orders=hour_counts.get(h, 0)) for h in range(7, 22)],
        reservations_count=len(reservations),
        guests_count=guests,
        reservation_fill_rate=round(min(fill_rate, 1.0), 4),
        pending_orders=db.scalar(
            select(func.count()).select_from(Order).where(Order.status.in_(("pending", "confirmed", "preparing", "ready")))
        ),
        unread_messages=db.scalar(select(func.count()).select_from(ContactMessage).where(ContactMessage.is_read.is_(False))),
    )


__all__ = ["compute_stats", "SHOP_TZ"]
