// Fiche produit : /fr/menu/croissant-amandes, /en/menu/croissant-amandes
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { ArrowLeft, Croissant, Leaf, Nut, Wheat } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductPurchase } from "@/components/menu/ProductPurchase";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Link } from "@/i18n/navigation";
import { formatPrice, type Locale } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/menu";

// Toutes les fiches sont préparées à l'avance (pages statiques, très rapides)
export async function generateStaticParams() {
  const products = await getProducts("fr");
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/menu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct((await rootLocale()) as Locale, slug);
  return product ? { title: `${product.name} · Le Petit Grain`, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/[locale]/menu/[slug]">) {
  const { slug } = await params;
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("ProductPage");
  const tMenu = await getTranslations("Menu");

  const product = await getProduct(locale, slug);
  if (!product) notFound();

  const related = (await getProducts(locale, { category: product.category.slug }))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
      <Link href="/menu" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-vanilla/80 hover:text-cream">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> {t("back")}
      </Link>

      <div className="mt-10 grid items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Photo en arche avec contour Caramel décalé */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <span className="absolute -inset-x-3 -top-3 bottom-0 rounded-t-full border border-b-0 border-caramel" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-t-full bg-chocolate">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill sizes="(min-width: 750px) 384px, 90vw" quality={90} className="photo object-cover" />
            ) : (
              <Croissant className="h-20 w-20 text-caramel" strokeWidth={1} aria-hidden="true" />
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-toffee">{product.category.name}</p>
          <h1 className="mt-3 font-serif text-5xl leading-tight font-medium">{product.name}</h1>
          {product.is_bestseller && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-cream">✦ {tMenu("bestseller")}</p>
          )}
          <p className="mt-6 max-w-md text-lg leading-relaxed text-vanilla/85">{product.description}</p>
          <p className="mt-6 font-serif text-3xl text-cream">{formatPrice(product.price_cents, locale)}</p>

          {/* Informations alimentaires */}
          <ul aria-label={t("contains")} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-vanilla/80">
            {product.is_vegetarian && (
              <li className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />{tMenu("vegetarian")}</li>
            )}
            {product.contains_nuts && (
              <li className="inline-flex items-center gap-2"><Nut className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />{tMenu("nuts")}</li>
            )}
            {product.contains_gluten && (
              <li className="inline-flex items-center gap-2"><Wheat className="h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden="true" />{t("gluten")}</li>
            )}
          </ul>

          <div className="my-8 h-px w-16 bg-caramel" aria-hidden="true" />
          <ProductPurchase slug={product.slug} available={product.is_available} />
          <p className="mt-6 text-xs tracking-[0.06em] text-vanilla/70">{t("pickupNote")}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28">
          <SectionTitle>{t("related")}</SectionTitle>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
            {related.map((p) => (
              <ProductCard key={p.slug} slug={p.slug} category={p.category.name} name={p.name}
                price={formatPrice(p.price_cents, locale)} image={p.image_url} available={p.is_available} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
