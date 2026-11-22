// Page Menu (/fr/menu, /en/menu), d'après la maquette Claude Design.
// Données RÉELLES du backend (catégories + produits), mises en cache (lib/menu.ts).

import type { Metadata } from "next";
import Image from "next/image";
import { locale as rootLocale } from "next/root-params";
import { Leaf, Nut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import type { Locale } from "@/lib/format";
import { getCategories, getProducts } from "@/lib/menu";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Menu");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function MenuPage() {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("Menu");

  // Les deux appels partent EN MÊME TEMPS (Promise.all) au lieu de l'un après l'autre
  const [categories, products] = await Promise.all([getCategories(locale), getProducts(locale)]);

  // Regroupe les produits par catégorie, dans l'ordre des catégories
  const sections = categories
    .map((category) => ({
      category,
      products: products.filter((p) => p.category.slug === category.slug),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24">
      {/* En-tête : grain, titre, slogan, photo en arche avec un contour Caramel décalé */}
      <header className="flex flex-col items-center gap-3 pt-14 pb-10 text-center">
        <BeanIcon className="h-12 w-12 text-cream" />
        <p className="text-[11px] uppercase tracking-[0.3em] text-toffee">{t("eyebrow")}</p>
        <h1 className="font-serif text-5xl font-medium tracking-[0.04em]">{t("title")}</h1>
        <p className="font-serif text-xl text-cream italic">{t("subtitle")}</p>

        <div className="relative mt-8 h-80 w-60">
          <span
            className="absolute -inset-x-2.5 -top-2.5 bottom-0 rounded-t-full border border-b-0 border-caramel"
            aria-hidden="true"
          />
          <div className="absolute inset-0 overflow-hidden rounded-t-full bg-chocolate">
            <Image
              src="/images/hero/hero-latte-mobile.webp"
              alt={t("photoAlt")}
              fill
              sizes="240px"
              quality={90}
              className="photo object-cover"
            />
          </div>
        </div>
      </header>

      {/* Barre des catégories collante, filtres et sections (Client Component) */}
      <MenuBrowser sections={sections} />

      {/* Légende des icônes */}
      <aside
        aria-label={t("legendTitle")}
        className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-caramel/40 pt-8 text-xs tracking-[0.06em] text-vanilla/80"
      >
        <span className="inline-flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5 text-cream" strokeWidth={1.5} aria-hidden="true" />
          {t("vegetarian")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Nut className="h-3.5 w-3.5 text-cream" strokeWidth={1.5} aria-hidden="true" />
          {t("nuts")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-cream">✦ {t("bestseller")}</span>
      </aside>
    </main>
  );
}
