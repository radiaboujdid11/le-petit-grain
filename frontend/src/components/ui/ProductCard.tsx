import Image from "next/image";
import { Croissant } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Link } from "@/i18n/navigation";

// Carte produit (skill, adaptée « sans boîtes ») :
// - image en arche, zoom doux au survol (600 ms), lien vers la fiche produit ;
// - nom en MAJUSCULES, prix au format « 22,00 DH » ;
// - bouton « Ajouter » qui apparaît au survol sur ordinateur, toujours visible sur mobile.

type ProductCardProps = {
  slug: string;
  category: string;
  name: string;
  price: string; // déjà formaté, ex. « 22,00 DH »
  image?: string | null;
  available?: boolean;
};

export function ProductCard({ slug, category, name, price, image, available = true }: ProductCardProps) {
  const zoom = "transition-transform duration-600 ease-brand group-hover:scale-[1.06]";

  return (
    <article className="group text-center">
      <div className="relative">
        <Link
          href={`/menu/${slug}`}
          className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-t-full bg-chocolate focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
          aria-label={name}
        >
          {image ? (
            // fill : l'image remplit l'arche ; object-cover : recadrée sans être déformée.
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
              quality={90}
              className={`photo object-cover ${zoom}`}
            />
          ) : (
            <Croissant className={`h-12 w-12 text-caramel ${zoom}`} strokeWidth={1} />
          )}
        </Link>

        {/* Bouton « Ajouter » en bas de l'arche. Mobile : toujours visible.
            Dès 990px : apparaît au survol ou au clavier (focus-within). */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transition duration-300 ease-brand lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
          <AddToCartButton slug={slug} name={name} disabled={!available} />
        </div>
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-toffee">{category}</p>
      <h3 className="mt-1.5 font-serif text-lg uppercase tracking-[0.08em] sm:text-xl">
        <Link href={`/menu/${slug}`} className="transition-colors duration-200 hover:text-cream">
          {name}
        </Link>
      </h3>
      <p className="mt-1.5 text-sm font-medium text-cream">{price}</p>
    </article>
  );
}
