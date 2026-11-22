"use client";
// Page d'erreur de toutes les pages du site (/fr/…, /en/…).
// Next.js l'affiche à la place de la page quand une erreur survient pendant son rendu,
// par exemple si le backend ne répond pas. Le header et le pied de page restent visibles.
// Doit être un Client Component (obligatoire pour les « error boundaries »).

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Button } from "@/components/ui/Button";

type ErrorPageProps = {
  error: Error & { digest?: string }; // digest : identifiant pour retrouver l'erreur dans les logs serveur
  retry: () => void; // Next.js 16 : recharge les données et réaffiche la page
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations("Error");

  // Trace technique pour le développeur (console du navigateur), jamais affichée au visiteur
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
      <BeanIcon className="h-12 w-12 text-cream" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-toffee">{t("eyebrow")}</p>
      <h1 className="mt-4 max-w-xl font-serif text-3xl leading-tight uppercase tracking-[0.1em] sm:text-4xl">{t("title")}</h1>
      <p className="mt-5 max-w-md leading-relaxed text-vanilla/80">{t("text")}</p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button onClick={() => retry()}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> {t("retry")}
        </Button>
        <Button href="/" variant="secondary">
          {t("home")}
        </Button>
      </div>
    </main>
  );
}
