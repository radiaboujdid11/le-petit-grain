import Link from "next/link";

// Bouton du design system.
// - Avec « href » : c'est un lien (navigation vers une autre page) → <Link>
// - Sans « href » : c'est une action (envoyer un formulaire…) → <button>
// Les deux ont exactement le même style.

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

// Classes communes à tous les boutons
// Style du skill : MAJUSCULES espacées ; au survol, légère montée + ombre (200 ms).
// Forme en pilule conservée (choix « pas de carrés »).
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "uppercase tracking-[0.08em] " +
  "transition duration-200 ease-brand hover:-translate-y-0.5 hover:shadow-lift " +
  // Contour visible quand on navigue au clavier (Tab) : accessibilité
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Plein : texte cocoa sur crème (contraste 9,4:1)
  primary: "bg-cream text-cocoa hover:bg-vanilla",
  // Contour : texte crème, se remplit au survol
  secondary: "border border-cream text-cream hover:bg-cream hover:text-cocoa",
  // Discret : simple texte, pour les actions secondaires
  // Discret : pas de montée ni d'ombre (shadow-none, translate-y-0)
  ghost: "text-cream hover:text-vanilla hover:translate-y-0 hover:shadow-none",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-xs", // 44 px de haut : taille minimale conseillée au doigt
  lg: "h-13 px-8 text-sm",
};

type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
  className = "",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
