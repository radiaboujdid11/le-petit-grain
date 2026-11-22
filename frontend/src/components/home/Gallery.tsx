import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Galerie de l'accueil : photos en arches (pas de carrés), au même format 4:5.
// La photo du milieu est décalée vers le bas : effet « éditorial ».
// Seules les photos dans l'ambiance du site (tons bruns et dorés) sont gardées.
// « altKey » : description de la photo, traduite (messages/*.json, section « Gallery »).

const photos = [
  { src: "/images/gallery/croissant-crumble.webp", altKey: "croissant" },
  { src: "/images/gallery/espresso.webp", altKey: "espresso" },
  { src: "/images/gallery/iced-latte.webp", altKey: "icedLatte" },
] as const;

export function Gallery() {
  const t = useTranslations("Gallery");
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro={t("intro")}>{t("title")}</SectionTitle>

      {/* 3 colonnes à toutes les tailles ; even:mt-* = la 2e photo (paire) est décalée */}
      <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-3 md:gap-6">
        {photos.map((photo) => (
          <li
            key={photo.src}
            className="group relative aspect-[4/5] overflow-hidden rounded-t-full even:mt-6 md:even:mt-12"
          >
            <Image
              src={photo.src}
              alt={t(photo.altKey)}
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
