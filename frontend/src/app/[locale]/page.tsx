// Page d'accueil. Elle se construit section par section (ordre du skill) :
// hero → best-sellers → catégories → réassurance → histoire → galerie…
import { BestSellers } from "@/components/home/BestSellers";
import { DrinkBar } from "@/components/home/DrinkBar";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <BestSellers />
      <DrinkBar />
      <Gallery />
    </main>
  );
}
