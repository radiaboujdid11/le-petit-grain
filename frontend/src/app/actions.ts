"use server";
// Server Actions : fonctions exécutées sur le serveur Next.js, appelables depuis l'admin.
// Après une modification du menu ou des horaires, elles vident le cache des pages publiques
// (updateTag) pour que les visiteurs voient le changement immédiatement.
//
// Sécurité : une Server Action est un point d'entrée public. On vérifie donc d'abord,
// auprès du backend, que la requête vient bien d'un admin connecté.

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { apiBaseUrl } from "@/lib/api";

async function isAdmin(): Promise<boolean> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiBaseUrl()}/api/v1/admin/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  return response.ok;
}

export async function refreshMenu(): Promise<void> {
  if (await isAdmin()) updateTag("menu");
}

export async function refreshShopInfo(): Promise<void> {
  if (await isAdmin()) updateTag("shop");
}
