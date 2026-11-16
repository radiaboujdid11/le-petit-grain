// Parfums du « bar glacé » de la page d'accueil.
// Données locales pour l'instant ; elles pourront venir de l'API plus tard.
//
// Le gobelet a 3 couches (de bas en haut) :
//   1. cold brew      (coldBrewColor)
//   2. lait + sirop   (milkColor, marbré avec syrupColor)
//   3. espresso       (espressoColor)
// Les hauteurs sont des fractions de la hauteur intérieure du gobelet (0 à 1).

import type { Locale } from "@/lib/format";

// Un texte dans les deux langues du site
export type Localized = Record<Locale, string>;

// Ingrédients illustrés sur les médaillons (une illustration SVG par clé)
export type Ingredient =
  | "bean" | "caramel" | "vanilla" | "hazelnut" | "chocolate" | "cinnamon" | "almond";

export type Flavor = {
  id: string;
  name: Localized;
  tagline: Localized; // phrase courte sous le nom
  description: Localized; // pour la section détail
  priceCents: number; // prix taille M, en centimes
  ingredient: Ingredient;
  colors: {
    syrup: string | null; // null = pas de sirop (Classique)
    milk: string;
    espresso: string;
    coldBrew: string;
    accent: string; // halo lumineux derrière le gobelet
  };
  heights: { coldBrew: number; milk: number; espresso: number };
  taste: { sweetness: number; body: number; bitterness: number }; // 0 à 100
  image?: string; // facultatif : PNG détouré qui remplacera le gobelet SVG
};

// Couleurs communes à toutes les boissons
const ESPRESSO = "#3B1F12";
const COLD_BREW = "#5A3420";
const OAT_MILK = "#EADBC4";

export const flavors: Flavor[] = [
  {
    id: "classic",
    name: { fr: "Classique", en: "Classic" },
    tagline: { fr: "Espresso, lait d'avoine, rien d'autre", en: "Espresso, oat milk, nothing else" },
    description: {
      fr: "Notre mélange maison, torréfié chaque semaine, allongé d'un lait d'avoine onctueux. Le goût du café, tout simplement.",
      en: "Our house blend, roasted weekly, poured over creamy oat milk. Coffee, plain and simple.",
    },
    priceCents: 3000,
    ingredient: "bean",
    colors: { syrup: null, milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#B9824E" },
    heights: { coldBrew: 0.22, milk: 0.4, espresso: 0.2 },
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
    ingredient: "caramel",
    colors: { syrup: "#C8892E", milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#C8892E" },
    heights: { coldBrew: 0.2, milk: 0.42, espresso: 0.2 },
    taste: { sweetness: 80, body: 55, bitterness: 35 },
  },
  {
    id: "vanilla",
    name: { fr: "Vanille", en: "Vanilla" },
    tagline: { fr: "Gousse de vanille de Madagascar", en: "Madagascar vanilla bean" },
    description: {
      fr: "Des gousses fendues et infusées lentement dans un sirop léger. Doux, floral, réconfortant.",
      en: "Split vanilla pods slowly infused into a light syrup. Soft, floral and comforting.",
    },
    priceCents: 3500,
    ingredient: "vanilla",
    colors: { syrup: "#EFDDB0", milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#D7B98D" },
    heights: { coldBrew: 0.2, milk: 0.44, espresso: 0.18 },
    taste: { sweetness: 70, body: 50, bitterness: 30 },
  },
  {
    id: "hazelnut",
    name: { fr: "Noisette", en: "Hazelnut" },
    tagline: { fr: "Praliné de noisettes torréfiées", en: "Roasted hazelnut praline" },
    description: {
      fr: "Des noisettes grillées puis broyées en praliné : une boisson ronde, gourmande, aux notes de biscuit.",
      en: "Toasted hazelnuts ground into a praline: round, indulgent, with biscuity notes.",
    },
    priceCents: 3500,
    ingredient: "hazelnut",
    colors: { syrup: "#9C6B3F", milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#9C6B3F" },
    heights: { coldBrew: 0.2, milk: 0.42, espresso: 0.2 },
    taste: { sweetness: 60, body: 70, bitterness: 45 },
  },
  {
    id: "mocha",
    name: { fr: "Moka", en: "Mocha" },
    tagline: { fr: "Chocolat noir 64 % fondu", en: "Melted 64% dark chocolate" },
    description: {
      fr: "Le chocolat noir de nos pains au chocolat, fondu dans le lait. Intense et velouté.",
      en: "The dark chocolate from our pains au chocolat, melted into the milk. Deep and velvety.",
    },
    priceCents: 3800,
    ingredient: "chocolate",
    colors: { syrup: "#3D2116", milk: "#E2CDB2", espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#6B3B26" },
    heights: { coldBrew: 0.18, milk: 0.42, espresso: 0.22 },
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
    ingredient: "cinnamon",
    colors: { syrup: "#A9532A", milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#A9532A" },
    heights: { coldBrew: 0.2, milk: 0.42, espresso: 0.2 },
    taste: { sweetness: 50, body: 60, bitterness: 40 },
  },
  {
    id: "amlou",
    name: { fr: "Amlou", en: "Amlou" },
    tagline: { fr: "Amande, huile d'argan et miel", en: "Almond, argan oil and honey" },
    description: {
      fr: "Notre clin d'œil marocain : l'amlou d'amandes grillées, d'argan et de miel, fondu dans un latte glacé.",
      en: "Our Moroccan touch: amlou made of toasted almonds, argan oil and honey, swirled into an iced latte.",
    },
    priceCents: 4000,
    ingredient: "almond",
    colors: { syrup: "#B07A3E", milk: OAT_MILK, espresso: ESPRESSO, coldBrew: COLD_BREW, accent: "#C99A5B" },
    heights: { coldBrew: 0.2, milk: 0.44, espresso: 0.18 },
    taste: { sweetness: 65, body: 75, bitterness: 30 },
  },
];

// Tailles de gobelet : écart de prix par rapport à la taille M (en centimes)
export const cupSizes = [
  { id: "S", deltaCents: -500 },
  { id: "M", deltaCents: 0 },
  { id: "L", deltaCents: 500 },
] as const;
