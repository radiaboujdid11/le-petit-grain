// Gestion d'une réservation par lien unique (/fr/reservation/manage/<jeton>).
import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ManageReservationView } from "@/components/reservation/ManageReservationView";
import { PageHeading } from "@/components/ui/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Manage");
  return { title: t("metaTitle"), robots: { index: false } }; // lien privé : jamais dans Google
}

export default async function ManageReservationPage() {
  const t = await getTranslations("Manage");
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading title={t("title")} />
      <Suspense fallback={<p className="py-16 text-center text-vanilla/70">…</p>}>
        <ManageReservationView />
      </Suspense>
    </main>
  );
}
