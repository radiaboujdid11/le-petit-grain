import { CakeSlice, Coffee, Cookie, Croissant, CupSoda, Wheat, type LucideIcon } from "lucide-react";
import { locale as rootLocale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/format";
import { getCategories } from "@/lib/menu";

// Icône de chaque catégorie (par slug) ; icône par défaut pour une nouvelle catégorie
const ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  "cold-drinks": CupSoda,
  bakery: Wheat,
  croissants: Croissant,
  "brownies-cookies": Cookie,
  patisserie: CakeSlice,
};

// Section « Nos univers » (skill, style B) : les catégories en cercles, liens vers le menu.
export async function Categories() {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("Home");
  const categories = await getCategories(locale);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 md:px-8">
      <SectionTitle intro={t("categoriesIntro")}>{t("categoriesTitle")}</SectionTitle>
      <ul className="grid grid-cols-3 gap-y-10 md:grid-cols-6">
        {categories.map((category) => {
          const Icon = ICONS[category.slug] ?? Coffee;
          return (
            <li key={category.slug}>
              <Link
                href={`/menu#cat-${category.slug}`}
                className="group flex flex-col items-center gap-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-caramel transition duration-300 ease-brand group-hover:-translate-y-1 group-hover:border-cream">
                  <Icon className="h-8 w-8 text-toffee transition-colors duration-300 group-hover:text-cream" strokeWidth={1.5} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-vanilla/90">
                  {category.name}
                </span>
                <span className="text-[11px] tracking-[0.1em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {t("discover")} →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
