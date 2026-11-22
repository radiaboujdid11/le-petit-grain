# Architecture — Le Petit Grain

> Document de référence validé en phase 0 (14/11/2026).
> Toute évolution de l'architecture doit être reportée ici.

## 1. Vue d'ensemble

| Partie | Technologies | Hébergement prévu |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + next-intl | Vercel |
| Backend | FastAPI + Pydantic + SQLAlchemy (synchrone) + Alembic | Render ou Railway |
| Base de données | PostgreSQL (Docker en local) | Neon ou Render (à trancher en phase 7) |
| Images | Cloudinary | — |

Monorepo : un seul dépôt Git contenant `frontend/` et `backend/`.

## 2. Décisions techniques

| # | Décision | Raison |
|---|---|---|
| A | Next.js relaie `/api/*` vers le backend (rewrites) | Le cookie admin reste sur le même domaine que le site : pas de blocage des cookies tiers (Safari, Chrome). |
| B | Hébergement de la base choisi en phase 7 (Neon envisagé) | Les offres gratuites changent souvent ; la base gratuite de Render peut expirer. |
| C | Paquet `tzdata` dans les dépendances Python | Sous Windows, `zoneinfo` ne connaît pas `Africa/Casablanca` sans lui. |
| D | PostgreSQL via Docker en local, y compris pour les tests | Même moteur qu'en production ; les verrous (anti-surréservation) sont réellement testés. |
| E | SQLAlchemy synchrone | Plus simple à apprendre, suffisant à cette échelle. |
| F | Mêmes chemins dans les deux langues (`/fr/menu`, `/en/menu`) | Simplicité ; chemins traduits possibles plus tard. |
| G | Admin en français uniquement, sous `/admin` | Moitié moins de traductions ; seul le site public est bilingue. |
| H | Traductions de l'interface avec next-intl (`messages/fr.json`, `messages/en.json`) | Bibliothèque standard de l'App Router, gère le format des prix et des dates. |
| I | Filtres du menu : catégorie, végétarien, sans fruits à coque, tri par prix | Utile au client, simple à implémenter. |
| J | Messages de contact enregistrés en base et visibles dans l'admin | Pas d'e-mails en V1. |
| K | Pas de jours de fermeture exceptionnels en V1 (horaires hebdomadaires seulement) | Périmètre réduit ; ajout facile ensuite (table `closures`). |
| L | Limitation du nombre de requêtes (`slowapi`) sur la connexion admin et les formulaires publics | Protection contre les abus. |

### Conventions
- **Prix** : entiers en centimes (`2500` = 25,00 DH). Affichage : « 25,00 DH » (fr), « 25.00 MAD » (en).
- **Dates** : stockées en UTC (`timestamptz`), affichées en heure de `Africa/Casablanca`.
- **Langue** : le frontend envoie `Accept-Language: fr|en` ; le backend renvoie les noms des produits et les erreurs dans cette langue.
- **Format des erreurs** : `{ "code": "SLOT_FULL", "message": "Ce créneau est complet." }`.
- **Prix toujours recalculés par le backend** : le navigateur n'envoie que `product_id` et `quantity`.

## 3. Structure des dossiers

```
le-petit-grain/
├── frontend/
│   ├── messages/            fr.json, en.json
│   ├── public/              logo.svg, images/
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/    accueil, menu, menu/[slug], about, contact,
│   │   │   │                cart, checkout, order/[id],
│   │   │   │                reservation, reservation/manage/[token]
│   │   │   └── admin/
│   │   ├── components/      ui/, layout/, home/, menu/, cart/, admin/
│   │   ├── lib/             api.ts, format.ts, cart.ts
│   │   ├── i18n/
│   │   └── middleware.ts
│   └── tests/               Vitest, Playwright
├── backend/
│   ├── app/
│   │   ├── main.py, config.py, database.py
│   │   ├── models/          tables SQLAlchemy
│   │   ├── schemas/         schémas Pydantic
│   │   ├── routers/         public/, admin/
│   │   ├── services/        pricing, slots, reservations, stats
│   │   └── core/            security, i18n
│   ├── alembic/
│   ├── scripts/             seed_menu.py, seed_demo.py, create_admin.py
│   ├── tests/               pytest
│   ├── requirements.txt
│   └── .env.example
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 4. Base de données

### categories
`id`, `slug` (unique), `name_fr`, `name_en`, `sort_order`, `is_active`

### products
`id`, `category_id` → categories, `slug` (unique), `name_fr`, `name_en`,
`description_fr`, `description_en`, `price_cents`, `image_url`,
`is_available`, `is_bestseller`, `is_vegetarian`, `contains_nuts`, `contains_gluten`,
`sort_order`, `created_at`, `updated_at`

### orders
`id`, `public_id` (UUID unique), `order_number` (unique, ex. `LPG-4821`),
`status` (`pending` | `confirmed` | `preparing` | `ready` | `picked_up` | `cancelled`),
`customer_name`, `customer_phone`, `customer_email`, `pickup_at`, `notes`,
`total_cents`, `locale`, `created_at`, `updated_at`

Transitions autorisées :
```
pending → confirmed → preparing → ready → picked_up
   └──────────┴────────────┴─────────┴──→ cancelled
