"use client";
// Jours de fermeture exceptionnelle (fêtes, congés, travaux) : ce jour-là, le site
// ne propose plus aucun créneau de retrait ni de réservation.

import { useState } from "react";
import { X } from "lucide-react";
import { refreshShopInfo } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { formatDay, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";

type Closure = { day: string; reason: string };

const input = "border-0 border-b border-caramel bg-transparent py-1 focus:border-cream focus:outline-none";

export function ClosuresManager() {
  const { data, reload } = useApi<Closure[]>("/admin/closures");
  const [error, setError] = useState<string | null>(null);
  const today = shopToday();

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const day = String(form.get("day"));
    setError(null);
    try {
      await apiRequest(`/admin/closures/${day}`, { method: "PUT", body: { day, reason: String(form.get("reason") ?? "") } });
      await refreshShopInfo();
      formElement.reset();
      reload();
    } catch (e) {
      setError((e as ClientApiError).message);
    }
  }

  async function remove(day: string) {
    setError(null);
    try {
      await apiRequest(`/admin/closures/${day}`, { method: "DELETE" });
      await refreshShopInfo();
      reload();
    } catch (e) {
      setError((e as ClientApiError).message);
    }
  }

  return (
    <section className="mt-16">
      <h2 className="mb-2 font-serif text-2xl uppercase tracking-[0.12em] text-cream">Fermetures exceptionnelles</h2>
      <p className="mb-6 max-w-2xl text-sm text-vanilla/70">
        Un jour ajouté ici n&apos;affiche plus aucun créneau de commande ni de réservation sur le site.
        Les réservations déjà prises ce jour-là restent visibles dans « Réservations » : pensez à prévenir les clients.
      </p>
      <FormError message={error} />

      <form onSubmit={add} className="mb-8 flex flex-wrap items-end gap-6 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-vanilla/80">Jour</span>
          <input type="date" name="day" required min={today} className={`${input} [color-scheme:dark]`} />
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-vanilla/80">Motif (facultatif)</span>
          <input type="text" name="reason" maxLength={120} placeholder="Aïd, congés, inventaire…" className={input} />
        </label>
        <Button type="submit" variant="secondary">Fermer ce jour</Button>
      </form>

      {data === null ? (
        <p role="status" className="text-vanilla/70">Chargement…</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-vanilla/70">Aucune fermeture prévue.</p>
      ) : (
        <ul className="divide-y divide-caramel/30">
          {data.map((c) => (
            <li key={c.day} className={`flex items-center justify-between gap-4 py-3 text-sm ${c.day < today ? "opacity-50" : ""}`}>
              <span className="capitalize">{formatDay(`${c.day}T12:00:00Z`, "fr")}</span>
              <span className="flex-1 text-vanilla/70">{c.reason}</span>
              <button
                type="button"
                onClick={() => remove(c.day)}
                aria-label={`Rouvrir le ${formatDay(`${c.day}T12:00:00Z`, "fr")}`}
                className="inline-flex items-center gap-1 text-xs text-vanilla/60 transition-colors hover:text-cream"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} /> Rouvrir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
