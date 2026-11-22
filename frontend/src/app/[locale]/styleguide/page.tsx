// Page /styleguide : vitrine du design system (outil de développement).
// Sera retirée ou protégée avant la mise en ligne.
// Principe visuel : aucune boîte. Cercles, arches et filets fins.
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  ArrowRight, CakeSlice, Coffee, Cookie, Croissant, CupSoda, ShoppingBag,
} from "lucide-react";

// Icônes des 6 catégories du menu. strokeWidth 1.5 = trait fin (2 par défaut).
const categoryIcons = [
  { label: "Coffee", Icon: Coffee },
  { label: "Cold Drinks", Icon: CupSoda },
  { label: "Bakery", Icon: ShoppingBag },
  { label: "Croissants", Icon: Croissant },
  { label: "Brownies & Cookies", Icon: Cookie },
  { label: "Pâtisserie", Icon: CakeSlice },
];

const palette = [
  { name: "Dark Cocoa", className: "bg-cocoa", hex: "#211710", usage: "Fond principal" },
  { name: "Chocolate", className: "bg-chocolate", hex: "#493020", usage: "Fonds secondaires" },
  { name: "Caramel", className: "bg-caramel", hex: "#805333", usage: "Filets uniquement" },
  { name: "Toffee", className: "bg-toffee", hex: "#B9824E", usage: "Accent (sur cocoa)" },
  { name: "Golden Cream", className: "bg-cream", hex: "#D7B98D", usage: "Accent, sous-titres" },
  { name: "Vanilla", className: "bg-vanilla", hex: "#F2E6D5", usage: "Texte principal" },
];

// Produits fictifs pour la démonstration (prix réalistes en dirhams)
const sampleProducts = [
  { category: "Croissants", name: "Croissant aux amandes", price: "22,00 DH" },
  { category: "Croissants", name: "Pain au chocolat", price: "16,00 DH" },
  { category: "Coffee", name: "Cappuccino", price: "28,00 DH" },
  { category: "Brownies & Cookies", name: "Brownie noix de pécan", price: "25,00 DH" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-8">
      {/* Typographie */}
      <section className="mb-24 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.25em] text-toffee">
          Design system
        </p>
        <h1 className="font-serif text-5xl font-medium sm:text-7xl">
          Le Petit Grain
        </h1>
        <p className="mt-4 font-serif text-2xl italic text-cream sm:text-3xl">
          A little moment of joy.
        </p>
        <p className="mt-2 text-vanilla/80">Coffee, pastries &amp; warmth.</p>
      </section>

      {/* Logo : les deux variantes séparées par un filet vertical */}
      <section className="mb-24">
        <SectionTitle>Logo</SectionTitle>
        <div className="flex flex-col items-center justify-center gap-10 text-cream md:flex-row md:gap-16">
          <Logo variant="stacked" />
          <div className="h-px w-16 bg-caramel md:h-32 md:w-px" />
          <Logo variant="horizontal" />
        </div>
        {/* Le grain seul, en plusieurs tailles, + un médaillon clair rond */}
        <div className="mt-14 flex items-end justify-center gap-6 text-toffee">
          <BeanIcon className="h-4 w-4" />
          <BeanIcon className="h-6 w-6" />
          <BeanIcon className="h-10 w-10" />
          <BeanIcon className="h-16 w-16" />
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-vanilla text-cocoa">
            <BeanIcon className="h-12 w-12" />
          </div>
        </div>
      </section>

      {/* Boutons */}
      <section className="mb-24">
        <SectionTitle>Boutons</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href="/">
            Voir le menu <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button variant="secondary">Réserver une table</Button>
          <Button variant="ghost">En savoir plus</Button>
          <Button size="lg">Commander</Button>
          <Button disabled>Indisponible</Button>
        </div>
      </section>

      {/* Icônes : chacune dans un cercle au trait fin */}
      <section className="mb-24">
        <SectionTitle>Icônes</SectionTitle>
        <ul className="grid grid-cols-3 gap-y-8 sm:grid-cols-6">
          {categoryIcons.map(({ label, Icon }) => (
            <li key={label} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-caramel">
                <Icon className="h-7 w-7 text-toffee" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-vanilla/80">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cartes produit (données fictives) */}
      <section className="mb-24">
        <SectionTitle intro="Nos best-sellers, préparés chaque matin dans notre fournil.">
          Produits
        </SectionTitle>
        {/* Grille du skill : 2 colonnes mobile, 3 tablette, 4 ordinateur */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
          {sampleProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>

      {/* Palette : des cercles, comme sur la référence */}
      <section>
        <SectionTitle>Palette</SectionTitle>
        <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {palette.map((color) => (
            <li key={color.name} className="flex items-center gap-4">
              {/* Bordure fine pour que le cercle cocoa reste visible sur le fond cocoa */}
              <span className={`h-14 w-14 shrink-0 rounded-full border border-cream/30 ${color.className}`} />
              <div>
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-cream">{color.hex}</p>
                <p className="text-sm text-vanilla/80">{color.usage}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
