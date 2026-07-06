import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { analyzeContent } from "@/lib/seo/optimize";
import { suggestInternalLinks } from "@/lib/seo/internal-linking";
import { ArticleDetailClient } from "./article-detail-client";
import type { Article, InternalLink } from "@/lib/types";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: article } = await supabase
    .from("articles")
    .select("*, sites!inner(user_id)")
    .eq("id", id)
    .single();

  if (!article || (article.sites as { user_id: string }).user_id !== user!.id) {
    notFound();
  }

  const analysis = analyzeContent({
    markdown: article.content_markdown ?? "",
    keyword: article.title,
    metaDescription: article.meta_description ?? "",
    title: article.title,
  });

  let linkSuggestions: Awaited<ReturnType<typeof suggestInternalLinks>> = [];
  if (article.embedding) {
    linkSuggestions = await suggestInternalLinks({
      siteId: article.site_id,
      articleId: article.id,
      embedding: article.embedding,
    });
  }

  const { data: appliedLinks } = await supabase
    .from("internal_links")
    .select("*")
    .eq("source_article_id", article.id)
    .eq("status", "applied");

  return (
    <ArticleDetailClient
      article={article as Article}
      analysis={analysis}
      linkSuggestions={linkSuggestions}
      appliedLinks={(appliedLinks ?? []) as InternalLink[]}
    />
  );
}
