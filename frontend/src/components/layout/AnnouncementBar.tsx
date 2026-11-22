import { useTranslations } from "next-intl";

// Bandeau d'annonce tout en haut du site (skill, structure de page n° 1).
// Message court, adapté à la V1 : commande à emporter, paiement au retrait.

export function AnnouncementBar() {
  const t = useTranslations("Announcement");
  return (
    <div className="border-b border-caramel/30 bg-chocolate px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-cream">
      {t("text")}
    </div>
  );
}
