import { createServiceClient } from "@/lib/supabase/server";

/**
 * Genera un embedding de texto usando la API de OpenAI (text-embedding-3-small)
 * o Voyage AI. Se aísla aquí porque Anthropic no ofrece endpoint de embeddings
 * propio; cualquiera de estos dos proveedores funciona bien y es barato.
 *
 * Variables de entorno necesarias: EMBEDDING_API_KEY, EMBEDDING_PROVIDER ("openai" | "voyage")
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER ?? "openai";

  if (provider === "voyage") {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: text.slice(0, 8000), model: "voyage-3-lite" }),
    });
    const data = await res.json();
    return data.data[0].embedding;
  }

  // Por defecto: OpenAI
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text.slice(0, 8000),
      model: "text-embedding-3-small",
    }),
  });
  const data = await res.json();
  return data.data[0].embedding;
}

export interface LinkSuggestion {
  targetArticleId: string;
  targetTitle: string;
  similarity: number;
  suggestedAnchor: string;
}

/**
 * Busca los artículos más similares (ya publicados) dentro del mismo sitio
 * usando pgvector, y sugiere enlaces internos.
 */
export async function suggestInternalLinks(params: {
  siteId: string;
  articleId: string;
  embedding: number[];
  maxSuggestions?: number;
}): Promise<LinkSuggestion[]> {
  const supabase = createServiceClient();
  const { siteId, articleId, embedding, maxSuggestions = 5 } = params;

  // Requiere la función RPC `match_articles` (ver supabase/migrations/0002_match_articles.sql)
  const { data, error } = await supabase.rpc("match_articles", {
    query_embedding: embedding,
    match_site_id: siteId,
    exclude_article_id: articleId,
    match_count: maxSuggestions,
  });

  if (error) {
    console.error("Error buscando artículos similares:", error);
    return [];
  }

  return (data ?? []).map(
    (row: { id: string; title: string; similarity: number }) => ({
      targetArticleId: row.id,
      targetTitle: row.title,
      similarity: row.similarity,
      suggestedAnchor: row.title,
    })
  );
}
