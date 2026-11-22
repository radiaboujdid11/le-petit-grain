"use client";
// Bouton FR | EN : affiche la MÊME page dans l'autre langue (/fr/menu ↔ /en/menu).
// next-intl mémorise ce choix dans un cookie : il prime ensuite sur la langue du navigateur.
//
// L'adresse courante est lue AU MOMENT DU CLIC (window.location) et non pendant le rendu :
// le bouton peut ainsi être pré-rendu sur toutes les pages, même celles à paramètre (/order/[id]).

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// « /fr/menu?x=1#y » → « /menu?x=1#y » (chemin sans la langue)
function currentPathWithoutLocale(): string {
  const { pathname, search, hash } = window.location;
  const path = pathname.replace(new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`), "") || "/";
  return `${path}${search}${hash}`;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Language");
  const current = useLocale();
  const router = useRouter();

  return (
    <div role="group" aria-label={t("label")} className={`flex items-center text-xs tracking-[0.2em] ${className}`}>
      {routing.locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          {index > 0 && <span className="mx-1.5 text-caramel" aria-hidden="true">|</span>}
          <button
            type="button"
            lang={locale}
            onClick={() => router.replace(currentPathWithoutLocale(), { locale })}
            aria-current={locale === current ? "true" : undefined}
            aria-label={t("switchTo", { language: t(locale) })}
            className={`uppercase transition-colors duration-200 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
              locale === current ? "text-cream" : "text-vanilla/60"
            }`}
          >
            {locale}
          </button>
        </span>
      ))}
    </div>
  );
}
