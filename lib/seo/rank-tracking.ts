export interface RankCheckResult {
  keyword: string;
  position: number | null; // null = no aparece en el top 100
  url: string | null;
}

/**
 * Comprueba la posición actual de una URL para una keyword dada en Google.es
 * usando SerpApi (https://serpapi.com). Aislado en su propia función para
 * poder cambiar de proveedor (ValueSerp, DataForSEO SERP API...) sin tocar
 * el resto de la app.
 *
 * Variables de entorno necesarias: SERPAPI_KEY
 */
export async function checkRanking(params: {
  keyword: string;
  targetDomain: string; // ej. "calcularuta.com"
}): Promise<RankCheckResult> {
  const { keyword, targetDomain } = params;

  if (!process.env.SERPAPI_KEY) {
    throw new Error(
      "SERPAPI_KEY no configurada. Contrata un plan en serpapi.com para activar el rank tracking."
    );
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", keyword);
  url.searchParams.set("google_domain", "google.es");
  url.searchParams.set("gl", "es");
  url.searchParams.set("hl", "es");
  url.searchParams.set("num", "100");
  url.searchParams.set("api_key", process.env.SERPAPI_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Error en SerpApi: ${res.status}`);
  }

  const data = await res.json();
  const organicResults: { link: string; position: number }[] =
    data.organic_results ?? [];

  const match = organicResults.find((r) => r.link.includes(targetDomain));

  return {
    keyword,
    position: match?.position ?? null,
    url: match?.link ?? null,
  };
}

/**
 * Ejecuta el chequeo para varias keywords en paralelo controlado (para no
 * saturar el rate limit del proveedor).
 */
export async function checkRankingsBatch(
  items: { keyword: string; targetDomain: string }[],
  concurrency = 3
): Promise<RankCheckResult[]> {
  const results: RankCheckResult[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((item) => checkRanking(item)));
    results.push(...batchResults);
  }
  return results;
}
