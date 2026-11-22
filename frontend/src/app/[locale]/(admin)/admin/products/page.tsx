"use client";
// Gestion du menu : produits (FR/EN, prix, disponibilité, best-seller) et catégories.
// Après chaque modification, le cache des pages publiques est vidé (refreshMenu) :
// les visiteurs voient le changement immédiatement.

import { useState } from "react";
import { Plus } from "lucide-react";
import { refreshMenu } from "@/app/actions";
import { AdminTitle } from "@/components/admin/AdminShell";
import { type AdminCategory, type AdminProduct, ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import { useApi } from "@/lib/use-api";

export default function AdminProductsPage() {
  const products = useApi<AdminProduct[]>("/admin/products");
  const categories = useApi<AdminCategory[]>("/admin/categories");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saved() {
    setEditing(null);
    products.reload();
    categories.reload();
    await refreshMenu();
  }

  async function patch(product: AdminProduct, changes: Partial<AdminProduct>) {
    setError(null);
    try {
      await apiRequest(`/admin/products/${product.id}`, { method: "PATCH", body: changes });
      await saved();
    } catch (e) {
      setError((e as ClientApiError).message);
    }
  }

  const cats = categories.data ?? [];
  const toggle = "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition-colors";

  return (
    <>
      <AdminTitle title="Menu">
        <Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" strokeWidth={1.5} /> Nouveau produit</Button>
      </AdminTitle>
      {error && <p role="alert" className="mb-4 text-red-200">{error}</p>}

      {editing === "new" && cats.length > 0 && (
        <div className="mb-10"><ProductForm categories={cats} onSaved={saved} onCancel={() => setEditing(null)} /></div>
      )}

      {cats.map((category) => (
        <section key={category.id} className="mb-12">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">{category.name_fr}</h2>
            <label className="flex items-center gap-2 text-xs text-vanilla/70">
              <input type="checkbox" className="accent-cream" checked={category.is_active}
                onChange={async (e) => {
                  await apiRequest(`/admin/categories/${category.id}`, {
                    method: "PUT",
                    body: { slug: category.slug, name_fr: category.name_fr, name_en: category.name_en, sort_order: category.sort_order, is_active: e.target.checked },
                  });
                  await saved();
                }} />
              Catégorie visible sur le site
            </label>
          </div>
          <ul className="divide-y divide-caramel/30 border-y border-caramel/30">
            {(products.data ?? []).filter((p) => p.category_id === category.id).map((product) => (
              <li key={product.id} className="py-3">
                {editing === product.id ? (
                  <ProductForm categories={cats} product={product} onSaved={saved} onCancel={() => setEditing(null)} />
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-48 flex-1">
                      <p className={product.is_available ? "" : "text-vanilla/50 line-through"}>{product.name_fr}</p>
                      <p className="text-xs text-vanilla/50">{product.name_en} · /{product.slug}</p>
                    </div>
                    <span className="w-24 text-right text-cream">{formatPrice(product.price_cents, "fr")}</span>
                    <button type="button" aria-pressed={product.is_available} onClick={() => patch(product, { is_available: !product.is_available })}
                      className={`${toggle} ${product.is_available ? "border-cream text-cream" : "border-caramel text-vanilla/50"}`}>
                      {product.is_available ? "Disponible" : "Épuisé"}
                    </button>
                    <button type="button" aria-pressed={product.is_bestseller} onClick={() => patch(product, { is_bestseller: !product.is_bestseller })}
                      className={`${toggle} ${product.is_bestseller ? "border-cream bg-cream text-cocoa" : "border-caramel text-vanilla/50"}`}>
                      ✦ Best-seller
                    </button>
                    <button type="button" onClick={() => setEditing(product.id)} className="text-xs text-vanilla/70 hover:text-cream">Modifier</button>
                    <button type="button" className="text-xs text-vanilla/50 hover:text-red-200"
                      onClick={async () => {
                        if (!window.confirm(`Supprimer « ${product.name_fr} » ? L'historique des ventes est conservé.`)) return;
                        await apiRequest(`/admin/products/${product.id}`, { method: "DELETE" });
                        await saved();
                      }}>
                      Supprimer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
