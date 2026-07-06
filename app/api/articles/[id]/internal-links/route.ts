import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestInternalLinks } from "@/lib/seo/internal-linking";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: article } = await supabase
    .from("articles")
    .select("*, sites!inner(user_id)")
    .eq("id", id)
    .single();

  if (!article || (article.sites as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (!article.embedding) {
    return NextResponse.json({
      suggestions: [],
      warning: "Este artículo no tiene embedding generado todavía.",
    });
  }

  const suggestions = await suggestInternalLinks({
    siteId: article.site_id,
    articleId: article.id,
    embedding: article.embedding,
  });

  return NextResponse.json({ suggestions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Aplica un enlace sugerido: inserta un <a> en el HTML del artículo origen.
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { targetArticleId, anchorText } = (await req.json()) as {
    targetArticleId: string;
    anchorText: string;
  };

  const { data: sourceArticle } = await supabase
    .from("articles")
    .select("*, sites!inner(user_id)")
    .eq("id", id)
    .single();

  if (!sourceArticle || (sourceArticle.sites as { user_id: string }).user_id !== user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: targetArticle } = await supabase
    .from("articles")
    .select("wp_post_url, title")
    .eq("id", targetArticleId)
    .single();

  if (!targetArticle?.wp_post_url) {
    return NextResponse.json(
      { error: "El artículo destino aún no está publicado, no se puede enlazar todavía." },
      { status: 400 }
    );
  }

  // Inserta el enlace en la primera aparición del texto ancla dentro del HTML.
  const linkHtml = `<a href="${targetArticle.wp_post_url}">${anchorText}</a>`;
  const updatedHtml = sourceArticle.content_html.replace(anchorText, linkHtml);

  await supabase.from("articles").update({ content_html: updatedHtml }).eq("id", id);

  await supabase
    .from("internal_links")
    .upsert(
      {
        source_article_id: id,
        target_article_id: targetArticleId,
        anchor_text: anchorText,
        status: "applied",
      },
      { onConflict: "source_article_id,target_article_id" }
    );

  return NextResponse.json({ ok: true, updatedHtml });
}
