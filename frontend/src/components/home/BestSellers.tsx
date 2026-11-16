import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

// Données d'exemple : elles viendront de l'API (backend) en phase 3.
// Prix réalistes en dirhams, déjà formatés en attendant la fonction de formatage.
const bestSellers = [
  { category: "Croissants", name: "Croissant au chocolat", price: "22,00 DH", image: "/images/products/croissant-chocolat.webp" },
  { category: "Pâtisserie", name: "Fondant au chocolat", price: "38,00 DH", image: "/images/products/fondant-chocolat.webp" },
  { category: "Brownies & Cookies", name: "Brownie fondant", price: "25,00 DH", image: "/images/products/brownie.webp" },
  { category: "Pâtisserie", name: "Cupcake mûre & cacao", price: "30,00 DH", image: "/images/products/cupcake-mure.webp" },
];

export function BestSellers() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro="Les favoris de nos habitués, préparés chaque matin dans notre fournil.">
        Nos best-sellers
      </SectionTitle>
      {/* 2 colonnes mobile, 3 tablette, 4 ordinateur */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
        {bestSellers.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </section>
  );
}
