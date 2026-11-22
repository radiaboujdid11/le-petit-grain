"use client";
// Finalisation de la commande : jour + créneau de retrait, coordonnées, récapitulatif.
// Le navigateur n'envoie que les slugs et quantités : le backend recalcule le total.

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";
import { DayPicker, type Slot, SlotPicker } from "@/components/ui/SlotPicker";
import { useRouter } from "@/i18n/navigation";
import type { Product } from "@/lib/api";
import { subtotalCents } from "@/lib/cart";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { addDays, formatPrice, type Locale, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useCart } from "./CartProvider";

type ShopInfo = { pickup_days_ahead: number };
type CreatedOrder = { public_id: string };

export function CheckoutView() {
  const t = useTranslations("Checkout");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const { data: products } = useApi<Product[]>("/products");
  const { data: info } = useApi<ShopInfo>("/shop/info");

  // Jours de retrait possibles (calculés dans le navigateur : « aujourd'hui » du visiteur)
  const days = ready ? Array.from({ length: (info?.pickup_days_ahead ?? 6) + 1 }, (_, i) => addDays(shopToday(), i)) : [];
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const day = chosenDay ?? days[0] ?? null;
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Créneaux du jour choisi (null pendant le chargement)
  const slotsQuery = useApi<Slot[]>(day ? `/pickup-slots?date=${day}` : null);
  const slots = slotsQuery.loading ? null : (slotsQuery.data ?? []);

  // Panier vide (ex. après la commande) : retour au panier
  useEffect(() => {
    if (ready && lines.length === 0 && !submitting) router.replace("/cart");
  }, [ready, lines.length, submitting, router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return setError(t("chooseTime"));
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setInvalid([]);
    try {
      const order = await apiRequest<CreatedOrder>("/orders", {
        method: "POST",
        locale,
        body: {
          items: lines,
          pickup_at: slot,
          customer_name: form.get("name"),
          customer_phone: form.get("phone"),
          customer_email: form.get("email"),
          notes: form.get("notes") ?? "",
        },
      });
      router.push(`/order/${order.public_id}`);
      clear();
    } catch (e) {
      const apiError = e as ClientApiError;
      setError(apiError.message);
      setInvalid(apiError.fields ?? []);
      setSubmitting(false);
      // Créneau pris entre-temps : on recharge les créneaux disponibles
      if (apiError.code === "INVALID_PICKUP_SLOT") {
        setSlot(null);
        slotsQuery.reload();
      }
    }
  }

  // Rendu seulement dans le navigateur, une fois le panier relu (dates = jour réel du visiteur)
  if (!ready) return <p role="status" className="py-20 text-center text-vanilla/80">{t("loadingSlots")}</p>;

  const bySlug = Object.fromEntries((products ?? []).map((p) => [p.slug, p]));
  const prices = Object.fromEntries((products ?? []).map((p) => [p.slug, p.price_cents]));

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">{t("pickup")}</h2>
          <DayPicker days={days} value={day ?? ""} onChange={(d) => { setChosenDay(d); setSlot(null); }} label={t("day")} />
          <SlotPicker slots={slots} value={slot} onChange={setSlot} label={t("time")}
            loadingText={t("loadingSlots")} emptyText={t("noSlots")} fullText={t("full")} />
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">{t("details")}</h2>
          <Field label={t("name")} name="name" required autoComplete="name" invalid={invalid.includes("customer_name")} maxLength={120} />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t("phone")} name="phone" type="tel" required autoComplete="tel" invalid={invalid.includes("customer_phone")} />
            <Field label={t("email")} name="email" type="email" required autoComplete="email" invalid={invalid.includes("customer_email")} />
          </div>
          <Field label={t("notes")} name="notes" multiline placeholder={t("notesPlaceholder")} maxLength={500} />
          <p className="text-xs text-vanilla/60">{t("privacy")}</p>
        </section>
      </div>

      {/* Récapitulatif : colonne collante sur ordinateur */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">{t("summary")}</h2>
        <ul className="mt-5 flex flex-col gap-3 border-b border-caramel/40 pb-5 text-sm">
          {lines.map((line) => (
            <li key={line.slug} className="flex justify-between gap-3">
              <span>{line.quantity} × {bySlug[line.slug]?.name ?? line.slug}</span>
              <span className="text-cream">{formatPrice((prices[line.slug] ?? 0) * line.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.15em] text-vanilla/80">{t("total")}</span>
          <span className="font-serif text-2xl text-cream">{formatPrice(subtotalCents(lines, prices), locale)}</span>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <FormError message={error} />
          <Button type="submit" size="lg" disabled={submitting || lines.length === 0}>
            {submitting ? t("submitting") : t("submit")}
          </Button>
          <Button href="/cart" variant="ghost">← {t("backToCart")}</Button>
        </div>
      </aside>
    </form>
  );
}
