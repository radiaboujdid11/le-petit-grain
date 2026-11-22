import { useLocale, useTranslations } from "next-intl";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Locale } from "@/lib/format";
import { formatPrice } from "@/lib/format";

// Données d'exemple dans les deux langues : elles viendront de l'API à l'étape suivante.
const bestSellers = [
  {
    category: { fr: "Croissants", en: "Croissants" },
    name: { fr: "Croissant au chocolat", en: "Chocolate croissant" },
    priceCents: 2200,
    image: "/images/products/croissant-chocolat.webp",
  },
  {
    category: { fr: "Pâtisserie", en: "Pâtisserie" },
    name: { fr: "Fondant au chocolat", en: "Chocolate lava cake" },
    priceCents: 3800,
    image: "/images/products/fondant-chocolat.webp",
  },
  {
    category: { fr: "Brownies & Cookies", en: "Brownies & Cookies" },
    name: { fr: "Brownie fondant", en: "Fudgy brownie" },
    priceCents: 2500,
    image: "/images/products/brownie.webp",
  },
  {
    category: { fr: "Pâtisserie", en: "Pâtisserie" },
    name: { fr: "Cupcake mûre & cacao", en: "Blackberry cocoa cupcake" },
    priceCents: 3000,
    image: "/images/products/cupcake-mure.webp",
  },
];

export function BestSellers() {
  const t = useTranslations("BestSellers");
  const locale = useLocale() as Locale;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro={t("intro")}>{t("title")}</SectionTitle>
      {/* 2 colonnes mobile, 3 tablette, 4 ordinateur */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
        {bestSellers.map((product) => (
          <ProductCard
            key={product.image}
            category={product.category[locale]}
            name={product.name[locale]}
            price={formatPrice(product.priceCents, locale)} // « 22,00 DH » ou « 22.00 MAD »
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
}
