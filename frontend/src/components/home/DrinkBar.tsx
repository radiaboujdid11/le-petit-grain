import { DrinkShowcase } from "@/components/bar/DrinkShowcase";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Section de l'accueil : la vitrine animée des boissons.
export function DrinkBar() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-24">
      <SectionTitle intro="Glacées ou réconfortantes, nos boissons sont préparées à la minute au comptoir.">
        Choisissez votre café
      </SectionTitle>
      <DrinkShowcase />
    </section>
  );
}
