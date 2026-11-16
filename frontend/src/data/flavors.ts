// Boissons de la section « Choisissez votre café » de la page d'accueil.
// Données locales pour l'instant ; elles pourront venir de l'API plus tard.
// Chaque boisson a sa vraie photo (même format 4:5) dans public/images/drinks/.

import type { Locale } from "@/lib/format";

// Un texte dans les deux langues du site
export type Localized = Record<Locale, string>;

export type Flavor = {
  id: string;
  name: Localized;
  tagline: Localized; // phrase courte sous le nom
  description: Localized; // pour la section détail
  priceCents: number; // prix taille M, en centimes
  image: string; // photo 4:5
  accent: string; // couleur du halo lumineux derrière la photo
  taste: { sweetness: number; body: number; bitterness: number }; // 0 à 100
};

export const flavors: Flavor[] = [
  {
    id: "classic",
    name: { fr: "Classique", en: "Classic" },
    tagline: { fr: "Espresso glacé, lait d'avoine", en: "Iced espresso, oat milk" },
    description: {
      fr: "Notre mélange maison, torréfié chaque semaine, versé sur un lait d'avoine onctueux. Le goût du café, tout simplement.",
      en: "Our house blend, roasted weekly, poured over creamy oat milk. Coffee, plain and simple.",
    },
    priceCents: 3000,
    image: "/images/drinks/classique.webp",
    accent: "#B9824E",
    taste: { sweetness: 20, body: 65, bitterness: 70 },
  },
  {
    id: "caramel",
    name: { fr: "Caramel", en: "Caramel" },
    tagline: { fr: "Caramel au beurre salé, cuit maison", en: "House-made salted butter caramel" },
    description: {
      fr: "Un caramel cuit dans notre fournil, une pointe de fleur de sel, et cette note dorée qui adoucit l'espresso.",
      en: "Caramel cooked in our bakery with a pinch of sea salt: a golden note that softens the espresso.",
    },
    priceCents: 3500,
    image: "/images/drinks/caramel.webp",
    accent: "#C8892E",
    taste: { sweetness: 80, body: 55, bitterness: 35 },
  },
  {
    id: "vanilla",
    name: { fr: "Vanille", en: "Vanilla" },
    tagline: { fr: "Latte vanille, chantilly maison", en: "Vanilla latte, house whipped cream" },
    description: {
      fr: "Des gousses de vanille de Madagascar infusées lentement, une mousse de lait et une chantilly fouettée minute.",
      en: "Madagascar vanilla pods slowly infused, milk foam and freshly whipped cream.",
    },
    priceCents: 3500,
    image: "/images/drinks/vanille.webp",
    accent: "#D7B98D",
    taste: { sweetness: 70, body: 50, bitterness: 30 },
  },
  {
    id: "mocha",
    name: { fr: "Moka", en: "Mocha" },
    tagline: { fr: "Chocolat noir et cacao en poudre", en: "Dark chocolate and cocoa powder" },
    description: {
      fr: "Le chocolat noir de nos pains au chocolat, fondu dans le lait, et un voile de cacao sur la glace. Intense et velouté.",
      en: "The dark chocolate from our pains au chocolat, melted into the milk, with a dusting of cocoa. Deep and velvety.",
    },
    priceCents: 3800,
    image: "/images/drinks/moka.webp",
    accent: "#8A4B2E",
    taste: { sweetness: 55, body: 85, bitterness: 60 },
  },
  {
    id: "cinnamon",
    name: { fr: "Cannelle", en: "Cinnamon" },
    tagline: { fr: "Cannelle de Ceylan et cardamome", en: "Ceylon cinnamon and cardamom" },
    description: {
      fr: "Les épices des souks, infusées à froid : chaleureux, légèrement piquant, parfait à l'heure du goûter.",
      en: "Spices from the souks, cold-infused: warm, gently spicy, perfect for an afternoon break.",
    },
    priceCents: 3500,
    image: "/images/drinks/cannelle.webp",
    accent: "#A9532A",
    taste: { sweetness: 50, body: 60, bitterness: 40 },
  },
  {
    id: "amlou",
    name: { fr: "Amlou", en: "Amlou" },
    tagline: { fr: "Chocolat chaud, amande, argan et miel", en: "Hot chocolate, almond, argan and honey" },
    description: {
      fr: "Notre clin d'œil marocain : l'amlou d'amandes grillées, d'argan et de miel, fondu dans un chocolat chaud.",
      en: "Our Moroccan touch: amlou made of toasted almonds, argan oil and honey, melted into a hot chocolate.",
    },
    priceCents: 4000,
    image: "/images/drinks/amlou.webp",
    accent: "#C99A5B",
    taste: { sweetness: 65, body: 75, bitterness: 30 },
  },
];

// Tailles : écart de prix par rapport à la taille M (en centimes)
export const cupSizes = [
  { id: "S", deltaCents: -500 },
  { id: "M", deltaCents: 0 },
  { id: "L", deltaCents: 500 },
] as const;
