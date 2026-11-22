import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Marcellus } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CartProvider } from "@/components/cart/CartProvider";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

// Police unique du site (skill boutique-gourmande, style B : « Marcellus partout »).
// Serif aux capitales gravées : élégante en MAJUSCULES espacées comme en texte courant.
// Une seule graisse existe (400) : pas de faux gras (font-synthesis: none dans globals.css).
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

// Les langues à préparer à l'avance (obligatoire avec cacheComponents)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Titre et description de la page dans la langue courante (onglet, Google…),
// et aperçu quand on partage un lien (WhatsApp, Instagram, Facebook : Open Graph).
export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();
  const t = await getTranslations("Metadata");
  return {
    metadataBase: new URL(SITE_URL), // rend absolues les adresses des images de partage
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "Le Petit Grain",
      title: t("title"),
      description: t("description"),
      locale: locale === "en" ? "en_GB" : "fr_MA",
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Le Petit Grain" }],
    },
    twitter: { card: "summary_large_image", images: ["/images/og.jpg"] },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  // Langue lue dans l'URL (/fr ou /en) grâce à next/root-params
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound(); // ex. /de → page 404

  return (
    // lang="fr" ou "en" : indispensable pour les lecteurs d'écran et Google
    <html lang={locale} className={`${marcellus.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Rend les traductions disponibles aussi dans les Client Components */}
        <NextIntlClientProvider>
          {/* Le panier est partagé par tout le site (header, menu, fiche produit…) */}
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
        {/* Statistiques de visites Vercel : sans cookie, pages vues et pays (à activer dans Vercel) */}
        <Analytics />
      </body>
    </html>
  );
}
