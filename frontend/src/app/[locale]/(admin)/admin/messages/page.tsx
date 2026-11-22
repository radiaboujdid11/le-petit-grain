"use client";
// Messages reçus par le formulaire de contact.

import { AdminTitle } from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/client-api";
import { formatDay, formatTime } from "@/lib/format";
import { useApi } from "@/lib/use-api";

type Message = { id: number; name: string; email: string; message: string; locale: string; is_read: boolean; created_at: string };

export default function AdminMessagesPage() {
  const { data: messages, reload } = useApi<Message[]>("/admin/messages");

  return (
    <>
      <AdminTitle title="Messages" />
      <ul className="divide-y divide-caramel/30 border-y border-caramel/30">
        {(messages ?? []).map((m) => (
          <li key={m.id} className={`flex flex-col gap-2 py-5 ${m.is_read ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p>
                {!m.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cream" aria-label="Non lu" />}
                <span className="font-medium">{m.name}</span>{" "}
                <a href={`mailto:${m.email}`} className="text-sm text-cream hover:underline">{m.email}</a>
                <span className="ml-2 text-xs uppercase text-vanilla/50">{m.locale}</span>
              </p>
              <span className="text-xs text-vanilla/60">{formatDay(m.created_at, "fr")} · {formatTime(m.created_at, "fr")}</span>
            </div>
            <p className="whitespace-pre-line text-vanilla/85">{m.message}</p>
            {!m.is_read && (
              <button type="button" className="self-start text-xs text-vanilla/60 hover:text-cream"
                onClick={async () => { await apiRequest(`/admin/messages/${m.id}/read`, { method: "POST" }); reload(); }}>
                Marquer comme lu
              </button>
            )}
          </li>
        ))}
        {messages && messages.length === 0 && <li className="py-10 text-center text-vanilla/60">Aucun message.</li>}
      </ul>
    </>
  );
}
