// Page « Notre histoire » (/fr/about) : récit, photos en arche, valeurs.
import type { Metadata } from "next";
import Image from "next/image";
import { HandHeart, Sparkles, Wheat } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { PageHeading } from "@/components/ui/PageHeading";
import { SectionTitle } from "@/components/ui/SectionTitle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return { title: t("metaTitle"), description: t("intro") };
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  const values = [
    { Icon: Wheat, title: t("value1Title"), text: t("value1Text") },
    { Icon: Sparkles, title: t("value2Title"), text: t("value2Text") },
    { Icon: HandHeart, title: t("value3Title"), text: t("value3Text") },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24">
      <PageHeading eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      {/* Récit + deux photos en arche décalées */}
      <section className="mt-6 grid items-center gap-14 md:grid-cols-2">
        <div className="flex flex-col gap-6 text-lg leading-relaxed text-vanilla/85">
          <p>{t("story1")}</p>
          <p>{t("story2")}</p>
          <p>{t("story3")}</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-chocolate">
            <Image src="/images/gallery/croissant-crumble.webp" alt={t("photo1")} fill sizes="(min-width: 750px) 25vw, 45vw" quality={90} className="photo object-cover" />
          </div>
          <div className="relative mt-14 aspect-[4/5] overflow-hidden rounded-t-full bg-chocolate">
            <Image src="/images/gallery/espresso.webp" alt={t("photo2")} fill sizes="(min-width: 750px) 25vw, 45vw" quality={90} className="photo object-cover" />
          </div>
        </div>
      </section>

      <section className="mt-28">
        <SectionTitle>{t("valuesTitle")}</SectionTitle>
        <ul className="grid gap-12 text-center md:grid-cols-3 md:gap-0 md:divide-x md:divide-caramel/40">
          {values.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center gap-3 md:px-8">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-caramel">
                <Icon className="h-7 w-7 text-toffee" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="font-serif text-xl font-semibold uppercase tracking-[0.12em]">{title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-vanilla/80">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-20 flex flex-col items-center gap-6 text-center">
        <Button href="/menu" size="lg">{t("cta")}</Button>
        <p className="text-xs text-vanilla/50">{t("fictional")}</p>
      </div>
    </main>
  );
}
