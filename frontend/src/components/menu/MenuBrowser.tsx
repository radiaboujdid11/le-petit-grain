"use client";
// Partie interactive du menu (maquette Claude Design) :
// - barre des catégories COLLANTE sous le header, qui surligne la section visible ;
// - filtres « Végétarien » et « Sans fruits à coque » (décision I de l'architecture).

import { useEffect, useMemo, useState } from "react";
import { Leaf, Nut } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category, Product } from "@/lib/api";
import { MenuSection } from "./MenuSection";

type Section = { category: Category; products: Product[] };

export function MenuBrowser({ sections }: { sections: Section[] }) {
  const t = useTranslations("MenuPage");
  const [vegetarian, setVegetarian] = useState(false);
  const [nutFree, setNutFree] = useState(false);
  const [active, setActive] = useState(sections[0]?.category.slug ?? "");

  // Applique les filtres, puis masque les sections devenues vides
  const visible = useMemo(
    () =>
      sections
        .map(({ category, products }) => ({
          category,
          products: products.filter(
            (p) => (!vegetarian || p.is_vegetarian) && (!nutFree || !p.contains_nuts),
          ),
        }))
        .filter((section) => section.products.length > 0),
    [sections, vegetarian, nutFree],
  );

  // « Scroll spy » : IntersectionObserver signale la section qui traverse le milieu de l'écran
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }, // une fine bande au centre de l'écran
    );
    for (const { category } of visible) {
      const element = document.getElementById(`cat-${category.slug}`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [visible]);

  function goTo(slug: string) {
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filterClass = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
      on ? "border-cream bg-cream text-cocoa" : "border-caramel text-vanilla/80 hover:border-cream"
    }`;

  return (
    <>
      {/* Barre collante : top-20 = juste sous le header (80px) */}
      <nav
        aria-label={t("sections")}
        className="sticky top-20 z-30 -mx-6 border-b border-caramel/60 bg-cocoa/95 backdrop-blur-sm"
      >
        <div className="flex gap-6 overflow-x-auto px-6 [scrollbar-width:none] lg:justify-center">
          {visible.map(({ category }) => {
            const on = category.slug === active;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => goTo(category.slug)}
                aria-current={on ? "true" : undefined}
                className={`-mb-px min-h-12 shrink-0 border-b py-4 text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-200 ${
                  on ? "border-cream text-cream" : "border-transparent text-vanilla/80 hover:text-vanilla"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Filtres : boutons « bascule » (aria-pressed indique l'état aux lecteurs d'écran) */}
      <div role="group" aria-label={t("filters")} className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" aria-pressed={vegetarian} onClick={() => setVegetarian(!vegetarian)} className={filterClass(vegetarian)}>
          <Leaf className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> {t("vegetarian")}
        </button>
        <button type="button" aria-pressed={nutFree} onClick={() => setNutFree(!nutFree)} className={filterClass(nutFree)}>
          <Nut className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> {t("nutFree")}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-vanilla/80" role="status">{t("noResults")}</p>
      ) : (
        // 1 colonne sur mobile ; 2 colonnes dès 990px, comme le menu imprimé A4
        <div className="mx-auto max-w-md lg:max-w-none lg:columns-2 lg:gap-20">
          {visible.map(({ category, products }) => (
            <MenuSection key={category.slug} category={category} products={products} />
          ))}
        </div>
      )}
    </>
  );
}
