"use client";
// Réglages : capacité de la salle, durée des créneaux, retrait des commandes, horaires,
// et jours de fermeture exceptionnelle.

import { useState } from "react";
import { refreshShopInfo } from "@/app/actions";
import { AdminTitle } from "@/components/admin/AdminShell";
import { ClosuresManager } from "@/components/admin/ClosuresManager";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { useApi } from "@/lib/use-api";

type Hours = { weekday: number; is_closed: boolean; open_time: string; close_time: string };
type SettingsData = { settings: Record<string, number>; hours: Hours[] };

const FIELDS: [string, string, string][] = [
  ["seating_capacity", "Places assises", "personnes"],
  ["reservation_duration_minutes", "Durée d'une réservation", "minutes"],
  ["reservation_slot_minutes", "Écart entre deux créneaux de réservation", "minutes"],
  ["max_party_size", "Groupe maximum en ligne", "personnes"],
  ["reservation_days_ahead", "Réservation possible jusqu'à", "jours à l'avance"],
  ["pickup_slot_minutes", "Écart entre deux créneaux de retrait", "minutes"],
  ["pickup_min_lead_minutes", "Délai de préparation minimum", "minutes"],
  ["max_orders_per_pickup_slot", "Commandes maximum par créneau", "commandes"],
  ["pickup_days_ahead", "Commande possible jusqu'à", "jours à l'avance"],
];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const input = "w-24 border-0 border-b border-caramel bg-transparent py-1 text-right focus:border-cream focus:outline-none";

export default function AdminSettingsPage() {
  const { data, reload } = useApi<SettingsData>("/admin/settings");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    const body = {
      settings: Object.fromEntries(FIELDS.map(([key]) => [key, Number(form.get(key))])),
      hours: data.hours.map((h) => ({
        weekday: h.weekday,
        is_closed: form.get(`closed-${h.weekday}`) === "on",
        open_time: String(form.get(`open-${h.weekday}`)),
        close_time: String(form.get(`close-${h.weekday}`)),
      })),
    };
    setError(null);
    setMessage(null);
    try {
      await apiRequest("/admin/settings", { method: "PUT", body });
      await refreshShopInfo();
      setMessage("Réglages enregistrés.");
      reload();
    } catch (e) {
      setError((e as ClientApiError).message);
    }
  }

  if (!data) return <p role="status" className="text-vanilla/70">Chargement…</p>;

  return (
    <>
    <form onSubmit={submit}>
      <AdminTitle title="Réglages"><Button type="submit">Enregistrer</Button></AdminTitle>
      <FormError message={error} />
      {message && <p role="status" className="mb-4 text-cream">{message}</p>}

      <div className="grid gap-14 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-serif text-2xl uppercase tracking-[0.12em] text-cream">Salle et commandes</h2>
          <ul className="divide-y divide-caramel/30">
            {FIELDS.map(([key, label, unit]) => (
              <li key={key} className="flex items-center justify-between gap-4 py-3">
                <label htmlFor={key} className="text-sm">{label}</label>
                <span className="flex items-center gap-2 text-sm text-vanilla/60">
                  <input id={key} name={key} type="number" min={0} required defaultValue={data.settings[key]} className={input} />
                  {unit}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-2xl uppercase tracking-[0.12em] text-cream">Horaires d&apos;ouverture</h2>
          <ul className="divide-y divide-caramel/30">
            {data.hours.map((h) => (
              <li key={h.weekday} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="w-24">{DAYS[h.weekday]}</span>
                <label className="flex items-center gap-2 text-vanilla/70">
                  <input type="checkbox" name={`closed-${h.weekday}`} defaultChecked={h.is_closed} className="accent-cream" /> Fermé
                </label>
                <span className="flex items-center gap-2">
                  <input type="time" name={`open-${h.weekday}`} defaultValue={h.open_time.slice(0, 5)} aria-label={`Ouverture ${DAYS[h.weekday]}`} className={`${input} [color-scheme:dark]`} />
                  –
                  <input type="time" name={`close-${h.weekday}`} defaultValue={h.close_time.slice(0, 5)} aria-label={`Fermeture ${DAYS[h.weekday]}`} className={`${input} [color-scheme:dark]`} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </form>

    {/* Formulaire séparé (pas de formulaire dans un formulaire) */}
    <ClosuresManager />
    </>
  );
}
