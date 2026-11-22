"use client";
// Tableau de bord des ventes : chiffre d'affaires par jour, produits les plus vendus,
// heures de pointe, panier moyen, taux de remplissage des réservations.

import { useState } from "react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { ColumnChart, DataTable, RankingChart, StatTile } from "@/components/admin/Charts";
import { formatPrice } from "@/lib/format";
import { useApi } from "@/lib/use-api";

type Stats = {
  total_revenue_cents: number;
  orders_count: number;
  average_basket_cents: number;
  revenue_by_day: { date: string; revenue_cents: number; orders: number }[];
  top_products: { name: string; quantity: number; revenue_cents: number }[];
  peak_hours: { hour: number; orders: number }[];
  reservations_count: number;
  guests_count: number;
  reservation_fill_rate: number;
  pending_orders: number;
  unread_messages: number;
};

const PERIODS = [7, 30, 90];
const dh = (cents: number) => formatPrice(cents, "fr");
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data: stats, error, loading } = useApi<Stats>(`/admin/stats?days=${days}`);

  return (
    <>
      <AdminTitle title="Tableau de bord">
        {/* Filtre de période : une seule rangée au-dessus des graphiques */}
        <div role="group" aria-label="Période" className="flex gap-2">
          {PERIODS.map((p) => (
            <button key={p} type="button" aria-pressed={p === days} onClick={() => setDays(p)}
              className={`rounded-full border px-4 py-1.5 text-xs ${p === days ? "border-cream bg-cream text-cocoa" : "border-caramel text-vanilla/80 hover:border-cream"}`}>
              {p} jours
            </button>
          ))}
        </div>
      </AdminTitle>

      {error && <p role="alert" className="text-red-200">{error.message}</p>}
      {!stats ? (
        <p role="status" className="text-vanilla/70">Chargement des statistiques…</p>
      ) : (
        <div className={`flex flex-col gap-14 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <section aria-label="Chiffres clés" className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatTile label="Chiffre d'affaires" value={dh(stats.total_revenue_cents)} hint={`sur ${days} jours, commandes récupérées`} />
            <StatTile label="Commandes" value={String(stats.orders_count)} hint={`${stats.pending_orders} en cours aujourd'hui et à venir`} />
            <StatTile label="Panier moyen" value={dh(stats.average_basket_cents)} />
            <StatTile label="Remplissage salle" value={`${Math.round(stats.reservation_fill_rate * 100)} %`}
              hint={`${stats.reservations_count} réservations · ${stats.guests_count} couverts`} />
          </section>

          <section>
            <ColumnChart
              title="Chiffre d'affaires par jour"
              labelEvery={days <= 7 ? 1 : days <= 30 ? 5 : 15}
              bars={stats.revenue_by_day.map((d) => ({
                label: shortDate(d.date),
                value: d.revenue_cents,
                tooltip: `${shortDate(d.date)} : ${dh(d.revenue_cents)} · ${d.orders} commandes`,
              }))}
            />
            <DataTable caption="Chiffre d'affaires par jour" headers={["Date", "Chiffre d'affaires", "Commandes"]}
              rows={stats.revenue_by_day.map((d) => [shortDate(d.date), dh(d.revenue_cents), d.orders])} />
          </section>

          <div className="grid gap-14 lg:grid-cols-2">
            <section>
              <RankingChart
                title="Produits les plus vendus (quantités)"
                bars={stats.top_products.map((p) => ({ label: p.name, value: p.quantity, tooltip: `${p.name} : ${p.quantity} vendus · ${dh(p.revenue_cents)}` }))}
              />
              <DataTable caption="Produits les plus vendus" headers={["Produit", "Quantité", "Chiffre d'affaires"]}
                rows={stats.top_products.map((p) => [p.name, p.quantity, dh(p.revenue_cents)])} />
            </section>
            <section>
              <ColumnChart
                title="Heures de pointe (retraits)"
                labelEvery={2}
                bars={stats.peak_hours.map((h) => ({ label: `${h.hour}h`, value: h.orders, tooltip: `${h.hour}h – ${h.hour + 1}h : ${h.orders} commandes` }))}
              />
              <DataTable caption="Commandes par heure" headers={["Heure", "Commandes"]}
                rows={stats.peak_hours.map((h) => [`${h.hour}h`, h.orders])} />
            </section>
          </div>

          {stats.unread_messages > 0 && (
            <p className="text-sm text-cream">✉ {stats.unread_messages} message(s) de contact non lu(s).</p>
          )}
        </div>
      )}
    </>
  );
}
