// Pied de page (skill, structure de page n° 8), adapté au thème sombre et « sans boîtes » :
// logo empilé + slogan, séparateur à grain, 3 colonnes séparées par des filets, copyright.

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Logo } from "@/components/brand/Logo";
import { shop } from "@/data/shop";
import { navLinks } from "./nav-links";

// Liens légaux (pages créées plus tard)
const legalLinks = [
  { href: "/legal", label: "Mentions légales" },
  { href: "/privacy", label: "Confidentialité" },
  { href: "/terms", label: "Conditions de vente" },
];

const columnTitle = "mb-5 text-xs uppercase tracking-[0.25em] text-toffee";
const footerLink = "text-sm text-vanilla/80 transition-colors duration-200 ease-brand hover:text-cream";

export function Footer() {
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
            <h2 className={columnTitle}>Nous trouver</h2>
            <p className="flex items-center justify-center gap-2 text-sm text-vanilla/80">
              <MapPin className="h-4 w-4 shrink-0 text-cream" strokeWidth={1.5} aria-hidden="true" />
              {shop.address.street}, {shop.address.city}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-vanilla/80">
              {shop.hours.map((slot) => (
                <li key={slot.days} className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-cream" strokeWidth={1.5} aria-hidden="true" />
                  {slot.days} · {slot.open.replace(":", "h")} – {slot.close.replace(":", "h")}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation et liens légaux */}
          <nav aria-label="Pied de page" className="md:px-8">
            <h2 className={columnTitle}>Explorer</h2>
            <ul className="space-y-2">
              {[...navLinks, { href: "/reservation", label: "Réserver une table" }].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-vanilla/60 transition-colors duration-200 hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact et réseaux */}
          <div className="md:px-8">
            <h2 className={columnTitle}>Contact</h2>
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
        <p className="mt-16 border-t border-caramel/30 pt-8 text-center text-xs text-vanilla/60">
          © {new Date().getFullYear()} Le Petit Grain · Marque fictive, projet portfolio · Photos à titre d&apos;illustration
        </p>
      </div>
    </footer>
  );
}
