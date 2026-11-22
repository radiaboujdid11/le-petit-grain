// Réservation de table (/fr/reservation).
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReservationView } from "@/components/reservation/ReservationView";
import { PageHeading } from "@/components/ui/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Reservation");
  return { title: t("metaTitle"), description: t("intro") };
}

export default async function ReservationPage() {
  const t = await getTranslations("Reservation");
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <ReservationView />
    </main>
  );
}
