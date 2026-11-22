"use client";
// Formulaire produit (création et modification) : champs FR et EN, prix en dirhams,
// catégorie, image, indicateurs. Le prix est saisi en DH et envoyé en centimes.

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export type AdminCategory = { id: number; slug: string; name_fr: string; name_en: string; sort_order: number; is_active: boolean; product_count: number };
export type AdminProduct = {
  id: number;
  category_id: number;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price_cents: number;
  image_url: string | null;
  is_available: boolean;
  is_bestseller: boolean;
  is_vegetarian: boolean;
  contains_nuts: boolean;
  contains_gluten: boolean;
  sort_order: number;
};

const FLAGS = [
  ["is_available", "Disponible"],
  ["is_bestseller", "Best-seller"],
  ["is_vegetarian", "Végétarien"],
  ["contains_nuts", "Fruits à coque"],
  ["contains_gluten", "Gluten"],
] as const;

type Props = { categories: AdminCategory[]; product?: AdminProduct; onSaved: () => void; onCancel: () => void };

export function ProductForm({ categories, product, onSaved, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const body = {
      category_id: Number(form.get("category_id")),
      slug: text("slug"),
      name_fr: text("name_fr"),
      name_en: text("name_en"),
      description_fr: text("description_fr"),
      description_en: text("description_en"),
      price_cents: Math.round(Number(text("price").replace(",", ".")) * 100), // « 22,50 » → 2250
      image_url: text("image_url") || null,
      ...Object.fromEntries(FLAGS.map(([key]) => [key, form.get(key) === "on"])),
    };
    setSaving(true);
    setError(null);
    try {
      await apiRequest(product ? `/admin/products/${product.id}` : "/admin/products", {
        method: product ? "PATCH" : "POST",
        body,
      });
      onSaved();
    } catch (e) {
      const apiError = e as ClientApiError;
      setError(apiError.message);
      setInvalid(apiError.fields);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 border-l border-caramel py-2 pl-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="field-category_id" className="text-[11px] uppercase tracking-[0.2em] text-vanilla/80">Catégorie *</label>
          <select id="field-category_id" name="category_id" defaultValue={product?.category_id ?? categories[0]?.id}
            className="border-0 border-b border-caramel bg-cocoa py-2.5 focus:border-cream focus:outline-none">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
          </select>
        </div>
        <Field label="Slug (URL)" name="slug" required defaultValue={product?.slug} placeholder="croissant-pistache" invalid={invalid.includes("slug")} />
        <Field label="Prix (DH)" name="price" required defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""} placeholder="22,00" invalid={invalid.includes("price_cents")} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nom (FR)" name="name_fr" required defaultValue={product?.name_fr} invalid={invalid.includes("name_fr")} />
        <Field label="Nom (EN)" name="name_en" required defaultValue={product?.name_en} invalid={invalid.includes("name_en")} />
        <Field label="Description (FR)" name="description_fr" multiline defaultValue={product?.description_fr} />
        <Field label="Description (EN)" name="description_en" multiline defaultValue={product?.description_en} />
      </div>
      <Field label="Image (chemin ou URL)" name="image_url" defaultValue={product?.image_url ?? ""} placeholder="/images/products/croissant-chocolat.webp" />
      <fieldset className="flex flex-wrap gap-5 text-sm">
        <legend className="sr-only">Indicateurs</legend>
        {FLAGS.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" name={key} defaultChecked={product ? product[key] : key === "is_available"} className="accent-cream" />
            {label}
          </label>
        ))}
      </fieldset>
      <FormError message={error} />
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
