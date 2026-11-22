// /robots.txt : Google peut tout lire, sauf l'espace admin et les pages personnelles
// (panier, commande, lien de gestion d'une réservation).
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/fr/admin", "/en/admin", "/fr/cart", "/en/cart", "/fr/checkout", "/en/checkout",
        "/fr/order/", "/en/order/", "/fr/reservation/manage/", "/en/reservation/manage/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
