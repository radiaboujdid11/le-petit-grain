// Page d'accueil. Elle se construit section par section (ordre du skill) :
// hero → best-sellers → catégories → réassurance → histoire → galerie…
import { BestSellers } from "@/components/home/BestSellers";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <BestSellers />
      <Gallery />
    </main>
  );
}
