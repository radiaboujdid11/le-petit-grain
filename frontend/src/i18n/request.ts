// Pour chaque requête : quelle langue, et quels textes charger.
// La langue vient du segment [locale] de l'URL, lu avec next/root-params (Next.js 16.3+).
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale: requested }) => {
  // « requested » : langue imposée explicitement (ex. getTranslations({ locale: "en" }))
  const candidate = requested ?? (await rootLocale());
  // Une langue inconnue (ex. /de) est remplacée par la langue par défaut
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    timeZone: "Africa/Casablanca", // fuseau de la boutique pour les dates et heures
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
