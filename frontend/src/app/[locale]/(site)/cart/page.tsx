// Page panier (/fr/cart). Le contenu est interactif : CartView (Client Component).
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart/CartView";
import { PageHeading } from "@/components/ui/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart");
  return { title: t("metaTitle"), robots: { index: false } }; // page personnelle : pas dans Google
}

export default async function CartPage() {
  const t = await getTranslations("Cart");
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading title={t("title")} />
      <CartView />
    </main>
  );
}
