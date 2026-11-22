import { useTranslations } from "next-intl";
import { DrinkShowcase } from "@/components/bar/DrinkShowcase";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Section de l'accueil : la vitrine animée des boissons.
export function DrinkBar() {
  const t = useTranslations("DrinkBar");
  return (
    <section className="relative w-full overflow-hidden px-4 py-24">
      <SectionTitle intro={t("intro")}>{t("title")}</SectionTitle>
      <DrinkShowcase />
    </section>
  );
}
