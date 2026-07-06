"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, ScoreBadge } from "@/components/ui/card";
import { Pipeline } from "@/components/panel/pipeline";
import type { Article, InternalLink } from "@/lib/types";
import type { SeoAnalysis } from "@/lib/seo/optimize";

interface LinkSuggestion {
  targetArticleId: string;
  targetTitle: string;
  similarity: number;
  suggestedAnchor: string;
}

export function ArticleDetailClient({
  article,
  analysis,
  linkSuggestions,
  appliedLinks,
}: {
  article: Article;
  analysis: SeoAnalysis;
  linkSuggestions: LinkSuggestion[];
  appliedLinks: InternalLink[];
}) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [applyingLink, setApplyingLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    const res = await fetch("/api/articles/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: article.id }),
    });
    const data = await res.json();
    setPublishing(false);
    if (!res.ok) {
      setError(data.error ?? "Error publicando el artículo");
      return;
    }
    router.refresh();
  }

  async function handleApplyLink(suggestion: LinkSuggestion) {
    setApplyingLink(suggestion.targetArticleId);
    const res = await fetch(`/api/articles/${article.id}/internal-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetArticleId: suggestion.targetArticleId,
        anchorText: suggestion.suggestedAnchor,
      }),
    });
    const data = await res.json();
    setApplyingLink(null);
    if (!res.ok) {
      alert(data.error ?? "No se pudo aplicar el enlace");
      return;
    }
    router.refresh();
  }

  const alreadyLinkedIds = new Set(appliedLinks.map((l) => l.target_article_id));

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-display text-2xl leading-tight max-w-lg">{article.title}</h1>
        <ScoreBadge score={article.seo_score ?? 0} />
      </div>

      <div className="mb-6">
        <Pipeline status={article.status} />
      </div>

      {article.status !== "published" && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Listo para publicar</p>
              <p className="text-xs text-[var(--color-slate-soft)] mt-0.5">
                Se publicará directamente en tu WordPress conectado.
              </p>
            </div>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publicando…" : "Publicar en WordPress"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
        </Card>
      )}

      {article.status === "published" && article.wp_post_url && (
        <Card className="mb-6 bg-[var(--color-signal-soft)] border-[var(--color-signal)]">
          <p className="text-sm">
            Publicado ·{" "}
            <a
              href={article.wp_post_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-signal)] underline"
            >
              Ver en el sitio
            </a>
          </p>
        </Card>
      )}

      {/* Checklist SEO */}
      <Card className="mb-6">
        <h2 className="font-display text-lg mb-3">Optimización on-page</h2>
        <ul className="space-y-2">
          {analysis.checks.map((check) => (
            <li key={check.label} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  check.passed ? "bg-[var(--color-signal)]" : "bg-red-400"
                }`}
              />
              <div>
                <span className={check.passed ? "text-[var(--color-slate)]" : "text-[var(--color-ink)]"}>
                  {check.label}
                </span>
                {!check.passed && (
                  <p className="text-xs text-[var(--color-slate-soft)]">{check.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Enlazado interno */}
      {linkSuggestions.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-display text-lg mb-3">Enlazado interno sugerido</h2>
          <ul className="space-y-2">
            {linkSuggestions.map((s) => (
              <li key={s.targetArticleId} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{s.targetTitle}</span>
                  <span className="text-xs text-[var(--color-slate-soft)] ml-2">
                    {Math.round(s.similarity * 100)}% similitud
                  </span>
                </div>
                <Button
                  variant="secondary"
                  className="text-xs py-1"
                  disabled={alreadyLinkedIds.has(s.targetArticleId) || applyingLink === s.targetArticleId}
                  onClick={() => handleApplyLink(s)}
                >
                  {alreadyLinkedIds.has(s.targetArticleId)
                    ? "Enlazado ✓"
                    : applyingLink === s.targetArticleId
                      ? "Aplicando…"
                      : "Aplicar enlace"}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Contenido */}
      <Card>
        <h2 className="font-display text-lg mb-3">Contenido</h2>
        <div
          className="prose prose-sm max-w-none prose-headings:font-display"
          dangerouslySetInnerHTML={{ __html: article.content_html ?? "" }}
        />
      </Card>
    </div>
  );
}
