import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Galerie de l'accueil : photos en arches (pas de carrés), au même format 4:5.
// La photo du milieu est décalée vers le bas : effet « éditorial ».
// Seules les photos dans l'ambiance du site (tons bruns et dorés) sont gardées.

const photos = [
  { src: "/images/gallery/croissant-crumble.webp", alt: "Croissant garni de crème et de crumble" },
  { src: "/images/gallery/espresso.webp", alt: "Espresso servi dans une tasse sombre" },
  { src: "/images/gallery/iced-latte.webp", alt: "Latte glacé au caramel" },
];

export function Gallery() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro="Un aperçu de nos créations, du comptoir à votre table.">
        Galerie
      </SectionTitle>

      {/* 3 colonnes à toutes les tailles ; even:mt-* = la 2e photo (paire) est décalée */}
      <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-3 md:gap-6">
        {photos.map((photo) => (
          <li
            key={photo.src}
            className="group relative aspect-[4/5] overflow-hidden rounded-t-full even:mt-6 md:even:mt-12"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 990px) 300px, 33vw"
              quality={90}
              className="photo object-cover transition-transform duration-600 ease-brand group-hover:scale-[1.06]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
