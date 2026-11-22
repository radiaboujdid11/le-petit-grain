import Image from "next/image";
import { BeanIcon } from "@/components/brand/BeanIcon";
import type { Category, Product } from "@/lib/api";
import { MenuItem } from "./MenuItem";

// Une catégorie du menu : titre espacé, séparateur à grain, photo ronde facultative, produits.
// break-inside-avoid : sur ordinateur (2 colonnes), une section n'est jamais coupée en deux.

export function MenuSection({ category, products }: { category: Category; products: Product[] }) {
  // Photo ronde : la première photo disponible parmi les produits de la catégorie
  const photo = products.find((p) => p.image_url);

  return (
    <section id={`cat-${category.slug}`} className="break-inside-avoid scroll-mt-40 pt-14 pb-2">
      <h2 className="text-center font-serif text-[22px] font-semibold uppercase tracking-[0.3em] text-cream">
        {category.name}
      </h2>
      <div className="mt-3 mb-8 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-12 bg-caramel" />
        <BeanIcon className="h-4 w-4 text-toffee" />
        <span className="h-px w-12 bg-caramel" />
      </div>

      {photo?.image_url && (
        <div className="mb-8 flex justify-center">
          {/* Cercle photo + anneau Caramel décalé (inset négatif), comme sur la maquette */}
          <div className="relative h-36 w-36">
            <span className="absolute -inset-2 rounded-full border border-caramel" aria-hidden="true" />
            <div className="absolute inset-0 overflow-hidden rounded-full bg-chocolate">
              <Image
                src={photo.image_url}
                alt={photo.name}
                fill
                sizes="144px"
                quality={90}
                className="photo object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-5">
        {products.map((product) => (
          <MenuItem key={product.slug} product={product} />
        ))}
      </ul>
    </section>
  );
}
