import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateArticle } from "@/lib/ai/generate-article";
import { analyzeContent } from "@/lib/seo/optimize";
import { getEmbedding } from "@/lib/seo/internal-linking";
import { marked } from "marked";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Comprobar límite de artículos del plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (profile.articles_used_this_period >= profile.articles_limit) {
    return NextResponse.json(
      {
        error:
          "Has alcanzado el límite de artículos de tu plan este mes. Mejora tu plan para seguir generando contenido.",
        code: "LIMIT_REACHED",
      },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { siteId, keywordId, keyword, intent, relatedKeywords } = body as {
    siteId: string;
    keywordId?: string;
    keyword: string;
    intent?: string;
    relatedKeywords?: string[];
  };

  if (!siteId || !keyword) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: siteId, keyword" },
      { status: 400 }
    );
  }

  // Verificar que el sitio pertenece al usuario
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "Sitio no encontrado" }, { status: 404 });
  }

  try {
    const { article, costUsd } = await generateArticle({
      keyword,
      intent,
      niche: site.niche,
      relatedKeywords,
    });

    const analysis = analyzeContent({
      markdown: article.contentMarkdown,
      keyword,
      metaDescription: article.metaDescription,
      title: article.title,
    });

    const contentHtml = await marked.parse(article.contentMarkdown);

    // Embedding para enlazado interno (best-effort: si falla, no bloquea la generación)
    let embedding: number[] | null = null;
    try {
      embedding = await getEmbedding(`${article.title}\n\n${article.contentMarkdown}`);
    } catch (e) {
      console.error("No se pudo generar el embedding:", e);
    }

    const { data: savedArticle, error: insertError } = await supabase
      .from("articles")
      .insert({
        site_id: siteId,
        keyword_id: keywordId ?? null,
        title: article.title,
        slug: article.slug,
        content_html: contentHtml,
        content_markdown: article.contentMarkdown,
        meta_description: article.metaDescription,
        seo_score: analysis.score,
        status: "ready",
        word_count: article.wordCount,
        generation_cost_usd: costUsd,
        embedding,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Actualizar contador de uso del plan
    await supabase
      .from("profiles")
      .update({ articles_used_this_period: profile.articles_used_this_period + 1 })
      .eq("id", user.id);

    if (keywordId) {
      await supabase.from("keywords").update({ status: "written" }).eq("id", keywordId);
    }

    return NextResponse.json({ article: savedArticle, analysis });
  } catch (e) {
    console.error("Error generando artículo:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido generando el artículo" },
      { status: 500 }
    );
  }
}
