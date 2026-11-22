import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return { title: `${t("termsTitle")} · Le Petit Grain` };
}

export default function Page() {
  return <LegalPage page="terms" />;
}
