import { BeanIcon } from "@/components/brand/BeanIcon";

// En-tête commun des pages intérieures : grain, sur-titre, titre, introduction.
export function PageHeading({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <header className="flex flex-col items-center gap-3 pt-14 pb-10 text-center">
      <BeanIcon className="h-10 w-10 text-cream" />
      {eyebrow && <p className="text-[11px] uppercase tracking-[0.3em] text-toffee">{eyebrow}</p>}
      {/* Style B : titre en MAJUSCULES espacées */}
      <h1 className="font-serif text-3xl uppercase tracking-[0.1em] sm:text-4xl">{title}</h1>
      {intro && <p className="mt-2 max-w-xl leading-relaxed text-vanilla/80">{intro}</p>}
    </header>
  );
}
