"use client";
// « Coque » du header : elle surveille le défilement pour afficher une ombre fine
// dès qu'on quitte le haut de la page (skill). Le CONTENU du header, lui,
// reste rendu sur le serveur : il est passé ici en « children ».

import { useEffect, useState } from "react";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll(); // état correct même si la page est rechargée au milieu
    // passive: true → le navigateur sait qu'on ne bloque pas le défilement (plus fluide)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []); // [] = on installe l'écouteur une seule fois

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[box-shadow,border-color] duration-300 ease-brand ${
        isScrolled ? "border-caramel/30 shadow-lift" : "border-transparent"
      }`}
    >
      {/* Fond flouté placé dans un calque À PART, et non sur le <header> lui-même :
          un élément avec backdrop-blur « capture » les éléments position: fixed
          qu'il contient, ce qui casserait le tiroir du menu mobile. */}
      <div className="absolute inset-0 -z-10 bg-cocoa/90 backdrop-blur-md" aria-hidden="true" />
      {children}
    </header>
  );
}
