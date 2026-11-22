"use client";
// Commandes du jour (ou d'une autre date) et changement de statut.
// La liste se rafraîchit toute seule toutes les 30 secondes (écran du comptoir).

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { formatPrice, formatTime, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useHydrated } from "@/lib/use-hydrated";

type Order = {
  id: number;
  order_number: string;
  status: string;
  pickup_at: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
  total_cents: number;
  items: { name: string; quantity: number }[];
  allowed_statuses: string[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  picked_up: "Récupérée",
  cancelled: "Annulée",
};

// Libellé du BOUTON qui fait passer à ce statut
const ACTION_LABELS: Record<string, string> = {
  confirmed: "Confirmer",
  preparing: "En préparation",
  ready: "Prête",
  picked_up: "Récupérée",
  cancelled: "Annuler",
};

export default function AdminOrdersPage() {
  const hydrated = useHydrated();
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const date = chosenDate ?? (hydrated ? shopToday() : null);
  const [status, setStatus] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const query = new URLSearchParams({ ...(date ? { date } : {}), ...(status ? { status } : {}) });
  const { data: orders, loading, reload } = useApi<Order[]>(date ? `/admin/orders?${query}` : null);

  // Rafraîchissement automatique
  useEffect(() => {
    const timer = setInterval(reload, 30_000);
    return () => clearInterval(timer);
  }, [reload]);

  async function changeStatus(order: Order, next: string) {
    setActionError(null);
    try {
      await apiRequest(`/admin/orders/${order.id}/status`, { method: "PATCH", body: { status: next } });
      reload();
    } catch (e) {
      setActionError((e as ClientApiError).message);
    }
  }

  const total = (orders ?? []).filter((o) => o.status === "picked_up").reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <>
      <AdminTitle title="Commandes">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-vanilla/70">Jour</span>
            <input type="date" value={date ?? ""} onChange={(e) => setChosenDate(e.target.value)}
              className="rounded-full border border-caramel bg-transparent px-3 py-1.5 [color-scheme:dark]" />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-vanilla/70">Statut</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-caramel bg-cocoa px-3 py-1.5">
              <option value="">Tous</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="button" onClick={reload} className="inline-flex items-center gap-1 text-vanilla/70 hover:text-cream" aria-label="Actualiser">
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          </button>
        </div>
      </AdminTitle>

      {actionError && <p role="alert" className="mb-4 text-red-200">{actionError}</p>}
      <p className="mb-6 text-sm text-vanilla/70">
        {orders?.length ?? 0} commande(s) · encaissé : <span className="text-cream">{formatPrice(total, "fr")}</span>
      </p>

      <ul className="divide-y divide-caramel/30 border-y border-caramel/30">
        {(orders ?? []).map((order) => (
          <li key={order.id} className="grid gap-3 py-4 md:grid-cols-[5rem_1fr_auto] md:items-center">
            <div>
              <p className="font-serif text-2xl text-cream">{formatTime(order.pickup_at, "fr")}</p>
              <p className="text-xs text-vanilla/60">{order.order_number}</p>
            </div>
            <div className="min-w-0">
              <p>
                <span className="font-medium">{order.customer_name}</span>
                <span className="ml-2 text-sm text-vanilla/60">{order.customer_phone}</span>
              </p>
              <p className="text-sm text-vanilla/80">{order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}</p>
              {order.notes && <p className="text-sm text-cream italic">« {order.notes} »</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <span className="mr-2 text-sm">{formatPrice(order.total_cents, "fr")}</span>
              <span className="rounded-full border border-caramel px-3 py-1 text-xs uppercase tracking-[0.1em]">{STATUS_LABELS[order.status]}</span>
              {order.allowed_statuses.map((next) => (
                <button key={next} type="button" onClick={() => changeStatus(order, next)}
                  className={`rounded-full px-3 py-1 text-xs ${next === "cancelled" ? "text-vanilla/60 hover:text-red-200" : "bg-cream text-cocoa hover:bg-vanilla"}`}>
                  {ACTION_LABELS[next]}
                </button>
              ))}
            </div>
          </li>
        ))}
        {orders && orders.length === 0 && <li className="py-10 text-center text-vanilla/60">Aucune commande pour ce jour.</li>}
      </ul>
    </>
  );
}
