import { BeanIcon } from "./BeanIcon";

// Logo complet : le grain (SVG) + le nom (texte HTML en Cormorant).
// Le nom reste du vrai texte : net à toutes les tailles, lisible par Google
// et par les lecteurs d'écran.
// La couleur vient du parent (ex. <Logo className="text-cream" />).

type LogoProps = {
  variant?: "horizontal" | "stacked"; // navigation | hero et pied de page
  className?: string;
};

export function Logo({ variant = "horizontal", className = "" }: LogoProps) {
  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <BeanIcon className="h-14 w-14" />
        <span className="mt-3 font-serif text-4xl uppercase tracking-[0.12em] sm:text-5xl">
          Le Petit Grain
        </span>
        <span className="mt-3 text-xs uppercase tracking-[0.3em]">
          Coffee · Bakery · Pâtisserie
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BeanIcon className="h-7 w-7" />
      <span className="font-serif text-lg uppercase tracking-[0.14em]">Le Petit Grain</span>
    </div>
  );
}
