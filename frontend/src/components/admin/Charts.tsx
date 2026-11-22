// Graphiques du tableau de bord, en HTML/CSS, sans bibliothèque (guide « dataviz ») :
// - UNE série par graphique → une seule couleur (Toffee), pas de légende : le titre la nomme ;
// - barres fines, extrémités arrondies 4px posées sur la ligne de base, 2px d'espace entre barres ;
// - grille et axes discrets ; info-bulle au survol ET au clavier (focus) sur chaque barre ;
// - une vue « tableau » des données est fournie à côté (accessibilité).

type Bar = { label: string; value: number; tooltip: string };

// Tuile « chiffre clé » (pas besoin d'un graphique pour une seule valeur)
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 border-l border-caramel/60 pl-4">
      <span className="text-[11px] uppercase tracking-[0.18em] text-vanilla/70">{label}</span>
      <span className="font-serif text-3xl text-vanilla">{value}</span>
      {hint && <span className="text-xs text-vanilla/60">{hint}</span>}
    </div>
  );
}

// Barres verticales (évolution dans le temps ou par heure)
export function ColumnChart({ title, bars, labelEvery = 1 }: { title: string; bars: Bar[]; labelEvery?: number }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure>
      <figcaption className="mb-4 text-sm uppercase tracking-[0.15em] text-cream">{title}</figcaption>
      <div className="relative">
        {/* Lignes de grille discrètes (25 %, 50 %, 75 %) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => <span key={i} className="border-t border-vanilla/10" />)}
        </div>
        <div className="relative flex h-48 items-end gap-[2px] border-b border-vanilla/30">
          {bars.map((bar) => (
            <div key={bar.label} className="group relative flex h-full flex-1 items-end">
              {/* Cible de survol = toute la hauteur de la colonne (plus grande que la barre) */}
              <div
                tabIndex={0}
                aria-label={bar.tooltip}
                className="w-full rounded-t-[4px] bg-toffee transition-colors duration-200 group-hover:bg-cream focus:bg-cream focus:outline-none"
                style={{ height: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 1.5 : 0)}%` }}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-vanilla px-3 py-1 text-xs text-cocoa group-hover:block group-focus-within:block"
              >
                {bar.tooltip}
              </span>
            </div>
          ))}
        </div>
        {/* Étiquettes de l'axe : une sur N pour éviter les chevauchements */}
        <div aria-hidden="true" className="mt-2 flex gap-[2px] text-[10px] text-vanilla/60">
          {bars.map((bar, i) => (
            <span key={bar.label} className="flex-1 text-center">{i % labelEvery === 0 ? bar.label : ""}</span>
          ))}
        </div>
      </div>
    </figure>
  );
}

// Barres horizontales (classement : produits les plus vendus)
export function RankingChart({ title, bars }: { title: string; bars: Bar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure>
      <figcaption className="mb-4 text-sm uppercase tracking-[0.15em] text-cream">{title}</figcaption>
      <ol className="flex flex-col gap-3">
        {bars.map((bar) => (
          <li key={bar.label} className="group grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate text-vanilla/85">{bar.label}</span>
            <span className="h-3 border-l border-vanilla/30">
              <span
                tabIndex={0}
                aria-label={bar.tooltip}
                title={bar.tooltip}
                className="block h-full rounded-r-[4px] bg-toffee transition-colors group-hover:bg-cream focus:bg-cream focus:outline-none"
                style={{ width: `${(bar.value / max) * 100}%` }}
              />
            </span>
            {/* Étiquette directe de la valeur, en couleur de texte (pas la couleur de la série) */}
            <span className="tabular-nums text-vanilla/80">{bar.value}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

// Vue tableau des mêmes données (repliable)
export function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-xs uppercase tracking-[0.15em] text-vanilla/60 hover:text-cream">Voir les données</summary>
      <table className="mt-3 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-caramel/40 text-vanilla/70">
            {headers.map((h) => <th key={h} className="py-1 pr-4 font-normal">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-vanilla/10">
          {rows.map((row) => (
            <tr key={String(row[0])}>{row.map((cell, i) => <td key={i} className="py-1 pr-4 tabular-nums">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
