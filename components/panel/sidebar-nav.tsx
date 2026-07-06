"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const ITEMS = [
  { href: "/panel", label: "Resumen" },
  { href: "/panel/sitios", label: "Sitios" },
  { href: "/panel/keywords", label: "Keywords" },
  { href: "/panel/articulos", label: "Artículos" },
  { href: "/panel/facturacion", label: "Facturación" },
];

export function SidebarNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--color-line)] h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-[var(--color-line)]">
        <Link href="/panel" className="font-display text-lg">
          Rutalinea SEO
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)] font-medium"
                  : "text-[var(--color-slate)] hover:bg-black/[0.03]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--color-line)]">
        <div className="text-xs text-[var(--color-slate-soft)] mb-1">
          Plan <span className="uppercase font-medium">{profile.plan}</span>
        </div>
        <div className="font-mono-tab text-xs text-[var(--color-slate)] mb-3">
          {profile.articles_used_this_period}/{profile.articles_limit} artículos usados
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[var(--color-slate-soft)] hover:text-[var(--color-ink)]"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
