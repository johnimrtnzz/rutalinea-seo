import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Pipeline } from "@/components/panel/pipeline";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/types";

export default async function PanelHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sites } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user!.id);

  const siteIds = (sites ?? []).map((s) => s.id);

  const { data: articles } = siteIds.length
    ? await supabase
        .from("articles")
        .select("*")
        .in("site_id", siteIds)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as Article[] };

  const { count: publishedCount } = siteIds.length
    ? await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .in("site_id", siteIds)
        .eq("status", "published")
    : { count: 0 };

  const { count: keywordCount } = siteIds.length
    ? await supabase
        .from("keywords")
        .select("*", { count: "exact", head: true })
        .in("site_id", siteIds)
        .eq("status", "pending")
    : { count: 0 };

  if (!sites || sites.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl mb-2">Empecemos</h1>
        <p className="text-[var(--color-slate)] mb-6">
          Conecta tu primer sitio de WordPress para empezar a generar y publicar contenido.
        </p>
        <Link href="/panel/sitios">
          <Button>Conectar mi primer sitio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Resumen</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <span className="text-xs uppercase tracking-wide text-[var(--color-slate-soft)]">
            Sitios conectados
          </span>
          <div className="font-mono-tab text-3xl mt-2">{sites.length}</div>
        </Card>
        <Card>
          <span className="text-xs uppercase tracking-wide text-[var(--color-slate-soft)]">
            Artículos publicados
          </span>
          <div className="font-mono-tab text-3xl mt-2">{publishedCount ?? 0}</div>
        </Card>
        <Card>
          <span className="text-xs uppercase tracking-wide text-[var(--color-slate-soft)]">
            Keywords pendientes
          </span>
          <div className="font-mono-tab text-3xl mt-2">{keywordCount ?? 0}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Últimos artículos</h2>
        <Link href="/panel/articulos">
          <Button variant="secondary" className="text-sm">Ver todos</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {(articles ?? []).length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-slate)]">
              Todavía no has generado ningún artículo.{" "}
              <Link href="/panel/keywords" className="text-[var(--color-signal)] font-medium">
                Empieza buscando keywords
              </Link>
              .
            </p>
          </Card>
        )}
        {(articles ?? []).map((article: Article) => (
          <Card key={article.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{article.title}</p>
              <p className="text-xs text-[var(--color-slate-soft)] mt-0.5">
                {article.word_count} palabras · score {article.seo_score ?? "—"}
              </p>
            </div>
            <Pipeline status={article.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
