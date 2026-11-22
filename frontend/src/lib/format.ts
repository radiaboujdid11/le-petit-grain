// Formatage des prix en dirhams marocains.
// Les prix sont stockés en CENTIMES (entiers) pour éviter les erreurs d'arrondi :
// 2500 centimes = 25,00 DH.
//   formatPrice(2500, "fr") → « 25,00 DH »
//   formatPrice(2500, "en") → « 25.00 MAD »

export type Locale = "fr" | "en";

// Espace insécable ( ) entre le nombre et la devise : ils ne seront jamais
// séparés sur deux lignes.
const NBSP = " ";

export function formatPrice(cents: number, locale: Locale): string {
  // Intl.NumberFormat : l'outil standard de JavaScript pour formater selon la langue
  // (virgule décimale en français, point en anglais, séparateur des milliers…)
  const amount = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

  return locale === "fr" ? `${amount}${NBSP}DH` : `${amount}${NBSP}MAD`;
}

// ---------------------------------------------------------------- Dates et heures
// Toujours affichées dans le fuseau de la BOUTIQUE (Casablanca), quel que soit celui du visiteur.

export const SHOP_TIME_ZONE = "Africa/Casablanca";

const intlLocale = (locale: Locale) => (locale === "fr" ? "fr-FR" : "en-GB");

// « samedi 28 novembre » / « Saturday 28 November »
export function formatDay(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: SHOP_TIME_ZONE,
  }).format(new Date(iso));
}

// « 08:15 »
export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SHOP_TIME_ZONE,
  }).format(new Date(iso));
}

// Date du jour à Casablanca au format « AAAA-MM-JJ » (format attendu par l'API)
export function shopToday(now: Date = new Date()): string {
  // en-CA formate naturellement en AAAA-MM-JJ
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIME_ZONE }).format(now);
}

// « 2026-11-30 » + 2 jours → « 2026-12-02 » (calcul en UTC : pas d'effet d'heure d'été)
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Libellé d'un jour « AAAA-MM-JJ » : « sam. 28 nov. » / « Sat 28 Nov »
export function formatShortDay(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}
