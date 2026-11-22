import { Clock, Coffee, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";

// Bloc de réassurance (skill, structure n° 5) : 3 engagements, séparés par des filets verticaux.
// Section « forte » en fond clair Vanilla (transposition du fond noir du style B).
export function Reassurance() {
  const t = useTranslations("Home");
  const items = [
    { Icon: Wheat, title: t("why1Title"), text: t("why1Text") },
    { Icon: Coffee, title: t("why2Title"), text: t("why2Text") },
    { Icon: Clock, title: t("why3Title"), text: t("why3Text") },
  ];

  return (
    <section aria-label={t("whyTitle")} className="bg-vanilla text-cocoa">
      <ul className="mx-auto grid max-w-5xl gap-10 px-6 py-16 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-caramel/40">
        {items.map(({ Icon, title, text }) => (
          <li key={title} className="flex flex-col items-center gap-3 md:px-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-caramel">
              <Icon className="h-6 w-6 text-caramel" strokeWidth={1.5} aria-hidden="true" />
            </span>
            {/* Texte cocoa / chocolate sur vanilla : contraste 9,9 à 14,3:1 */}
            <h3 className="font-serif text-xl font-semibold uppercase tracking-[0.12em]">{title}</h3>
            <p className="max-w-xs text-sm leading-relaxed text-chocolate">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
