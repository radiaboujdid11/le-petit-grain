// Pied de page (skill, structure de page n° 8), adapté au thème sombre et « sans boîtes » :
// logo empilé + slogan, séparateur à grain, 3 colonnes séparées par des filets, copyright.

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Logo } from "@/components/brand/Logo";
import { shop } from "@/data/shop";
import { Link } from "@/i18n/navigation";
import { navLinks } from "./nav-links";

// Liens légaux (pages créées plus tard) ; « key » = texte traduit de la section « Footer »
const legalLinks = [
  { href: "/legal", key: "legal" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
] as const;

// L'année courante : avec cacheComponents, une valeur qui change (new Date) doit être
// mise en cache explicitement (« use cache »), sinon la page ne peut pas être pré-rendue.
async function getCurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

// Copyright + mention obligatoire du projet (composant serveur asynchrone)
async function Copyright() {
  const t = await getTranslations("Footer");
  const year = await getCurrentYear();
  return (
    <p className="mt-16 border-t border-caramel/30 pt-8 text-center text-xs text-vanilla/60">
      {t("copyright", { year })}
    </p>
  );
}

const columnTitle = "mb-5 text-xs uppercase tracking-[0.25em] text-toffee";
const footerLink = "text-sm text-vanilla/80 transition-colors duration-200 ease-brand hover:text-cream";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  // Heures : « 07h30 » en français, « 07:30 » en anglais
  const formatHour = (hour: string) => (locale === "fr" ? hour.replace(":", "h") : hour);

  return (
    <footer className="mt-auto border-t border-caramel/30">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-10 md:px-8">
        {/* Logo + slogan */}
        <div className="flex flex-col items-center text-center text-cream">
          <Logo variant="stacked" />
          <p className="mt-6 font-serif text-xl text-vanilla/90 italic">A little moment of joy.</p>
        </div>

        {/* Séparateur : trait · grain · trait */}
        <div className="my-14 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-16 bg-caramel" />
          <BeanIcon className="h-5 w-5 text-toffee" />
          <span className="h-px w-16 bg-caramel" />
        </div>

        {/* 3 colonnes ; sur ordinateur, séparées par des filets verticaux (divide-x) */}
        <div className="grid gap-12 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-caramel/30">
          {/* Horaires et adresse */}
          <div className="md:px-8">
            <h2 className={columnTitle}>{t("findUs")}</h2>
            <p className="flex items-center justify-center gap-2 text-sm text-vanilla/80">
              <MapPin className="h-4 w-4 shrink-0 text-cream" strokeWidth={1.5} aria-hidden="true" />
              {shop.address.street}, {shop.address.city}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-vanilla/80">
              {shop.hours.map((slot) => (
                <li key={slot.daysKey} className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-cream" strokeWidth={1.5} aria-hidden="true" />
                  {t(slot.daysKey)} · {formatHour(slot.open)} – {formatHour(slot.close)}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation et liens légaux */}
          <nav aria-label={t("footerNav")} className="md:px-8">
            <h2 className={columnTitle}>{t("explore")}</h2>
            <ul className="space-y-2">
              {[...navLinks, { href: "/reservation", key: "reserveTable" } as const].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>{tNav(link.key)}</Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-vanilla/60 transition-colors duration-200 hover:text-cream">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact et réseaux */}
          <div className="md:px-8">
            <h2 className={columnTitle}>{t("contact")}</h2>
            <ul className="space-y-2">
              <li>
                <a href={`tel:${shop.phone.replaceAll(" ", "")}`} className={`${footerLink} inline-flex items-center gap-2`}>
                  <Phone className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />
                  {shop.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${shop.email}`} className={`${footerLink} inline-flex items-center gap-2`}>
                  <Mail className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />
                  {shop.email}
                </a>
              </li>
            </ul>
            <ul className="mt-6 flex justify-center gap-6">
              {shop.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-200 hover:text-vanilla"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright + mention obligatoire du projet */}
        <Copyright />
      </div>
    </footer>
  );
}
