import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/panel/sidebar-nav";
import type { Profile } from "@/lib/types";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <SidebarNav profile={profile as Profile} />
      <main className="flex-1 px-8 py-8 max-w-5xl">{children}</main>
    </div>
  );
}
