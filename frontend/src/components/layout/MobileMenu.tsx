"use client";
// Client Component : le menu a un ÉTAT (ouvert / fermé) et réagit aux clics.
// Skill : sur mobile, un tiroir latéral qui glisse depuis la gauche en 300 ms.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { navLinks } from "./nav-links";

export function MobileMenu() {
  // useState : variable « surveillée » ; setIsOpen redessine le composant
  const [isOpen, setIsOpen] = useState(false);

  // useEffect : exécuté après l'affichage, à chaque changement de isOpen
  useEffect(() => {
    // Bloque le défilement de la page derrière le tiroir ouvert
    document.body.style.overflow = isOpen ? "hidden" : "";

    // Touche Échap = fermer
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    // Nettoyage : on retire l'écouteur avant le prochain passage
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label="Ouvrir le menu"
        className="flex h-11 w-11 items-center justify-center rounded-full text-cream focus-visible:outline-2 focus-visible:outline-cream"
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {/* Voile sombre derrière le tiroir : un clic dessus ferme le menu */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-cocoa/70 transition-opacity duration-300 ease-brand ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Tiroir : hors écran à gauche (-translate-x-full) quand il est fermé */}
      <nav
        id="mobile-menu"
        aria-label="Navigation mobile"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col border-r border-caramel/40 bg-cocoa px-8 pt-6 pb-10 transition-transform duration-300 ease-brand ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={close}
          tabIndex={isOpen ? 0 : -1}
          aria-label="Fermer le menu"
          className="flex h-11 w-11 items-center justify-center self-end rounded-full text-cream focus-visible:outline-2 focus-visible:outline-cream"
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>

        <div className="mt-10 flex flex-col gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              tabIndex={isOpen ? 0 : -1}
              className="font-serif text-3xl uppercase tracking-[0.08em] text-vanilla transition-colors duration-200 hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Séparateur du skill : trait · grain · trait */}
        <div className="my-10 flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-10 bg-caramel" />
          <BeanIcon className="h-5 w-5 text-toffee" />
          <span className="h-px w-10 bg-caramel" />
        </div>

        <Link
          href="/reservation"
          onClick={close}
          tabIndex={isOpen ? 0 : -1}
          className="text-xs uppercase tracking-[0.25em] text-toffee hover:text-cream"
        >
          Réserver une table
        </Link>

        {/* Langue, en bas du tiroir */}
        <div className="mt-auto text-xs tracking-[0.2em]">
          <span className="text-cream">FR</span>
          <span className="mx-1.5 text-caramel">|</span>
          <span className="text-vanilla/60">EN</span>
        </div>
      </nav>
    </div>
  );
}
