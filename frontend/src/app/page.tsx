// Page TEMPORAIRE : vitrine du design system pour vérifier couleurs et polices.
// Elle sera remplacée par la vraie page d'accueil.
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Logo } from "@/components/brand/Logo";

const palette = [
  { name: "Dark Cocoa", className: "bg-cocoa", hex: "#211710", usage: "Fond principal" },
  { name: "Chocolate", className: "bg-chocolate", hex: "#493020", usage: "Cartes, sections" },
  { name: "Caramel", className: "bg-caramel", hex: "#805333", usage: "Bordures uniquement" },
  { name: "Toffee", className: "bg-toffee", hex: "#B9824E", usage: "Accent (sur cocoa)" },
  { name: "Golden Cream", className: "bg-cream", hex: "#D7B98D", usage: "Accent, sous-titres" },
  { name: "Vanilla", className: "bg-vanilla", hex: "#F2E6D5", usage: "Texte principal" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-8">
      {/* Typographie */}
      <section className="mb-16">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-toffee">
          Design system
        </p>
        <h1 className="font-serif text-5xl font-medium sm:text-7xl">
          Le Petit Grain
        </h1>
        <p className="mt-4 font-serif text-2xl italic text-cream sm:text-3xl">
          A little moment of joy.
        </p>
        <p className="mt-2 text-vanilla/80">Coffee, pastries &amp; warmth.</p>
      </section>

      {/* Logo */}
      <section className="mb-16">
        <h2 className="mb-6 border-b border-caramel pb-3 font-serif text-3xl">
          Logo
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sur fond sombre : couleur crème */}
          <div className="flex flex-col items-center gap-10 rounded-lg border border-caramel/50 py-12 text-cream">
            <Logo variant="stacked" />
            <Logo variant="horizontal" />
          </div>
          {/* Sur fond clair : le même logo, en Dark Cocoa */}
          <div className="flex flex-col items-center gap-10 rounded-lg bg-vanilla py-12 text-cocoa">
            <Logo variant="stacked" />
            <Logo variant="horizontal" />
          </div>
        </div>
        {/* Le grain seul, en plusieurs tailles, pour vérifier la finesse du trait */}
        <div className="mt-6 flex items-end gap-6 text-toffee">
          <BeanIcon className="h-4 w-4" />
          <BeanIcon className="h-6 w-6" />
          <BeanIcon className="h-10 w-10" />
          <BeanIcon className="h-16 w-16" />
          <BeanIcon className="h-24 w-24" />
        </div>
      </section>

      {/* Palette */}
      <section>
        <h2 className="mb-6 border-b border-caramel pb-3 font-serif text-3xl">
          Palette
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {palette.map((color) => (
            <li key={color.name} className="overflow-hidden rounded-lg border border-caramel/50">
              <div className={`h-24 ${color.className}`} />
              <div className="bg-chocolate p-3">
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-cream">{color.hex}</p>
                <p className="text-sm text-vanilla/80">{color.usage}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
