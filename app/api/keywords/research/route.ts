import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestKeywords, fetchSearchVolume } from "@/lib/ai/keyword-research";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { siteId, seedKeyword } = (await req.json()) as {
    siteId: string;
    seedKeyword: string;
  };

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (!site) return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 });

  const suggestions = await suggestKeywords(seedKeyword, site.niche);
  const volumes = await fetchSearchVolume(suggestions.map((s) => s.keyword));

  const merged = suggestions.map((s) => {
    const v = volumes.find((v) => v.keyword === s.keyword);
    return { ...s, ...v };
  });

  // Guardar como sugeridas (evitar duplicados vía unique constraint)
  const rows = merged.map((m) => ({
    site_id: siteId,
    keyword: m.keyword,
    search_volume: m.searchVolume,
    difficulty: m.difficulty,
    cpc: m.cpc,
    intent: m.intent,
    source: "suggested" as const,
  }));

  if (rows.length > 0) {
    await supabase.from("keywords").upsert(rows, { onConflict: "site_id,keyword", ignoreDuplicates: true });
  }

  return NextResponse.json({ suggestions: merged });
}
