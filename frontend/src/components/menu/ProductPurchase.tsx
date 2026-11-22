"use client";
// Choix de la quantité + ajout au panier, sur la fiche produit.

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { MAX_QUANTITY } from "@/lib/cart";

export function ProductPurchase({ slug, available }: { slug: string; available: boolean }) {
  const t = useTranslations("ProductPage");
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!available) {
    return <p className="text-sm uppercase tracking-[0.2em] text-cream">{t("unavailable")}</p>;
  }

  const stepper = "flex h-11 w-11 items-center justify-center rounded-full border border-caramel text-cream transition-colors hover:border-cream disabled:opacity-40";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-[0.2em] text-vanilla/80">{t("quantity")}</span>
        <button type="button" className={stepper} aria-label={t("decrease")} disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <output aria-live="polite" className="w-6 text-center font-serif text-2xl">{quantity}</output>
        <button type="button" className={stepper} aria-label={t("increase")} disabled={quantity >= MAX_QUANTITY} onClick={() => setQuantity((q) => q + 1)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          onClick={() => {
            add(slug, quantity);
            setAdded(true);
          }}
        >
          {added ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />}
          {added ? t("added") : t("addToCart")}
        </Button>
        {added && (
          <Button href="/cart" variant="ghost">
            {t("seeCart")} →
          </Button>
        )}
      </div>
    </div>
  );
}
