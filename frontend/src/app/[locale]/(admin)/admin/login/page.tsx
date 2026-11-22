"use client";
// Connexion admin. Le backend renvoie un cookie de session httpOnly (illisible en JavaScript).

import { useState } from "react";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";
import { useRouter } from "@/i18n/navigation";
import { apiRequest, ClientApiError } from "@/lib/client-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError(null);
    try {
      await apiRequest("/admin/auth/login", {
        method: "POST",
        body: { email: form.get("email"), password: form.get("password") },
      });
      router.replace("/admin");
    } catch (e) {
      setError((e as ClientApiError).message);
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BeanIcon className="h-12 w-12 text-cream" />
          <h1 className="font-serif text-3xl uppercase tracking-[0.1em]">Espace admin</h1>
          <p className="text-sm text-vanilla/70">Le Petit Grain</p>
        </div>
        <Field label="E-mail" name="email" type="email" required autoComplete="username" />
        <Field label="Mot de passe" name="password" type="password" required autoComplete="current-password" />
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={sending}>{sending ? "Connexion…" : "Se connecter"}</Button>
      </form>
    </main>
  );
}
