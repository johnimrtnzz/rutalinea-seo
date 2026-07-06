"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Keyword, Site } from "@/lib/types";

const INTENT_LABELS: Record<string, string> = {
  informational: "Informacional",
  commercial: "Comercial",
  transactional: "Transaccional",
  navigational: "Navegacional",
};

export function KeywordsClient({
  sites,
  initialKeywords,
}: {
  sites: Site[];
  initialKeywords: Keyword[];
}) {
  const router = useRouter();
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function handleResearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/keywords/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, seedKeyword: seed }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Error investigando keywords");
      return;
    }
    router.refresh();
  }

  async function handleGenerate(keyword: Keyword) {
    setGeneratingId(keyword.id);
    const res = await fetch("/api/articles/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: keyword.site_id,
        keywordId: keyword.id,
        keyword: keyword.keyword,
        intent: keyword.intent,
      }),
    });
    const data = await res.json();
    setGeneratingId(null);
    if (!res.ok) {
      alert(data.error ?? "Error generando el artículo");
      return;
    }
    router.push(`/panel/articulos/${data.article.id}`);
  }

  if (sites.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-slate)]">
          Conecta primero un sitio de WordPress para investigar keywords.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Keywords</h1>

      <Card className="mb-6">
        <form onSubmit={handleResearch} className="flex items-end gap-4">
          <div className="w-56">
            <Label htmlFor="site">Sitio</Label>
            <select
              id="site"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="seed">Keyword semilla</Label>
            <Input
              id="seed"
              required
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="calculadora de gasolina"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Buscando…" : "Buscar ideas"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
        {!process.env.NEXT_PUBLIC_HAS_VOLUME_DATA && (
          <p className="text-xs text-[var(--color-slate-soft)] mt-3">
            Las ideas se generan con IA. Conecta un proveedor de datos (DataForSEO) para ver
            volumen de búsqueda real.
          </p>
        )}
      </Card>

      <div className="space-y-2">
        {keywords.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--color-slate)]">
              Todavía no tienes keywords guardadas. Busca ideas arriba.
            </p>
          </Card>
        )}
        {keywords.map((kw) => (
          <Card key={kw.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{kw.keyword}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--color-slate-soft)] mt-1">
                {kw.intent && <span>{INTENT_LABELS[kw.intent] ?? kw.intent}</span>}
                {kw.search_volume != null && <span>{kw.search_volume} búsquedas/mes</span>}
                <span className="capitalize">{kw.status}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={kw.status !== "pending" || generatingId === kw.id}
              onClick={() => handleGenerate(kw)}
            >
              {generatingId === kw.id
                ? "Generando…"
                : kw.status === "pending"
                  ? "Generar artículo"
                  : "Ya procesada"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
