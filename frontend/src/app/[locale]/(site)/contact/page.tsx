// Page Contact (/fr/contact) : adresse, horaires (venant de l'admin), téléphone, formulaire.
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { locale as rootLocale } from "next/root-params";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeading } from "@/components/ui/PageHeading";
import { shop } from "@/data/shop";
import { apiFetch } from "@/lib/api";
import type { Locale } from "@/lib/format";

type ShopInfo = { hours: { weekday: number; is_closed: boolean; open_time: string; close_time: string }[] };

// Horaires réels (modifiables dans l'admin), mis en cache quelques minutes
async function getShopInfo(locale: Locale) {
  "use cache";
  cacheLife("minutes");
  cacheTag("shop");
  return apiFetch<ShopInfo>("/shop/info", locale);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  return { title: t("metaTitle"), description: t("intro") };
}

export default async function ContactPage() {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("Contact");
  const info = await getShopInfo(locale);

  // Nom des jours dans la langue (0 = lundi) ; le 1er janvier 2024 était un lundi
  const dayName = (weekday: number) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { weekday: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 1 + weekday)),
    );
  const hour = (time: string) => (locale === "fr" ? time.slice(0, 5).replace(":", "h") : time.slice(0, 5));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <div className="grid gap-16 md:grid-cols-2 md:divide-x md:divide-caramel/40">
        {/* Coordonnées et horaires */}
        <div className="flex flex-col gap-10 md:pr-16">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-toffee">
              <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {t("address")}
            </h2>
            <p className="text-lg">{shop.address.street}<br />{shop.address.city}, {shop.address.country}</p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-toffee">
              <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {t("hours")}
            </h2>
            <dl className="divide-y divide-caramel/30">
              {info.hours.map((h) => (
                <div key={h.weekday} className="flex justify-between py-2">
                  <dt className="capitalize text-vanilla/85">{dayName(h.weekday)}</dt>
                  <dd className="text-cream">{h.is_closed ? t("closed") : `${hour(h.open_time)} – ${hour(h.close_time)}`}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <a href={`tel:${shop.phone.replaceAll(" ", "")}`} className="inline-flex items-center gap-3 hover:text-cream">
              <Phone className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">{t("phone")} :</span> {shop.phone}
            </a>
            <a href={`mailto:${shop.email}`} className="inline-flex items-center gap-3 hover:text-cream">
              <Mail className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">{t("email")} :</span> {shop.email}
            </a>
          </section>
        </div>

        {/* Formulaire */}
        <section className="md:pl-16">
          <h2 className="mb-6 font-serif text-3xl uppercase tracking-[0.1em] text-cream">{t("formTitle")}</h2>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
