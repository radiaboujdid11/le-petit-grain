"use client";
// Page panier : lignes (quantité modifiable), sous-total indicatif, passage à la commande.
// Les noms et prix affichés viennent de l'API (langue courante) ; le total définitif
// sera recalculé par le backend à la commande.

import Image from "next/image";
import { Croissant, Minus, Plus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/api";
import { MAX_QUANTITY, subtotalCents } from "@/lib/cart";
import { formatPrice, type Locale } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useCart } from "./CartProvider";

export function CartView() {
  const t = useTranslations("Cart");
  const tProduct = useTranslations("ProductPage");
  const locale = useLocale() as Locale;
  const { lines, ready, update, remove } = useCart();
  const { data: products, loading } = useApi<Product[]>("/products");

  if (!ready || (lines.length > 0 && loading)) {
    return <p className="py-20 text-center text-vanilla/80" role="status">{t("loading")}</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <p className="text-lg text-vanilla/80">{t("empty")}</p>
        <Button href="/menu">{t("browse")}</Button>
      </div>
    );
  }

  const bySlug = Object.fromEntries((products ?? []).map((p) => [p.slug, p]));
  const prices = Object.fromEntries((products ?? []).map((p) => [p.slug, p.price_cents]));
  const blocked = lines.some((line) => !bySlug[line.slug]?.is_available);
  const stepper = "flex h-9 w-9 items-center justify-center rounded-full border border-caramel text-cream hover:border-cream disabled:opacity-40";

  return (
    <div className="mx-auto max-w-2xl">
      <ul className="divide-y divide-caramel/40 border-y border-caramel/40">
        {lines.map((line) => {
          const product = bySlug[line.slug];
          const name = product?.name ?? line.slug;
          return (
            <li key={line.slug} className="flex items-center gap-4 py-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-chocolate">
                {product?.image_url ? (
                  <Image src={product.image_url} alt="" fill sizes="64px" className="photo object-cover" />
                ) : (
                  <Croissant className="m-auto mt-4 h-8 w-8 text-caramel" strokeWidth={1} aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/menu/${line.slug}`} className="font-serif text-xl hover:text-cream">{name}</Link>
                {product && <p className="text-sm text-cream">{formatPrice(product.price_cents, locale)}</p>}
                {!product?.is_available && <p className="text-xs text-red-200">{t("unavailable")}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className={stepper} aria-label={tProduct("decrease")} onClick={() => update(line.slug, line.quantity - 1)}>
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-6 text-center" aria-live="polite">{line.quantity}</span>
                <button type="button" className={stepper} aria-label={tProduct("increase")} disabled={line.quantity >= MAX_QUANTITY} onClick={() => update(line.slug, line.quantity + 1)}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <button type="button" onClick={() => remove(line.slug)} aria-label={t("remove", { name })} className="p-2 text-vanilla/60 hover:text-cream">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-vanilla/80">{t("subtotal")}</span>
        <span className="font-serif text-3xl text-cream">{formatPrice(subtotalCents(lines, prices), locale)}</span>
      </div>
      <p className="mt-2 text-sm text-vanilla/70">{t("payOnPickup")}</p>
      <p className="text-xs text-vanilla/50">{t("priceNote")}</p>

      <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
        <Button href="/menu" variant="ghost">← {t("continue")}</Button>
        {blocked ? (
          <Button disabled>{t("checkout")}</Button>
        ) : (
          <Button href="/checkout" size="lg">{t("checkout")}</Button>
        )}
      </div>
    </div>
  );
}
