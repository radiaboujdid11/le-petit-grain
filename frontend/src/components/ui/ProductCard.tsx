import Image from "next/image";
import { Croissant, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

// Carte produit (skill, adaptée « sans boîtes ») :
// - image en arche, zoom doux au survol (600 ms) ;
// - nom en MAJUSCULES, prix au format « 22,00 DH » ;
// - bouton « Ajouter » qui apparaît au survol sur ordinateur, toujours visible sur mobile.

type ProductCardProps = {
  category: string;
  name: string;
  price: string; // déjà formaté, ex. « 22,00 DH »
  image?: string; // chemin dans public/, ex. "/images/products/croissant.webp"
};

export function ProductCard({ category, name, price, image }: ProductCardProps) {
  const t = useTranslations("Product");
  // Zoom doux au survol, commun à la photo et à l'icône de remplacement
  const zoom = "transition-transform duration-600 ease-brand group-hover:scale-[1.06]";

  return (
    <article className="group text-center">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-t-full bg-chocolate">
        {image ? (
          // fill : l'image remplit l'arche ; object-cover : elle est recadrée sans être déformée.
          // sizes : indique au navigateur la largeur affichée, pour charger le bon fichier.
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
            quality={90}
            className={`photo object-cover ${zoom}`}
          />
        ) : (
          <Croissant className={`h-12 w-12 text-caramel ${zoom}`} strokeWidth={1} />
        )}

        {/* Bouton rond « Ajouter » en bas de l'arche.
            Mobile : toujours visible. Dès 990px (lg) : caché, apparaît au survol
            ou quand on arrive dessus au clavier (focus-within). */}
        <button
          type="button"
          aria-label={t("addToCart", { name })}
          className="absolute bottom-3 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-cocoa transition duration-300 ease-brand hover:bg-vanilla focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100"
        >
          <Plus className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-toffee">{category}</p>
      <h3 className="mt-1.5 font-serif text-lg uppercase tracking-[0.08em] sm:text-xl">{name}</h3>
      <p className="mt-1.5 text-sm font-medium text-cream">{price}</p>
    </article>
  );
}
