// Champs de formulaire du design system (skill : bordure fine, focus en couleur de marque),
// adaptés au thème sombre : soulignement au lieu d'une boîte, comme une carte de menu.

const inputClass =
  "w-full border-0 border-b border-caramel bg-transparent px-0 py-2.5 text-vanilla placeholder:text-vanilla/40 " +
  "transition-colors duration-200 focus:border-cream focus:outline-none aria-[invalid=true]:border-red-400";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
  invalid?: boolean;
  defaultValue?: string;
  maxLength?: number;
};

export function Field({ label, name, type = "text", multiline, invalid, ...rest }: FieldProps) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-1">
      {/* <label for> relié au champ : obligatoire pour l'accessibilité */}
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.2em] text-vanilla/80">
        {label}
        {rest.required && <span aria-hidden="true" className="text-cream"> *</span>}
      </label>
      {multiline ? (
        <textarea id={id} name={name} rows={4} aria-invalid={invalid || undefined} className={`${inputClass} resize-y`} {...rest} />
      ) : (
        <input id={id} name={name} type={type} aria-invalid={invalid || undefined} className={inputClass} {...rest} />
      )}
    </div>
  );
}

// Message d'erreur annoncé aux lecteurs d'écran (role="alert")
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-2 border-red-400 py-1 pl-3 text-sm text-red-200">
      {message}
    </p>
  );
}
