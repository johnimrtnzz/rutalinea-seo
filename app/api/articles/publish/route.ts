import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishToWordPress } from "@/lib/wordpress/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { articleId, status } = (await req.json()) as {
    articleId: string;
    status?: "publish" | "draft";
  };

  const { data: article } = await supabase
    .from("articles")
    .select("*, sites(*)")
    .eq("id", articleId)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
  }

  const site = article.sites as {
    id: string;
    user_id: string;
    wp_url: string;
    wp_username: string;
    wp_app_password: string;
    default_category_id: number | null;
  };

  if (site.user_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await supabase.from("articles").update({ status: "publishing" }).eq("id", articleId);

    const result = await publishToWordPress(
      {
        wpUrl: site.wp_url,
        username: site.wp_username,
        appPassword: site.wp_app_password,
      },
      {
        title: article.title,
        contentHtml: article.content_html,
        slug: article.slug,
        status: status ?? "publish",
        categoryId: site.default_category_id ?? undefined,
        metaDescription: article.meta_description,
      }
    );

    const { data: updated } = await supabase
      .from("articles")
      .update({
        status: "published",
        wp_post_id: result.id,
        wp_post_url: result.link,
        published_at: new Date().toISOString(),
      })
      .eq("id", articleId)
      .select()
      .single();

    if (article.keyword_id) {
      await supabase
        .from("keywords")
        .update({ status: "published" })
        .eq("id", article.keyword_id);
    }

    return NextResponse.json({ article: updated });
  } catch (e) {
    await supabase.from("articles").update({ status: "failed" }).eq("id", articleId);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error publicando en WordPress" },
      { status: 500 }
    );
  }
}
