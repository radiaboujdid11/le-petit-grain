import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { PageHeading } from "@/components/ui/PageHeading";

// Page légale simple (mentions légales, confidentialité, conditions de vente).
export async function LegalPage({ page }: { page: "legal" | "privacy" | "terms" }) {
  const t = await getTranslations("Legal");
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24">
      <PageHeading title={t(`${page}Title`)} />
      <p className="text-lg leading-relaxed text-vanilla/85">{t(`${page}Text`)}</p>
      <div className="mt-12"><Button href="/" variant="secondary">{t("backHome")}</Button></div>
    </main>
  );
}
