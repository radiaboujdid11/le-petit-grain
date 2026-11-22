// Plan du site pour Google (/sitemap.xml) : pages publiques et fiches produits,
// chacune en français et en anglais (alternates.languages). L'admin n'y figure pas.
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/menu";
import { SITE_URL } from "@/lib/site";

const PAGES = ["", "/menu", "/reservation", "/about", "/contact", "/legal", "/privacy", "/terms"];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  return {
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    changeFrequency: "weekly",
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = PAGES.map((path) => entry(path, path === "" ? 1 : path === "/menu" ? 0.9 : 0.5));
  try {
    const products = await getProducts("fr");
    return [...pages, ...products.map((p) => entry(`/menu/${p.slug}`, 0.7))];
  } catch {
    // Backend injoignable au moment du build : on publie au moins les pages fixes
    return pages;
  }
}
