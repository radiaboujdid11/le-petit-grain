// Page 404 du site, dans la langue courante, avec le header et le pied de page.
import { useTranslations } from "next-intl";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
      <BeanIcon className="h-12 w-12 text-cream" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-toffee">{t("eyebrow")}</p>
      <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight font-medium sm:text-5xl">{t("title")}</h1>
      <p className="mt-5 text-vanilla/80">{t("text")}</p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button href="/">{t("home")}</Button>
        <Button href="/menu" variant="secondary">{t("menu")}</Button>
      </div>
    </main>
  );
}
