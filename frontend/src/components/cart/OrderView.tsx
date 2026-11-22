"use client";
// Confirmation et suivi d'une commande (/order/<identifiant public>).

import { useParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Button } from "@/components/ui/Button";
import { formatDay, formatPrice, formatTime, type Locale } from "@/lib/format";
import { useApi } from "@/lib/use-api";

type Order = {
  order_number: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "cancelled";
  pickup_at: string;
  customer_name: string;
  total_cents: number;
  items: { slug: string; name: string; quantity: number; line_total_cents: number }[];
};

export function OrderView() {
  const t = useTranslations("Order");
  const locale = useLocale() as Locale;
  const { id } = useParams<{ id: string }>();
  const { data: order, error, loading, reload } = useApi<Order>(`/orders/${encodeURIComponent(id)}`);

  if (loading && !order) return <p role="status" className="py-24 text-center text-vanilla/80">{t("loading")}</p>;
  if (error || !order) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <p className="text-lg">{t("notFound")}</p>
        <Button href="/">{t("backHome")}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-14 text-center">
      <BeanIcon className="h-12 w-12 text-cream" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-toffee">{t("eyebrow")}</p>
      <h1 className="mt-3 font-serif text-3xl uppercase tracking-[0.1em] sm:text-4xl">{t("title")}</h1>

      {/* Numéro de commande dans un cercle (à montrer au comptoir) */}
      <div className="mt-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-caramel">
        <span className="text-[10px] uppercase tracking-[0.2em] text-vanilla/70">{t("number")}</span>
        <span className="mt-2 font-serif text-3xl text-cream">{order.order_number}</span>
      </div>
      <p className="mt-3 text-xs text-vanilla/70">{t("numberHint")}</p>

      <dl className="mt-10 grid w-full grid-cols-2 divide-x divide-caramel/40 border-y border-caramel/40 py-5">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("pickup")}</dt>
          <dd className="mt-1 capitalize">{formatDay(order.pickup_at, locale)}</dd>
          <dd className="font-serif text-2xl text-cream">{formatTime(order.pickup_at, locale)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("status")}</dt>
          <dd className="mt-1 font-serif text-2xl text-cream" aria-live="polite">{t(`statuses.${order.status}`)}</dd>
          <dd>
            <button type="button" onClick={reload} className="mt-1 inline-flex items-center gap-1 text-xs text-vanilla/70 hover:text-cream">
              <RotateCcw className="h-3 w-3" strokeWidth={1.5} /> {t("refresh")}
            </button>
          </dd>
        </div>
      </dl>

      <section className="mt-8 w-full text-left">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("items")}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.slug} className="flex justify-between gap-3">
              <span>{item.quantity} × {item.name}</span>
              <span className="text-cream">{formatPrice(item.line_total_cents, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-baseline justify-between border-t border-caramel/40 pt-4">
          <span className="text-xs uppercase tracking-[0.15em] text-vanilla/80">{t("total")}</span>
          <span className="font-serif text-3xl text-cream">{formatPrice(order.total_cents, locale)}</span>
        </div>
      </section>

      <div className="mt-12"><Button href="/">{t("backHome")}</Button></div>
    </div>
  );
}
