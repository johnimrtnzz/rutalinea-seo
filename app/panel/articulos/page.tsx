import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Pipeline } from "@/components/panel/pipeline";
import type { Article } from "@/lib/types";

export default async function ArticulosPage() {
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
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Artículos</h1>
      <div className="space-y-3">
        {(articles ?? []).length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-slate)]">
              No hay artículos todavía. Genera el primero desde{" "}
              <Link href="/panel/keywords" className="text-[var(--color-signal)] font-medium">
                Keywords
              </Link>
              .
            </p>
          </Card>
        )}
        {(articles as Article[] | null)?.map((article) => (
          <Link key={article.id} href={`/panel/articulos/${article.id}`}>
            <Card className="flex items-center justify-between hover:border-[var(--color-slate)] transition-colors cursor-pointer">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{article.title}</p>
                <p className="text-xs text-[var(--color-slate-soft)] mt-0.5">
                  {article.word_count} palabras · score {article.seo_score ?? "—"}
                </p>
              </div>
              <Pipeline status={article.status} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
