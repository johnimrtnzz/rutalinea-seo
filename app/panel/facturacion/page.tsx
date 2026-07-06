import { createClient } from "@/lib/supabase/server";
import { BillingClient } from "./billing-client";
import type { Profile } from "@/lib/types";

export default async function FacturacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return <BillingClient profile={profile as Profile} />;
}
