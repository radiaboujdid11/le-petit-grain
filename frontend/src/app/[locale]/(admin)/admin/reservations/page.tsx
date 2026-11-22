"use client";
// Réservations d'un jour, avec annulation et nombre de couverts.

import { useState } from "react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/client-api";
import { formatTime, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useHydrated } from "@/lib/use-hydrated";

type Reservation = {
  id: number;
  reference: string;
  status: string;
  start_at: string;
  end_at: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  notes: string;
};

export default function AdminReservationsPage() {
  const hydrated = useHydrated();
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const date = chosenDate ?? (hydrated ? shopToday() : null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const { data: reservations, reload } = useApi<Reservation[]>(date ? `/admin/reservations?date=${date}` : null);

  const active = (reservations ?? []).filter((r) => r.status === "confirmed");
  const guests = active.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <>
      <AdminTitle title="Réservations">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-vanilla/70">Jour</span>
          <input type="date" value={date ?? ""} onChange={(e) => setChosenDate(e.target.value)}
            className="rounded-full border border-caramel bg-transparent px-3 py-1.5 [color-scheme:dark]" />
        </label>
      </AdminTitle>

      <p className="mb-6 text-sm text-vanilla/70">
        {active.length} réservation(s) confirmée(s) · <span className="text-cream">{guests} couverts</span>
      </p>

      <ul className="divide-y divide-caramel/30 border-y border-caramel/30">
        {(reservations ?? []).map((r) => (
          <li key={r.id} className={`grid gap-3 py-4 md:grid-cols-[8rem_1fr_auto] md:items-center ${r.status === "cancelled" ? "opacity-50" : ""}`}>
            <div>
              <p className="font-serif text-2xl text-cream">{formatTime(r.start_at, "fr")}</p>
              <p className="text-xs text-vanilla/60">jusqu&apos;à {formatTime(r.end_at, "fr")} · {r.reference}</p>
            </div>
            <div>
              <p><span className="font-medium">{r.customer_name}</span> <span className="ml-2 text-sm text-vanilla/60">{r.customer_phone}</span></p>
              <p className="text-sm text-vanilla/80">{r.party_size} personne(s){r.notes ? ` · « ${r.notes} »` : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {r.status === "cancelled" ? (
                <span className="text-xs uppercase tracking-[0.1em] text-vanilla/60">Annulée</span>
              ) : confirming === r.id ? (
                <>
                  <button type="button" className="rounded-full bg-cream px-3 py-1 text-xs text-cocoa"
                    onClick={async () => { await apiRequest(`/admin/reservations/${r.id}/cancel`, { method: "POST" }); setConfirming(null); reload(); }}>
                    Confirmer l&apos;annulation
                  </button>
                  <button type="button" className="text-xs text-vanilla/60" onClick={() => setConfirming(null)}>Garder</button>
                </>
              ) : (
                <button type="button" className="text-xs text-vanilla/60 hover:text-red-200" onClick={() => setConfirming(r.id)}>Annuler</button>
              )}
            </div>
          </li>
        ))}
        {reservations && reservations.length === 0 && <li className="py-10 text-center text-vanilla/60">Aucune réservation ce jour-là.</li>}
      </ul>
    </>
  );
}
