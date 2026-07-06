import { createClient } from "@/lib/supabase/server";
import { KeywordsClient } from "./keywords-client";
import type { Keyword, Site } from "@/lib/types";

export default async function KeywordsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const siteIds = (sites ?? []).map((s) => s.id);

  const { data: keywords } = siteIds.length
    ? await supabase
        .from("keywords")
        .select("*")
        .in("site_id", siteIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <KeywordsClient
      sites={(sites ?? []) as Site[]}
      initialKeywords={(keywords ?? []) as Keyword[]}
    />
  );
}
