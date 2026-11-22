// Appels à l'API depuis le NAVIGATEUR (Client Components).
// Chemin relatif « /api/v1/… » : le relais de Next.js le transmet au backend (même domaine,
// donc le cookie de session admin est envoyé automatiquement).

import type { Locale } from "./format";

export class ClientApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: string[] = [],
  ) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; locale?: Locale };

export async function apiRequest<T>(path: string, { method = "GET", body, locale = "fr" }: Options = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Réseau coupé ou backend arrêté
    throw new ClientApiError(0, "NETWORK_ERROR", locale === "en" ? "Connection problem. Please try again." : "Problème de connexion. Merci de réessayer.");
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ClientApiError(response.status, data.code ?? "API_ERROR", data.message ?? response.statusText, data.fields ?? []);
  }
  return data as T;
}
