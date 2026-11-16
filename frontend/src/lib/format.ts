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
