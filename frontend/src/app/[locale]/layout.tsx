import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CartProvider } from "@/components/cart/CartProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Police des titres et du logo.
// Elle n'est pas « variable » : on choisit donc les graisses et styles utilisés.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Police du texte et de l'interface (police « variable » : toutes les graisses incluses).
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// Les langues à préparer à l'avance (obligatoire avec cacheComponents)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Titre et description de la page dans la langue courante (onglet, Google…)
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  // Langue lue dans l'URL (/fr ou /en) grâce à next/root-params
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound(); // ex. /de → page 404

  return (
    // lang="fr" ou "en" : indispensable pour les lecteurs d'écran et Google
    <html lang={locale} className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Rend les traductions disponibles aussi dans les Client Components */}
        <NextIntlClientProvider>
          {/* Le panier est partagé par tout le site (header, menu, fiche produit…) */}
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
