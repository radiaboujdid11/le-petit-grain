import { locale as rootLocale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatPrice, type Locale } from "@/lib/format";
import { getProducts } from "@/lib/menu";

// Best-sellers de l'accueil : les produits marqués « best-seller » dans la base (via l'API).
// Composant serveur ASYNCHRONE : il attend les données avant d'afficher la section.
export async function BestSellers() {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("BestSellers");
  const products = await getProducts(locale, { bestseller: true });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 md:px-8">
      <SectionTitle intro={t("intro")}>{t("title")}</SectionTitle>
      {/* 2 colonnes mobile, 3 tablette, 4 ordinateur */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.slug}
            slug={product.slug}
            category={product.category.name}
            name={product.name}
            price={formatPrice(product.price_cents, locale)}
            image={product.image_url}
            available={product.is_available}
          />
        ))}
      </div>
    </section>
  );
}
