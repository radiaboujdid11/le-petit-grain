import { Croissant } from "lucide-react";

// Carte produit SANS boîte : pas de fond, pas de bordure.
// L'image prend la forme d'une arche (haut arrondi), le texte est centré dessous.

type ProductCardProps = {
  category: string;
  name: string;
  description: string;
  price: string; // déjà formaté, ex. « 22,00 DH »
};

export function ProductCard({ category, name, description, price }: ProductCardProps) {
  return (
    <article className="group text-center">
      {/* Arche : rounded-t-full arrondit complètement le haut */}
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-t-full bg-chocolate">
        {/* Emplacement provisoire : la vraie photo arrivera avec la page d'accueil.
            Au survol, léger zoom (animation douce) */}
        <Croissant
          className="h-14 w-14 text-caramel transition-transform duration-700 group-hover:scale-110"
          strokeWidth={1}
        />
      </div>

      <p className="mt-5 text-xs uppercase tracking-[0.25em] text-toffee">{category}</p>
      <h3 className="mt-2 font-serif text-2xl">{name}</h3>
      <p className="mt-2 text-sm text-vanilla/80">{description}</p>

      {/* Petit filet décoratif, puis le prix */}
      <div className="mx-auto mt-4 h-px w-10 bg-caramel" />
      <p className="mt-4 font-medium text-cream">{price}</p>
    </article>
  );
}
