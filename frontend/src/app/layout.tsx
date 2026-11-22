import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Le Petit Grain",
  description: "Coffee, pastries & warmth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // La langue passera à "fr" / "en" dynamiquement quand on ajoutera la traduction
    <html
      lang="fr"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Éléments communs à toutes les pages (structure du skill) */}
        <AnnouncementBar />
        <Header />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
