import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

// Mise en page du SITE PUBLIC (groupe de routes « (site) » : n'apparaît pas dans l'URL).
// L'espace admin, lui, a sa propre mise en page dans « (admin) ».
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Éléments communs à toutes les pages (structure du skill) */}
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
