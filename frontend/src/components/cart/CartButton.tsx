"use client";
// Icône panier du header : la pastille affiche le nombre d'articles et « rebondit »
// légèrement à chaque ajout (skill : pastille panier qui rebondit).

import { ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartProvider";

export function CartButton() {
  const t = useTranslations("Nav");
  const { count } = useCart();
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href="/cart"
      aria-label={t("cart", { count })}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-caramel text-cream transition-colors duration-200 ease-brand hover:border-cream"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {count > 0 && (
        <motion.span
          key={count} // nouvelle clé à chaque changement → l'animation se rejoue
          initial={reduceMotion ? false : { scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.3, 1] }}
          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cream px-1 text-[10px] font-medium text-cocoa"
        >
          {count}
        </motion.span>
      )}
    </Link>
  );
}
