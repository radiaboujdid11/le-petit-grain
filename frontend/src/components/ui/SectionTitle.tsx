import { BeanIcon } from "@/components/brand/BeanIcon";

// Titre de section (skill, style B) :
// H2 centré en MAJUSCULES, séparateur « —— grain —— », puis une courte introduction.

type SectionTitleProps = {
  children: React.ReactNode;
  intro?: string; // paragraphe facultatif, 2 à 3 lignes
};

export function SectionTitle({ children, intro }: SectionTitleProps) {
  return (
    <div className="mx-auto mb-12 max-w-[600px] text-center">
      <h2 className="font-serif text-2xl uppercase tracking-[0.12em] sm:text-3xl">
        {children}
      </h2>

      {/* Séparateur : trait 40px · grain · trait 40px */}
      <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-10 bg-caramel" />
        <BeanIcon className="h-6 w-6 text-toffee" />
        <span className="h-px w-10 bg-caramel" />
      </div>

      {intro && <p className="mt-4 leading-relaxed text-vanilla/80">{intro}</p>}
    </div>
  );
}
