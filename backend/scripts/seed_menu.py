"""Remplit le menu : 6 catégories et leurs produits (prix réalistes en dirhams).

Lancer depuis le dossier backend/ :
    .venv\\Scripts\\python.exe -m scripts.seed_menu

IDEMPOTENT : on peut le relancer sans créer de doublons (mise à jour par slug).
Les images pointent vers frontend/public/images (Cloudinary en phase 7).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Category, Product

# (slug, nom FR, nom EN) — dans l'ordre d'affichage
CATEGORIES = [
    ("coffee", "Cafés", "Coffee"),
    ("cold-drinks", "Boissons fraîches", "Cold Drinks"),
    ("bakery", "Boulangerie", "Bakery"),
    ("croissants", "Croissants", "Croissants"),
    ("brownies-cookies", "Brownies & Cookies", "Brownies & Cookies"),
    ("patisserie", "Pâtisserie", "Pâtisserie"),
]

# Indicateurs : B = best-seller, V = végétarien, N = fruits à coque, G = gluten
# (catégorie, slug, nom FR, nom EN, description FR, description EN, prix en DH, image, indicateurs)
PRODUCTS = [
    # Cafés
    ("coffee", "espresso", "Espresso", "Espresso",
     "Notre mélange maison, torréfié chaque semaine.", "Our house blend, roasted weekly.",
     15, "/images/gallery/espresso.webp", "V"),
    ("coffee", "cappuccino", "Cappuccino", "Cappuccino",
     "Espresso, lait mousseux et latte art.", "Espresso, frothy milk and latte art.",
     28, None, "V"),
    ("coffee", "flat-white", "Flat white", "Flat white",
     "Double ristretto et micro-mousse de lait.", "Double ristretto with velvety microfoam.",
     32, None, "V"),
    ("coffee", "latte-vanille", "Latte vanille", "Vanilla latte",
     "Vanille de Madagascar infusée, chantilly maison.", "Infused Madagascar vanilla, house whipped cream.",
     35, "/images/drinks/vanille.webp", "V"),
    ("coffee", "chocolat-amlou", "Chocolat chaud à l'amlou", "Amlou hot chocolate",
     "Amande grillée, huile d'argan et miel.", "Toasted almond, argan oil and honey.",
     40, "/images/drinks/amlou.webp", "VN"),
    # Boissons fraîches
    ("cold-drinks", "iced-latte", "Iced latte", "Iced latte",
     "Espresso glacé et lait d'avoine.", "Iced espresso and oat milk.",
     30, "/images/drinks/classique.webp", "V"),
    ("cold-drinks", "iced-caramel-latte", "Iced latte caramel", "Iced caramel latte",
     "Caramel au beurre salé cuit maison.", "House-made salted butter caramel.",
     35, "/images/drinks/caramel.webp", "V"),
    ("cold-drinks", "iced-moka", "Iced moka", "Iced mocha",
     "Chocolat noir 64 % et voile de cacao.", "64% dark chocolate and a dusting of cocoa.",
     38, "/images/drinks/moka.webp", "V"),
    ("cold-drinks", "iced-cannelle", "Iced latte cannelle", "Iced cinnamon latte",
     "Cannelle de Ceylan et cardamome.", "Ceylon cinnamon and cardamom.",
     35, "/images/drinks/cannelle.webp", "V"),
    ("cold-drinks", "citronnade-menthe", "Citronnade à la menthe", "Mint lemonade",
     "Citrons pressés et menthe fraîche.", "Freshly squeezed lemons and fresh mint.",
     25, None, "V"),
    # Boulangerie
    ("bakery", "baguette-tradition", "Baguette tradition", "Traditional baguette",
     "Levain naturel, croûte dorée.", "Natural sourdough, golden crust.",
     6, None, "VG"),
    ("bakery", "pain-campagne", "Pain de campagne", "Country loaf",
     "Farine de seigle et longue fermentation.", "Rye flour and slow fermentation.",
     22, None, "VG"),
    ("bakery", "msemen", "Msemen", "Msemen",
     "Crêpe feuilletée marocaine, beurre et miel.", "Flaky Moroccan flatbread, butter and honey.",
     8, None, "VG"),
    # Croissants
    ("croissants", "croissant-beurre", "Croissant pur beurre", "Butter croissant",
     "Feuilletage doré au beurre de baratte.", "Golden layers of churned butter.",
     14, None, "VG"),
    ("croissants", "pain-au-chocolat", "Pain au chocolat", "Pain au chocolat",
     "Deux barres de chocolat noir 64 %.", "Two bars of 64% dark chocolate.",
     16, None, "VG"),
    ("croissants", "croissant-amandes", "Croissant aux amandes", "Almond croissant",
     "Crème d'amande et amandes effilées.", "Almond cream and flaked almonds.",
     22, None, "VNG"),
    ("croissants", "croissant-chocolat", "Croissant au chocolat", "Chocolate croissant",
     "Nappé de chocolat noir et pépites.", "Topped with dark chocolate and chips.",
     22, "/images/products/croissant-chocolat.webp", "BVG"),
    ("croissants", "croissant-crumble", "Croissant crème & crumble", "Cream & crumble croissant",
     "Crème pâtissière vanille, crumble croustillant.", "Vanilla custard and crunchy crumble.",
     26, "/images/gallery/croissant-crumble.webp", "VG"),
    # Brownies & Cookies
    ("brownies-cookies", "brownie-fondant", "Brownie fondant", "Fudgy brownie",
     "Chocolat noir, cœur fondant.", "Dark chocolate with a gooey centre.",
     25, "/images/products/brownie.webp", "BVG"),
    ("brownies-cookies", "cookie-noisette", "Cookie chocolat noisette", "Chocolate hazelnut cookie",
     "Pépites de chocolat et noisettes torréfiées.", "Chocolate chips and roasted hazelnuts.",
     18, None, "VNG"),
    ("brownies-cookies", "cookie-pistache", "Cookie pistache", "Pistachio cookie",
     "Pistaches entières et chocolat blanc.", "Whole pistachios and white chocolate.",
     20, None, "VNG"),
    # Pâtisserie
    ("patisserie", "fondant-chocolat", "Fondant au chocolat", "Chocolate lava cake",
     "Cœur coulant, chantilly et éclats de chocolat.", "Molten centre, whipped cream and chocolate shards.",
     38, "/images/products/fondant-chocolat.webp", "BVG"),
    ("patisserie", "cupcake-mure", "Cupcake mûre & cacao", "Blackberry cocoa cupcake",
     "Crème au beurre à la mûre, base cacao.", "Blackberry buttercream on a cocoa sponge.",
     30, "/images/products/cupcake-mure.webp", "BVG"),
    ("patisserie", "tarte-citron", "Tarte au citron meringuée", "Lemon meringue tart",
     "Crème citron acidulée, meringue flambée.", "Tangy lemon curd and torched meringue.",
     35, None, "VG"),
    ("patisserie", "cornes-gazelle", "Cornes de gazelle", "Gazelle horns",
     "Pâte d'amande parfumée à la fleur d'oranger.", "Almond paste scented with orange blossom.",
     12, None, "VNG"),
]


def seed_menu(db: Session) -> None:
    """Crée ou met à jour les catégories et produits (sans commit : l'appelant décide)."""
    categories: dict[str, Category] = {}
    for order, (slug, name_fr, name_en) in enumerate(CATEGORIES):
        category = db.scalar(select(Category).where(Category.slug == slug)) or Category(slug=slug)
        category.name_fr, category.name_en, category.sort_order = name_fr, name_en, order
        category.is_active = True
        db.add(category)
        categories[slug] = category

    for order, row in enumerate(PRODUCTS):
        cat, slug, name_fr, name_en, desc_fr, desc_en, price_dh, image, flags = row
        product = db.scalar(select(Product).where(Product.slug == slug)) or Product(slug=slug)
        product.category = categories[cat]
        product.name_fr, product.name_en = name_fr, name_en
        product.description_fr, product.description_en = desc_fr, desc_en
        product.price_cents = price_dh * 100  # dirhams → centimes
        product.image_url = image
        product.is_available = True
        product.is_bestseller = "B" in flags
        product.is_vegetarian = "V" in flags
        product.contains_nuts = "N" in flags
        product.contains_gluten = "G" in flags
        product.sort_order = order
        db.add(product)
    db.flush()


if __name__ == "__main__":
    from app.database import SessionLocal

    with SessionLocal() as session:
        seed_menu(session)
        session.commit()
        print(f"Menu prêt : {len(CATEGORIES)} catégories, {len(PRODUCTS)} produits.")
