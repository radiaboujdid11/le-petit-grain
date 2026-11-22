"""Génère ~3 mois de commandes et de réservations FICTIVES réalistes, pour que le
tableau de bord soit parlant pendant la démo.

⚠️ SUPPRIME les commandes et réservations existantes (données de démonstration uniquement).
Lancer depuis le dossier backend/ (après seed_menu) :
    .venv\\Scripts\\python.exe -m scripts.seed_demo
"""

import random
from datetime import datetime, timedelta

from sqlalchemy import delete, select

from app.core.security import new_token, short_reference
from app.core.timezone import local_datetime, now_utc, today_local
from app.database import SessionLocal
from app.models import OpeningHours, Order, OrderItem, Product, Reservation, ShopSettings

DAYS = 90
random.seed(2026)  # mêmes données à chaque lancement (démo reproductible)

FIRST_NAMES = ["Salma", "Youssef", "Imane", "Mehdi", "Nadia", "Omar", "Kenza", "Amine", "Sara",
               "Hamza", "Lina", "Rayan", "Meryem", "Ilyas", "Hiba", "Anas", "Chaïma", "Adam", "Léa", "Lucas"]
LAST_NAMES = ["Bennani", "Alami", "El Idrissi", "Tazi", "Berrada", "Chraibi", "Fassi", "Lahlou",
              "Benjelloun", "Amrani", "Martin", "Dubois"]

# Popularité relative des produits (best-sellers plus fréquents)
POPULARITY = {
    "croissant-chocolat": 9, "brownie-fondant": 8, "fondant-chocolat": 7, "cupcake-mure": 6,
    "cappuccino": 9, "espresso": 8, "iced-caramel-latte": 7, "croissant-beurre": 8,
    "pain-au-chocolat": 8, "iced-latte": 6, "latte-vanille": 5, "flat-white": 4,
    "croissant-amandes": 5, "chocolat-amlou": 4, "baguette-tradition": 6, "msemen": 5,
}

# Affluence par heure (pics : petit-déjeuner, déjeuner, goûter)
HOUR_WEIGHTS = {7: 3, 8: 9, 9: 8, 10: 5, 11: 4, 12: 6, 13: 7, 14: 4, 15: 4, 16: 7, 17: 8, 18: 5, 19: 3, 20: 2}


def person():
    first, last = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    email = f"{first.lower().replace('ï', 'i').replace('é', 'e')}.{last.lower().replace(' ', '')}@example.com"
    return f"{first} {last}", f"+2126{random.randint(10000000, 99999999)}", email


def main() -> None:
    now = now_utc()
    today = today_local()
    with SessionLocal() as db:
        db.execute(delete(OrderItem))
        db.execute(delete(Order))
        db.execute(delete(Reservation))

        products = list(db.scalars(select(Product)))
        weights = [POPULARITY.get(p.slug, 2) for p in products]
        hours = {h.weekday: h for h in db.scalars(select(OpeningHours))}
        settings = db.get(ShopSettings, 1)
        used_numbers: set[str] = set()
        orders_total = reservations_total = 0

        for offset in range(DAYS, -2, -1):  # du passé jusqu'à demain
            day = today - timedelta(days=offset)
            opening = hours[day.weekday()]
            if opening.is_closed:
                continue
            open_at = local_datetime(day, opening.open_time)
            close_at = local_datetime(day, opening.close_time)
            weekend = day.weekday() >= 5
            growth = 1 + (DAYS - offset) / DAYS * 0.35  # l'activité progresse sur la période

            # ---------- Commandes à emporter
            for _ in range(int(random.randint(16, 26) * (1.4 if weekend else 1) * growth)):
                hour = random.choices(list(HOUR_WEIGHTS), weights=list(HOUR_WEIGHTS.values()))[0]
                pickup = local_datetime(day, datetime.min.time()) + timedelta(hours=hour, minutes=random.choice([0, 15, 30, 45]))
                if not open_at + timedelta(minutes=20) <= pickup <= close_at - timedelta(minutes=15):
                    continue
                if pickup < now:
                    status = "cancelled" if random.random() < 0.07 else "picked_up"
                else:
                    status = random.choice(["pending", "pending", "confirmed", "preparing"])
                number = short_reference("LPG")
                while number in used_numbers:
                    number = short_reference("LPG")
                used_numbers.add(number)
                name, phone, email = person()
                order = Order(order_number=number, status=status, customer_name=name, customer_phone=phone,
                              customer_email=email, pickup_at=pickup, total_cents=0, locale=random.choice(["fr", "fr", "en"]),
                              created_at=pickup - timedelta(minutes=random.randint(25, 240)))
                for product in set(random.choices(products, weights=weights, k=random.randint(1, 4))):
                    qty = random.choices([1, 2, 3], weights=[6, 3, 1])[0]
                    order.items.append(OrderItem(product_id=product.id, product_slug=product.slug,
                                                 product_name_fr=product.name_fr, product_name_en=product.name_en,
                                                 unit_price_cents=product.price_cents, quantity=qty,
                                                 line_total_cents=product.price_cents * qty))
                    order.total_cents += product.price_cents * qty
                db.add(order)
                orders_total += 1

            # ---------- Réservations (sans dépasser la capacité, comme l'API)
            duration = timedelta(minutes=settings.reservation_duration_minutes)
            booked: list[tuple[datetime, datetime, int]] = []
            for _ in range(int(random.randint(7, 14) * (1.5 if weekend else 1) * growth)):
                hour = random.choices([8, 9, 10, 12, 13, 15, 16, 17, 18], weights=[4, 5, 3, 4, 5, 3, 5, 5, 3])[0]
                start = local_datetime(day, datetime.min.time()) + timedelta(hours=hour, minutes=random.choice([0, 30]))
                party = random.choices([1, 2, 3, 4, 5, 6], weights=[2, 8, 4, 4, 1, 1])[0]
                if start < open_at or start + duration > close_at:
                    continue
                taken = sum(p for s, e, p in booked if s < start + duration and e > start)
                if taken + party > settings.seating_capacity:
                    continue
                booked.append((start, start + duration, party))
                name, phone, email = person()
                _, token_hash = new_token()
                db.add(Reservation(reference=short_reference("R"), manage_token_hash=token_hash,
                                   status="cancelled" if random.random() < 0.05 else "confirmed",
                                   start_at=start, end_at=start + duration, party_size=party,
                                   customer_name=name, customer_phone=phone, customer_email=email))
                reservations_total += 1

        db.commit()
        print(f"Démo prête : {orders_total} commandes et {reservations_total} réservations sur {DAYS} jours.")


if __name__ == "__main__":
    main()
