// Page d'accueil, dans l'ordre de la structure du skill :
// hero → réassurance → best-sellers → catégories → boissons → galerie (→ pied de page).
import { BestSellers } from "@/components/home/BestSellers";
import { Categories } from "@/components/home/Categories";
import { DrinkBar } from "@/components/home/DrinkBar";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { Reassurance } from "@/components/home/Reassurance";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Reassurance />
      <BestSellers />
      <Categories />
      <DrinkBar />
      <Gallery />
    </main>
  );
}
