// Server Component : le contenu du header est rendu sur le serveur.
// Seules les parties interactives sont des Client Components :
// HeaderShell (ombre au défilement) et MobileMenu (tiroir).

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { HeaderShell } from "./HeaderShell";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "./nav-links";

// Lien avec un filet qui se dessine sous le texte au survol (300 ms, courbe du site)
const linkClass =
  "relative text-xs uppercase tracking-[0.15em] text-vanilla/80 " +
  "transition-colors duration-200 ease-brand hover:text-cream " +
  "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-cream " +
  "after:transition-all after:duration-300 after:ease-brand hover:after:w-full";

export function Header() {
  return (
    <HeaderShell>
      {/* Mobile : grille à 3 colonnes [menu | logo centré | panier].
          Dès 750px (md) : ligne classique [logo | liens | actions]. */}
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 md:flex md:justify-between md:px-8">
        <MobileMenu />

        <Link href="/" aria-label="Le Petit Grain — accueil" className="text-cream">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-10" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-3 lg:gap-5">
          {/* Langue : affichage seulement pour l'instant, fonctionnel avec la traduction */}
          <div className="hidden text-xs tracking-[0.2em] lg:block">
            <span className="text-cream">FR</span>
            <span className="mx-1.5 text-caramel">|</span>
            <span className="text-vanilla/60">EN</span>
          </div>

          {/* Panier dans un cercle au trait, compteur en pastille */}
          <Link
            href="/cart"
            aria-label="Panier (0 article)"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-caramel text-cream transition-colors duration-200 ease-brand hover:border-cream"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cream text-[10px] font-medium text-cocoa">
              0
            </span>
          </Link>

          <Button href="/reservation" variant="secondary" className="hidden md:inline-flex">
            Réserver
          </Button>
        </div>
      </div>
    </HeaderShell>
  );
}
