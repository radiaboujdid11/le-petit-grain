// Données du menu pour les pages, MISES EN CACHE par Next.js.
// Le menu change rarement : inutile d'interroger le backend à chaque visite.
// - cacheLife("hours") : le cache est rafraîchi au plus toutes les heures
// - cacheTag("menu") : l'admin pourra vider ce cache dès qu'un produit change (phase 6)

import { cacheLife, cacheTag } from "next/cache";
import { fetchCategories, fetchProduct, fetchProducts, type ProductFilters } from "./api";
import type { Locale } from "./format";

export async function getCategories(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag("menu");
  return fetchCategories(locale);
}

export async function getProducts(locale: Locale, filters?: ProductFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag("menu");
  return fetchProducts(locale, filters);
}

export async function getProduct(locale: Locale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("menu");
  return fetchProduct(locale, slug);
}
