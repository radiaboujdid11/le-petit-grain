// Confirmation / suivi de commande (/fr/order/<identifiant>).
// L'identifiant est lu dans le navigateur (OrderView) : la page n'est jamais mise en cache.
import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { OrderView } from "@/components/cart/OrderView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Order");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default function OrderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      {/* Suspense : la partie qui lit l'URL est complétée dans le navigateur */}
      <Suspense fallback={<p className="py-24 text-center text-vanilla/70">…</p>}>
        <OrderView />
      </Suspense>
    </main>
  );
}
