// Server Component : le contenu du header est rendu sur le serveur.
// Seules les parties interactives sont des Client Components :
// HeaderShell (ombre au défilement), MobileMenu (tiroir), LanguageSwitcher (FR | EN).

import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { HeaderShell } from "./HeaderShell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "./nav-links";

// Lien avec un filet qui se dessine sous le texte au survol (300 ms, courbe du site)
const linkClass =
  "relative text-xs uppercase tracking-[0.15em] text-vanilla/80 " +
  "transition-colors duration-200 ease-brand hover:text-cream " +
  "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-cream " +
  "after:transition-all after:duration-300 after:ease-brand hover:after:w-full";

export function Header() {
  const t = useTranslations("Nav"); // textes de la section « Nav » de messages/fr.json ou en.json

  return (
    <HeaderShell>
      {/* Mobile : grille à 3 colonnes [menu | logo centré | panier].
          Dès 750px (md) : ligne classique [logo | liens | actions]. */}
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 md:flex md:justify-between md:px-8">
        <MobileMenu />

        <Link href="/" aria-label={t("home")} className="text-cream">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-10" aria-label={t("mainNav")}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-3 lg:gap-5">
          <LanguageSwitcher className="hidden lg:flex" />

          {/* Panier : cercle au trait + compteur (Client Component, lit le panier) */}
          <CartButton />

          {/* Caché sur téléphone (le lien est dans le tiroir du menu).
              Le conteneur porte « hidden » : sur le bouton, il serait écrasé par son inline-flex. */}
          <div className="hidden md:block">
            <Button href="/reservation" variant="secondary">
              {t("reserve")}
            </Button>
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}