```
Le chiffre d'affaires ne compte que les commandes `picked_up` (paiement au retrait).

### order_items
`id`, `order_id` → orders, `product_id` → products (nullable),
`product_name_fr`, `product_name_en`, `unit_price_cents` (copies au moment de l'achat),
`quantity`, `line_total_cents`

### reservations
`id`, `reference` (ex. `R-7Q3K`), `manage_token_hash`, `status` (`confirmed` | `cancelled`),
`start_at`, `end_at`, `party_size`, `customer_name`, `customer_phone`, `customer_email`,
`notes`, `locale`, `created_at`, `updated_at`

**Anti-surréservation** : somme des `party_size` des réservations confirmées qui chevauchent
le créneau, plus le nouveau groupe, ≤ `seating_capacity`. Le contrôle se fait dans une transaction
avec un verrou PostgreSQL, pour gérer deux demandes simultanées.

### opening_hours
`weekday` (0–6, unique), `is_closed`, `open_time`, `close_time`

### shop_settings (une seule ligne)
`seating_capacity`, `reservation_slot_minutes`, `reservation_duration_minutes`,
`max_party_size`, `pickup_slot_minutes`, `pickup_min_lead_minutes`,
`max_orders_per_pickup_slot`

### admin_users
`id`, `email` (unique), `password_hash` (argon2/bcrypt), `created_at`

### admin_sessions
`id`, `token_hash`, `admin_user_id` → admin_users, `expires_at`
(le jeton en clair est dans un cookie httpOnly, Secure, SameSite=Lax)

### contact_messages
`id`, `name`, `email`, `message`, `locale`, `is_read`, `created_at`

## 5. Routes de l'API (préfixe `/api/v1`)

### Publiques
| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | état du serveur |
| GET | `/categories` | catégories |
| GET | `/products?category=&bestseller=&vegetarian=&nut_free=&sort=` | menu |
| GET | `/products/{slug}` | fiche produit |
| GET | `/shop/info` | horaires, infos publiques |
| GET | `/pickup-slots?date=` | créneaux de retrait |
| POST | `/orders` | créer une commande |
| GET | `/orders/{public_id}` | confirmation |
| GET | `/reservations/availability?date=&party_size=` | créneaux libres |
| POST | `/reservations` | créer une réservation |
| GET, PATCH | `/reservations/manage/{token}` | consulter, modifier |
| POST | `/reservations/manage/{token}/cancel` | annuler |
| POST | `/contact` | message de contact |

### Admin (session obligatoire, sinon 401)
| Méthode | Route |
|---|---|
| POST | `/admin/auth/login`, `/admin/auth/logout` |
| GET | `/admin/auth/me` |
| GET, POST, PATCH, DELETE | `/admin/categories[/{id}]` |
| GET, POST, PATCH, DELETE | `/admin/products[/{id}]` |
| POST | `/admin/uploads/image` |
| GET | `/admin/orders?status=&date=`, `/admin/orders/{id}` |
| PATCH | `/admin/orders/{id}/status` |
| GET, PATCH | `/admin/reservations[/{id}]` |
| GET, PUT | `/admin/settings`, `/admin/opening-hours` |
| GET, PATCH | `/admin/contact-messages[/{id}]` |
| GET | `/admin/stats/summary?from=&to=` |
| GET | `/admin/stats/revenue-daily`, `/admin/stats/top-products`, `/admin/stats/peak-hours`, `/admin/stats/reservation-fill-rate` |

## 6. Tests
- Backend : pytest + base PostgreSQL de test, vidée entre chaque test.
- Frontend : Vitest (fonctions, composants), Playwright à partir de la phase 4 (parcours complets).

## 7. Évolutions par rapport à la phase 0

| Sujet | Décision finale |
|---|---|
| URL de l'admin | `/fr/admin` (groupe de routes `(admin)`), interface en français uniquement |
| Pages publiques | groupe de routes `(site)` : header, pied de page, bandeau d'annonce, bouton WhatsApp |
| Limitation des requêtes | limiteur maison en mémoire (`app/core/rate_limit.py`) au lieu de slowapi |
| Erreurs de validation (422) | `{ code: "VALIDATION_ERROR", message, fields: [...] }`, message traduit |
| Cache du menu | `"use cache"` + `cacheTag("menu")`, vidé par une Server Action protégée (`updateTag`) |
| Langue côté serveur | `next/root-params` (Next.js 16.3+) |
| Paramètres de la boutique | table `shop_settings` (+ `reservation_days_ahead`, `pickup_days_ahead`) |
| Hébergement | Site ET API sur Vercel (API : fonction Python, `backend/index.py`), base sur Neon. Render écarté (carte bancaire exigée), `render.yaml` gardé en alternative |
| Connexion à Neon | `DATABASE_URL` pooled pour l'API (*prepared statements* psycopg désactivés, PgBouncer en mode transaction), `DATABASE_URL_UNPOOLED` directe pour Alembic |
| Fermetures exceptionnelles (décision K levée) | table `closures` (`day` clé primaire, `reason`) ; `opening_window` renvoie « fermé » ce jour-là ; routes `GET/PUT/DELETE /admin/closures[/{day}]` ; fermetures à venir dans `/shop/info` |
| E-mails | Resend par HTTP (`app/services/notifications.py`), envoyés après le `commit`, erreurs journalisées sans bloquer ; café prévenu (`NOTIFY_EMAIL`), clients si `CUSTOMER_EMAILS=true` |
| Référencement | `sitemap.ts`, `robots.ts`, Open Graph (`/images/og.jpg`, `metadataBase`), Vercel Analytics |
| Données de production | aucune donnée de démo (supprimées le 22/11/2026) ; `seed_demo` réservé au local |
