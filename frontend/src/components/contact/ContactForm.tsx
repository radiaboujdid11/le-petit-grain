"use client";
// Formulaire de contact : le message est enregistré en base et lu dans l'admin (décision J).

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";
import { apiRequest, ClientApiError } from "@/lib/client-api";
import type { Locale } from "@/lib/format";

export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale() as Locale;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string[]>([]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError(null);
    setInvalid([]);
    try {
      await apiRequest("/contact", {
        method: "POST",
        locale,
        body: { name: form.get("name"), email: form.get("email"), message: form.get("message") },
      });
      setSent(true);
    } catch (e) {
      const apiError = e as ClientApiError;
      setError(apiError.message);
      setInvalid(apiError.fields);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-5">
        <p className="text-lg text-cream">{t("sent")}</p>
        <Button variant="ghost" onClick={() => setSent(false)}>{t("sendAnother")}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <Field label={t("name")} name="name" required autoComplete="name" invalid={invalid.includes("name")} maxLength={120} />
      <Field label={t("yourEmail")} name="email" type="email" required autoComplete="email" invalid={invalid.includes("email")} />
      <Field label={t("message")} name="message" multiline required invalid={invalid.includes("message")} maxLength={2000} />
      <FormError message={error} />
      <div><Button type="submit" disabled={sending}>{sending ? t("sending") : t("send")}</Button></div>
    </form>
  );
}
