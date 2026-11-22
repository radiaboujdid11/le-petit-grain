// Mise en page de l'espace admin (/fr/admin/…) : sans le header ni le pied de page du site.
// L'admin est en français uniquement (décision G de l'architecture).
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Administration · Le Petit Grain",
  robots: { index: false, follow: false }, // jamais dans Google
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
