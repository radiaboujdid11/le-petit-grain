"use client";
// Cadre de l'espace admin : navigation, compte connecté, déconnexion.
// Vérifie la session au chargement : sans session valide → page de connexion.
// (La vraie protection est côté backend : sans cookie valide, l'API refuse tout.)

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Coffee, LayoutDashboard, LogOut, Mail, Settings } from "lucide-react";
import { BeanIcon } from "@/components/brand/BeanIcon";
import { Link, useRouter } from "@/i18n/navigation";
import { apiRequest } from "@/lib/client-api";
import { useApi } from "@/lib/use-api";

const NAV = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Commandes", Icon: ClipboardList },
  { href: "/admin/reservations", label: "Réservations", Icon: CalendarDays },
  { href: "/admin/products", label: "Menu", Icon: Coffee },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/settings", label: "Réglages", Icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ex. « /fr/admin/orders »
  const router = useRouter();
  const isLogin = pathname.endsWith("/admin/login");
  const { data: me, error } = useApi<{ email: string }>(isLogin ? null : "/admin/auth/me");

  // Pas (ou plus) connecté : direction la page de connexion
  useEffect(() => {
    if (error?.status === 401) router.replace("/admin/login");
  }, [error, router]);

  if (isLogin) return <>{children}</>;
  if (!me) return <p role="status" className="p-10 text-center text-vanilla/70">Vérification de la session…</p>;

  const current = pathname.replace(/^\/(fr|en)/, "");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-caramel/40 lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 px-5 py-5 text-cream">
          <BeanIcon className="h-6 w-6" />
          <span className="font-serif text-base whitespace-nowrap uppercase tracking-[0.12em]">Le Petit Grain</span>
        </div>
        <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/admin" ? current === "/admin" : current.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors ${
                  active ? "bg-cream text-cocoa" : "text-vanilla/80 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-6 text-xs text-vanilla/60 lg:block">
          <p className="truncate">{me.email}</p>
          <button
            type="button"
            onClick={async () => {
              await apiRequest("/admin/auth/logout", { method: "POST" }).catch(() => {});
              router.replace("/admin/login");
            }}
            className="mt-3 inline-flex items-center gap-2 hover:text-cream"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Se déconnecter
          </button>
          <Link href="/" className="mt-2 block hover:text-cream">← Voir le site</Link>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}

// Titre de page admin
export function AdminTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-caramel/40 pb-4">
      <h1 className="font-serif text-3xl uppercase tracking-[0.1em]">{title}</h1>
      {children}
    </div>
  );
}
