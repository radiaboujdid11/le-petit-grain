// Finalisation de la commande (/fr/checkout).
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/components/cart/CheckoutView";
import { PageHeading } from "@/components/ui/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function CheckoutPage() {
  const t = await getTranslations("Checkout");
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading title={t("title")} />
      <CheckoutView />
    </main>
  );
}
