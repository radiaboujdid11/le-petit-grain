import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { shop } from "@/data/shop";

// Bouton WhatsApp flottant en bas à droite (skill, structure de page n° 9).
// Couleurs de la marque (pas le vert WhatsApp) : une seule couleur forte sur le site.
export function WhatsAppButton() {
  const t = useTranslations("WhatsApp");
  return (
    <a
      href={`https://wa.me/${shop.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer" // sécurité : la page ouverte n'a pas accès à notre onglet
      aria-label={t("label")}
      className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cream text-cocoa shadow-lift transition duration-200 ease-brand hover:-translate-y-0.5 hover:bg-vanilla focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream md:right-6 md:bottom-6"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
    </a>
  );
}
