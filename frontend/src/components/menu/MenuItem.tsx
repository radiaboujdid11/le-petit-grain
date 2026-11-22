import { Leaf, Nut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/api";
import { formatPrice, type Locale } from "@/lib/format";

// Une ligne du menu (maquette Claude Design) :
//   ✦ BEST-SELLER
//   Nom ─────────────────── 22,00 DH  (+)
//   Description                     🌿 🌰

// Petite étoile à 4 branches du badge (dessin repris de la maquette)
function Sparkle() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" />
    </svg>
  );
}

export function MenuItem({ product }: { product: Product }) {
  const t = useTranslations("Menu");
  const locale = useLocale() as Locale;

  return (
    // Produit épuisé : estompé, mais toujours visible (le client sait qu'il existe)
    <li className={`flex flex-col gap-1 ${product.is_available ? "" : "opacity-50"}`}>
      {product.is_bestseller && (
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cream">
          <Sparkle />
          {t("bestseller")}
        </span>
      )}

      <div className="flex items-baseline gap-3">
        <h3 className="font-serif text-[22px] leading-tight font-medium">
          <Link href={`/menu/${product.slug}`} className="transition-colors duration-200 hover:text-cream">
            {product.name}
          </Link>
        </h3>
        {/* Filet de liaison entre le nom et le prix (décoratif, Caramel autorisé) */}
        <span className="min-w-4 flex-1 -translate-y-1.5 border-b border-caramel" aria-hidden="true" />
        <span className="text-sm font-medium whitespace-nowrap text-cream">
          {formatPrice(product.price_cents, locale)}
        </span>
        <AddToCartButton
          slug={product.slug}
          name={product.name}
          disabled={!product.is_available}
          size="sm"
          className="self-center"
        />
      </div>

      <div className="flex items-start justify-between gap-3 pr-12">
        <p className="text-[13.5px] leading-relaxed text-vanilla/80">
          {product.description}
          {!product.is_available && (
            <span className="ml-2 text-xs uppercase tracking-[0.15em] text-cream">· {t("soldOut")}</span>
          )}
        </p>
        {/* Icônes : role="img" + aria-label → lues par les lecteurs d'écran */}
        <span className="mt-1 flex shrink-0 gap-1.5 text-cream">
          {product.is_vegetarian && (
            <Leaf role="img" aria-label={t("vegetarian")} className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          {product.contains_nuts && (
            <Nut role="img" aria-label={t("nuts")} className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </span>
      </div>
    </li>
  );
}
