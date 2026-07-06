import { createClient } from "@/lib/supabase/server";
import { SitesClient } from "./sites-client";
import type { Site } from "@/lib/types";

export default async function SitiosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <SitesClient initialSites={(sites ?? []) as Site[]} />;
}
