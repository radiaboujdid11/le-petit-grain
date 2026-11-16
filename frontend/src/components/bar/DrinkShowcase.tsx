"use client";
// Vitrine des boissons : les photos défilent AUTOMATIQUEMENT, comme une vidéo.
// - fondu enchaîné + zoom lent sur chaque photo (dans une arche)
// - halo de la couleur de la boisson derrière l'arche
// - nom révélé dans un masque horizontal, barre de progression
// - pause : bouton (obligatoire pour l'accessibilité), survol, ou clic sur une boisson
// - « réduire les animations » : pas de défilement automatique, simple fondu

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play, Plus } from "lucide-react";
import { flavors } from "@/data/flavors";
import { formatPrice } from "@/lib/format";

const INTERVAL_MS = 1500; // durée d'affichage de chaque boisson

export function DrinkShowcase() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false); // bouton pause / clic
  const [hovered, setHovered] = useState(false); // souris sur la photo

  const paused = userPaused || hovered || !!reduceMotion;
  const flavor = flavors[index];

  // Défilement automatique : après INTERVAL_MS, on passe à la boisson suivante.
  // L'effet se relance à chaque changement d'index (ou de pause).
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % flavors.length), INTERVAL_MS);
    return () => clearTimeout(timer); // nettoyage si on change avant la fin
  }, [index, paused]);

  // Choisir une boisson met le défilement en pause (le visiteur a pris la main)
  function select(i: number) {
    setIndex(i);
    setUserPaused(true);
  }

  // Flèches gauche / droite du clavier quand le focus est dans la section
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") select((index + 1) % flavors.length);
    if (event.key === "ArrowLeft") select((index - 1 + flavors.length) % flavors.length);
  }

  return (
    <div className="relative flex flex-col items-center" onKeyDown={onKeyDown}>
      {/* Halo lumineux de la couleur de la boisson (fondu entre les couleurs) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 h-80 w-80 rounded-full opacity-40 blur-3xl sm:h-[28rem] sm:w-[28rem]"
        animate={{ backgroundColor: flavor.accent }}
        transition={{ duration: 1 }}
      />

      {/* Arche contenant TOUTES les photos superposées : seule l'active est visible.
          Elles sont ainsi déjà chargées, le fondu ne « clignote » jamais. */}
      <div
        className="relative aspect-[4/5] w-[min(78vw,360px)] overflow-hidden rounded-t-full bg-chocolate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {flavors.map((f, i) => (
          <motion.div
            key={f.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              // Zoom lent façon vidéo : la photo active « recule » doucement
              scale: i === index || reduceMotion ? 1 : 1.08,
            }}
            // Fondu court (0,5 s) et zoom calé sur la durée d'affichage, pour suivre le rythme
            transition={{ opacity: { duration: 0.5 }, scale: { duration: INTERVAL_MS / 1000, ease: "easeOut" } }}
          >
            <Image
              src={f.image}
              alt={f.name.fr}
              fill
              sizes="(min-width: 750px) 360px, 78vw"
              quality={90}
              className="photo object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Barre de progression : se remplit pendant l'affichage de la boisson */}
      <div className="mt-6 h-px w-40 bg-caramel/40" aria-hidden="true">
        {!paused && (
          <motion.div
            key={index}
            className="h-px origin-left bg-cream"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
          />
        )}
      </div>

      {/* Nom révélé dans un masque horizontal (overflow-hidden coupe le texte qui glisse).
          aria-live annonce la boisson aux lecteurs d'écran, seulement hors défilement auto. */}
      <div className="mt-6 overflow-hidden" aria-live={paused ? "polite" : "off"}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h3
            key={flavor.id}
            className="text-center font-serif text-4xl sm:text-5xl"
            initial={{ x: "70%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-70%", opacity: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.3, 1] }}
          >
            {flavor.name.fr}
          </motion.h3>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-center text-sm text-vanilla/80">{flavor.tagline.fr}</p>

      {/* Prix + ajout au panier (branché au vrai panier en phase 4) */}
      <div className="mt-5 flex items-center gap-3">
        <span className="font-medium text-cream">{formatPrice(flavor.priceCents, "fr")}</span>
        <button
          type="button"
          aria-label={`Ajouter ${flavor.name.fr} au panier`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-cocoa transition duration-200 ease-brand hover:bg-vanilla active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Choix des boissons (deviendra la roue de médaillons) + bouton pause */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {flavors.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => select(i)}
            aria-pressed={i === index}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${
              i === index ? "border-cream bg-cream text-cocoa" : "border-caramel text-vanilla/80 hover:border-cream"
            }`}
          >
            {f.name.fr}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setUserPaused(!userPaused)}
          aria-label={userPaused ? "Reprendre le défilement" : "Mettre le défilement en pause"}
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-caramel text-cream transition-colors duration-200 hover:border-cream focus-visible:outline-2 focus-visible:outline-cream"
        >
          {userPaused ? <Play className="h-4 w-4" strokeWidth={1.5} /> : <Pause className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}
