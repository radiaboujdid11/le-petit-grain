// Pictogramme du logo : un grain de café au trait fin.
// Le trait utilise « currentColor » : le grain prend la couleur du texte
// autour de lui (classe text-cream, text-cocoa…). Une seule version, partout.

type BeanIconProps = {
  className?: string; // taille et couleur, ex. "h-8 w-8 text-cream"
};

export function BeanIcon({ className = "h-8 w-8" }: BeanIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true" // décoratif : le nom du café est écrit en texte à côté
    >
      {/* Tout le grain est incliné de 30° vers la droite autour du centre (24, 24) */}
      <g transform="rotate(30 24 24)">
        {/* Contour du grain */}
        <ellipse cx="24" cy="24" rx="13" ry="19" />
        {/* Fente centrale en S : une courbe de Bézier dont les deux points
            de contrôle sont de part et d'autre de l'axe */}
        <path d="M24 6.5 C 16 16, 32 32, 24 41.5" />
      </g>
    </svg>
  );
}
