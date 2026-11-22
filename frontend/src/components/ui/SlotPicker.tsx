"use client";
// Choix d'un jour puis d'un créneau horaire (retrait de commande ou réservation).
// Jours et créneaux en pastilles rondes/pilules (pas de boîtes).

import { useLocale } from "next-intl";
import { formatShortDay, type Locale } from "@/lib/format";

export type Slot = { start: string; label: string; available: boolean };

const pill = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${
    on ? "border-cream bg-cream text-cocoa" : "border-caramel text-vanilla hover:border-cream"
  }`;

type DayPickerProps = { days: string[]; value: string; onChange: (day: string) => void; label: string };

export function DayPicker({ days, value, onChange, label }: DayPickerProps) {
  const locale = useLocale() as Locale;
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] uppercase tracking-[0.2em] text-vanilla/80">{label}</legend>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map((day) => (
          <button key={day} type="button" aria-pressed={day === value} onClick={() => onChange(day)} className={`${pill(day === value)} shrink-0 capitalize`}>
            {formatShortDay(day, locale)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

type SlotPickerProps = {
  slots: Slot[] | null;
  value: string | null;
  onChange: (start: string) => void;
  label: string;
  loadingText: string;
  emptyText: string;
  fullText: string;
};

export function SlotPicker({ slots, value, onChange, label, loadingText, emptyText, fullText }: SlotPickerProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] uppercase tracking-[0.2em] text-vanilla/80">{label}</legend>
      {slots === null ? (
        <p role="status" className="text-sm text-vanilla/70">{loadingText}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-vanilla/80">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              type="button"
              disabled={!slot.available}
              aria-pressed={slot.start === value}
              aria-label={slot.available ? slot.label : `${slot.label} (${fullText})`}
              onClick={() => onChange(slot.start)}
              className={pill(slot.start === value)}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
