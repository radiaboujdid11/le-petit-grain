"use client";
// Gestion d'une réservation par lien unique (sans compte) : voir, changer de créneau, annuler.

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { DayPicker, type Slot, SlotPicker } from "@/components/ui/SlotPicker";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import { addDays, formatDay, formatTime, type Locale, shopToday } from "@/lib/format";
import { useApi } from "@/lib/use-api";

type Reservation = { reference: string; status: "confirmed" | "cancelled"; start_at: string; party_size: number; customer_name: string };

export function ManageReservationView() {
  const t = useTranslations("Manage");
  const tRes = useTranslations("Reservation");
  const locale = useLocale() as Locale;
  const { token } = useParams<{ token: string }>();
  const path = `/reservations/manage/${encodeURIComponent(token)}`;
  const { data, error, loading, reload } = useApi<Reservation>(path);

  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Créneaux du nouveau jour choisi (seulement en mode modification)
  const slotsQuery = useApi<Slot[]>(
    editing && day && data ? `/reservations/availability?date=${day}&party_size=${data.party_size}` : null,
  );
  const slots = slotsQuery.loading ? null : (slotsQuery.data ?? []);

  async function act(run: () => Promise<unknown>, success: string | null) {
    setActionError(null);
    try {
      await run();
      setMessage(success);
      setEditing(false);
      setConfirmCancel(false);
      reload();
    } catch (e) {
      setActionError((e as ClientApiError).message);
    }
  }

  if (loading && !data) return <p role="status" className="py-16 text-center text-vanilla/80">{t("loading")}</p>;
  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <p>{t("notFound")}</p>
        <Button href="/reservation">{t("newBooking")}</Button>
      </div>
    );
  }

  const cancelled = data.status === "cancelled";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{tRes("reference")}</p>
      <p className="font-serif text-3xl text-cream">{data.reference}</p>

      <dl className="mt-8 grid w-full grid-cols-3 divide-x divide-caramel/40 border-y border-caramel/40 py-5">
        <div className="px-2">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("when")}</dt>
          <dd className="mt-1 text-sm capitalize">{formatDay(data.start_at, locale)}</dd>
          <dd className="font-serif text-2xl text-cream">{formatTime(data.start_at, locale)}</dd>
        </div>
        <div className="px-2">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("party")}</dt>
          <dd className="mt-1 font-serif text-2xl text-cream">{data.party_size}</dd>
        </div>
        <div className="px-2">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-vanilla/70">{t("status")}</dt>
          <dd className="mt-1 font-serif text-2xl text-cream">{cancelled ? t("cancelled") : t("confirmed")}</dd>
        </div>
      </dl>

      {message && <p role="status" className="mt-6 text-cream">{message}</p>}
      <div className="mt-4 w-full"><FormError message={actionError} /></div>

      {cancelled ? (
        <div className="mt-8 flex flex-col items-center gap-5">
          <p className="text-vanilla/85">{t("cancelledText")}</p>
          <Button href="/reservation">{t("newBooking")}</Button>
        </div>
      ) : editing ? (
        <div className="mt-10 flex w-full flex-col gap-8 text-left">
          <DayPicker days={Array.from({ length: 31 }, (_, i) => addDays(shopToday(), i))} value={day} onChange={(d) => { setDay(d); setSlot(null); }} label={tRes("date")} />
          <SlotPicker slots={day ? slots : []} value={slot} onChange={setSlot} label={tRes("slots")}
            loadingText={tRes("loading")} emptyText={tRes("noSlots")} fullText={tRes("full")} />
          <div className="flex flex-wrap justify-center gap-3">
            <Button disabled={!slot} onClick={() => act(() => apiRequest(path, { method: "PATCH", locale, body: { start_at: slot, party_size: data.party_size } }), t("saved"))}>
              {t("save")}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>{t("keep")}</Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => { setDay(shopToday()); setEditing(true); }}>{t("change")}</Button>
          {confirmCancel ? (
            <>
              <Button onClick={() => act(() => apiRequest(`${path}/cancel`, { method: "POST", locale }), null)}>{t("confirmCancel")}</Button>
              <Button variant="ghost" onClick={() => setConfirmCancel(false)}>{t("keep")}</Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmCancel(true)}>{t("cancel")}</Button>
          )}
        </div>
      )}
    </div>
  );
}
