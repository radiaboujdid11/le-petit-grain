// Client de l'API FastAPI : fonctions typées qui appellent le backend.
// Fichier « pur » (pas de cache Next.js ici) : facile à tester avec Vitest.

import type { Locale } from "./format";

// Formes des réponses, identiques aux schémas Pydantic du backend (app/schemas/catalog.py)
export type Category = { slug: string; name: string };

export type Product = {
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  category: Category;
  is_available: boolean;
  is_bestseller: boolean;
  is_vegetarian: boolean;
  contains_nuts: boolean;
  contains_gluten: boolean;
};

export type ProductFilters = {
  category?: string;
  bestseller?: boolean;
  vegetarian?: boolean;
  nut_free?: boolean;
  sort?: "default" | "price_asc" | "price_desc";
};

// Erreur de l'API, au format du backend : { code, message }
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// Adresse du backend, lue côté serveur dans .env.local (API_URL)
export function apiBaseUrl(): string {
  return process.env.API_URL ?? "http://localhost:8000";
}

// Appel générique : ajoute la langue (Accept-Language) et transforme les erreurs en ApiError
export async function apiFetch<T>(path: string, locale: Locale): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}/api/v1${path}`, {
    headers: { "Accept-Language": locale, Accept: "application/json" },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.code ?? "API_ERROR", body.message ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

// Construit « /products?category=croissants&nut_free=true » (seulement les filtres demandés)
export function productsPath(filters: ProductFilters = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function fetchCategories(locale: Locale) {
  return apiFetch<Category[]>("/categories", locale);
}

export function fetchProducts(locale: Locale, filters?: ProductFilters) {
  return apiFetch<Product[]>(productsPath(filters), locale);
}

// Fiche produit : renvoie null si le produit n'existe pas (404), au lieu d'une erreur
export async function fetchProduct(locale: Locale, slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${encodeURIComponent(slug)}`, locale);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
