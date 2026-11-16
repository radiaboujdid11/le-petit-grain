import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Button } from "@/components/ui/Button";

// Hero plein écran (skill, style B) :
// photo sombre + voile, texte centré, slogan très espacé, boutons.
// Le texte est en HTML, jamais dans l'image.
// Animations : zoom lent de la photo (Ken Burns) + textes qui montent l'un après l'autre.

export function Hero() {
  return (
    // 100svh - 5rem : toute la hauteur de l'écran moins le header (80px).
    // svh = hauteur « petite » de l'écran : correcte sur mobile même avec la barre du navigateur.
    <section className="relative flex h-[calc(100svh-5rem)] min-h-[520px] items-center justify-center overflow-hidden">
      <Image
        src="/images/hero/hero-cafe.webp"
        alt="" // décorative : le message est porté par le texte
        fill
        sizes="100vw"
        quality={90}
        fetchPriority="high" // image principale de la page : chargée en priorité
        // object-[37%_center] : sur mobile (écran vertical), on centre la tasse
        // plutôt que le vase ; sur ordinateur, toute la largeur est visible.
        className="photo animate-kenburns object-cover object-[37%_center] md:object-center"
      />
      {/* Voile sombre pour la lisibilité du texte (cocoa à 55 %) */}
      <div className="absolute inset-0 bg-cocoa/55" aria-hidden="true" />

      <div className="relative px-4 text-center">
        <BeanIcon className="mx-auto h-10 w-10 animate-rise-in text-cream" />
        <p className="mt-6 animate-rise-in text-xs uppercase tracking-[0.3em] text-cream [animation-delay:100ms]">
          Coffee · Bakery · Pâtisserie
        </p>
        <h1 className="mt-5 animate-rise-in font-serif text-5xl leading-tight font-medium text-vanilla [animation-delay:200ms] sm:text-7xl">
          A little moment of joy.
        </h1>
        {/* Slogan très espacé (skill : letter-spacing 4px) */}
        <p className="mt-5 animate-rise-in text-sm tracking-[4px] text-vanilla/90 uppercase [animation-delay:300ms]">
          Coffee, pastries &amp; warmth.
        </p>
        <div className="mt-10 flex animate-rise-in flex-col items-center justify-center gap-4 [animation-delay:450ms] sm:flex-row">
          <Button href="/menu" size="lg">
            Voir le menu <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button href="/reservation" variant="secondary" size="lg">
            Réserver une table
          </Button>
        </div>
      </div>
    </section>
  );
}
