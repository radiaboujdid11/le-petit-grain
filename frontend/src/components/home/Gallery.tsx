import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Galerie de l'accueil : photos en arches (pas de carrés), au même format 4:5.
// Sur ordinateur, une colonne sur deux est décalée vers le bas : effet « éditorial ».

const photos = [
  { src: "/images/gallery/croissant-crumble.webp", alt: "Croissant garni de crème et de crumble" },
  { src: "/images/gallery/macarons-cerise.webp", alt: "Macarons à la cerise et cerises fraîches" },
  { src: "/images/gallery/espresso.webp", alt: "Espresso servi dans une tasse sombre" },
  { src: "/images/gallery/cupcakes-cerise.webp", alt: "Cupcakes au chocolat surmontés d'une cerise" },
  { src: "/images/gallery/macarons-red-velvet.webp", alt: "Pile de macarons red velvet nappés de chocolat blanc" },
  { src: "/images/gallery/iced-latte.webp", alt: "Latte glacé au caramel" },
  { src: "/images/gallery/macarons-framboise.webp", alt: "Macarons à la framboise" },
  { src: "/images/gallery/cupcakes-coeur.webp", alt: "Cupcakes red velvet décorés d'un cœur" },
];

export function Gallery() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro="Un aperçu de nos créations, du comptoir à votre table.">
        Galerie
      </SectionTitle>

      {/* 2 colonnes mobile, 4 sur ordinateur ; lg:even:mt-12 = décalage d'une photo sur deux */}
      <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {photos.map((photo) => (
          <li
            key={photo.src}
            className="group relative aspect-[4/5] overflow-hidden rounded-t-full lg:even:mt-12"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 990px) 25vw, 50vw"
              quality={90}
              className="photo object-cover transition-transform duration-600 ease-brand group-hover:scale-[1.06]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
