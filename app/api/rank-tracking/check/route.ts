import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRankingsBatch } from "@/lib/seo/rank-tracking";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { siteId } = (await req.json()) as { siteId: string };

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (!site) return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 });

  const { data: keywords } = await supabase
    .from("keywords")
    .select("id, keyword")
    .eq("site_id", siteId)
    .eq("status", "published");

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ results: [], message: "No hay keywords publicadas para trackear." });
  }

  const domain = new URL(site.wp_url).hostname.replace(/^www\./, "");

  try {
    const results = await checkRankingsBatch(
      keywords.map((k) => ({ keyword: k.keyword, targetDomain: domain }))
    );

    const rows = results.map((r) => {
      const kw = keywords.find((k) => k.keyword === r.keyword);
      return {
        site_id: siteId,
        keyword_id: kw!.id,
        position: r.position,
      };
    });

    await supabase.from("rank_tracking").insert(rows);

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error consultando posiciones" },
      { status: 500 }
    );
  }
}
