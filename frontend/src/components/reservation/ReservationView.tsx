"use client";
// Réservation de table : date, nombre de personnes, heure d'arrivée, coordonnées.
// La capacité est vérifiée par le backend (sous verrou : aucune surréservation possible).

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";
import { DayPicker, type Slot, SlotPicker } from "@/components/ui/SlotPicker";
import { shop } from "@/data/shop";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { addDays, formatDay, formatTime, type Locale, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useHydrated } from "@/lib/use-hydrated";

type ShopInfo = { max_party_size: number; reservation_days_ahead: number };
type Created = { reference: string; start_at: string; party_size: number; manage_token: string };

export function ReservationView() {
  const t = useTranslations("Reservation");
  const locale = useLocale() as Locale;
  const { data: info } = useApi<ShopInfo>("/shop/info");
  const maxParty = info?.max_party_size ?? 8;

  const mounted = useHydrated(); // dates calculées dans le navigateur uniquement
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const day = chosenDay ?? (mounted ? shopToday() : null);
  const [party, setParty] = useState(2);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  // Créneaux disponibles pour ce jour et ce nombre de personnes (null pendant le chargement)
  const slotsQuery = useApi<Slot[]>(day ? `/reservations/availability?date=${day}&party_size=${party}` : null);
  const slots = slotsQuery.loading ? null : (slotsQuery.data ?? []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slot) return setError(t("chooseTime"));
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setInvalid([]);
    try {
      setCreated(
        await apiRequest<Created>("/reservations", {
          method: "POST",
          locale,
          body: {
            start_at: slot,
            party_size: party,
            customer_name: form.get("name"),
            customer_phone: form.get("phone"),
            customer_email: form.get("email"),
            notes: form.get("notes") ?? "",
          },
        }),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const apiError = e as ClientApiError;
      setError(apiError.message);
      setInvalid(apiError.fields ?? []);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return <p role="status" className="py-16 text-center text-vanilla/80">{t("loading")}</p>;

  // ---------- Confirmation
  if (created) {
    const manageUrl = `${window.location.origin}/${locale}/reservation/manage/${created.manage_token}`;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center text-center" role="status">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-caramel">
          <Check className="h-7 w-7 text-cream" strokeWidth={1.5} />
        </span>
        <h2 className="mt-6 font-serif text-4xl">{t("doneTitle")}</h2>
        <p className="mt-4 text-lg text-vanilla/85">
          {t("doneText", {
            date: formatDay(created.start_at, locale),
            time: formatTime(created.start_at, locale),
            people: t("people", { count: created.party_size }),
          })}
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("reference")}</p>
        <p className="font-serif text-3xl text-cream">{created.reference}</p>

        <div className="mt-10 w-full border-t border-caramel/40 pt-8">
          <h3 className="font-serif text-2xl uppercase tracking-[0.12em] text-cream">{t("manageTitle")}</h3>
          <p className="mt-3 text-sm text-vanilla/80">{t("manageText")}</p>
          <p className="mt-4 break-all text-xs text-vanilla/70">{manageUrl}</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(manageUrl).then(() => setCopied(true)).catch(() => {});
              }}
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              {copied ? t("copied") : t("copy")}
            </Button>
            <Button href={`/reservation/manage/${created.manage_token}`} variant="ghost">{t("openManage")} →</Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Formulaire
  // Jours réservables : aujourd'hui + N jours (réglage de l'admin), 31 au maximum à l'écran
  const days = Array.from({ length: Math.min((info?.reservation_days_ahead ?? 30) + 1, 31) }, (_, i) => addDays(shopToday(), i));

  return (
    <form onSubmit={submit} noValidate className="mx-auto flex max-w-2xl flex-col gap-10">
      <DayPicker days={days} value={day ?? ""} onChange={(d) => { setChosenDay(d); setSlot(null); }} label={t("date")} />

      <fieldset>
        <legend className="mb-3 text-[11px] uppercase tracking-[0.2em] text-vanilla/80">{t("party")}</legend>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n === party}
              aria-label={t("people", { count: n })}
              onClick={() => { setParty(n); setSlot(null); }}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition-colors ${
                n === party ? "border-cream bg-cream text-cocoa" : "border-caramel hover:border-cream"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-vanilla/60">{t("bigGroup", { max: maxParty, phone: shop.phone })}</p>
      </fieldset>

      <SlotPicker slots={slots} value={slot} onChange={setSlot} label={t("slots")}
        loadingText={t("loading")} emptyText={t("noSlots")} fullText={t("full")} />

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-2 font-serif text-2xl uppercase tracking-[0.12em] text-cream">{t("details")}</legend>
        <Field label={t("name")} name="name" required autoComplete="name" invalid={invalid.includes("customer_name")} maxLength={120} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("phone")} name="phone" type="tel" required autoComplete="tel" invalid={invalid.includes("customer_phone")} />
          <Field label={t("email")} name="email" type="email" required autoComplete="email" invalid={invalid.includes("customer_email")} />
        </div>
        <Field label={t("notes")} name="notes" multiline maxLength={500} />
      </fieldset>

      <FormError message={error} />
      <div className="flex justify-center">
        <Button type="submit" size="lg" disabled={submitting}>{submitting ? t("submitting") : t("submit")}</Button>
      </div>
    </form>
  );
}
