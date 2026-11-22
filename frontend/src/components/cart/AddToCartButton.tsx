"use client";
// Bouton « Ajouter au panier », réutilisé partout (cartes produits, menu, vitrine des boissons).
// Retour visuel : l'icône « + » devient « ✓ » pendant 1,2 s.

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "./CartProvider";

type AddToCartButtonProps = {
  slug: string;
  name: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function AddToCartButton({ slug, name, disabled, className = "", size = "md" }: AddToCartButtonProps) {
  const t = useTranslations("MenuPage");
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const dimensions = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const Icon = justAdded ? Check : Plus;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(slug);
        setJustAdded(true);
      }}
      aria-label={justAdded ? t("added") : t("add", { name })}
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-cream text-cocoa transition duration-200 ease-brand hover:bg-vanilla active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      {/* Annonce discrète pour les lecteurs d'écran */}
      <span className="sr-only" aria-live="polite">{justAdded ? t("added") : ""}</span>
    </button>
  );
}
