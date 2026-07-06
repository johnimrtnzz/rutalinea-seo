import { anthropic, FAST_MODEL } from "./client";

export interface KeywordSuggestion {
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  reason: string;
}

/**
 * Genera ideas de keywords relacionadas usando IA (sin volumen real).
 * Es un punto de partida gratuito; para volúmenes de búsqueda reales
 * hay que conectar una fuente de datos externa (ver fetchSearchVolume).
 */
export async function suggestKeywords(
  seedKeyword: string,
  niche?: string | null,
  count = 15
): Promise<KeywordSuggestion[]> {
  const message = await anthropic.messages.create({
    model: FAST_MODEL,
    max_tokens: 2000,
    system: `Eres un experto en SEO en español. Generas ideas de keywords long-tail relacionadas con una keyword semilla, pensando en volumen de búsqueda real en España/Latinoamérica y baja competencia. Devuelve SOLO un array JSON, sin texto adicional, con este formato:
[{"keyword": "string", "intent": "informational|commercial|transactional|navigational", "reason": "por qué esta keyword tiene potencial, en una frase"}]`,
    messages: [
      {
        role: "user",
        content: `Keyword semilla: "${seedKeyword}". Nicho: ${
          niche ?? "general"
        }. Genera ${count} variaciones long-tail.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export interface SearchVolumeData {
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
}

/**
 * Placeholder para conectar una API de datos reales (DataForSEO, SerpApi,
 * o Google Keyword Planner). Se deja aislado en esta función para que
 * el resto de la app no dependa de qué proveedor se use.
 *
 * Para activarlo:
 * 1. Contrata DataForSEO (https://dataforseo.com) o similar.
 * 2. Añade DATAFORSEO_LOGIN y DATAFORSEO_PASSWORD a las variables de entorno.
 * 3. Sustituye el cuerpo de esta función por la llamada real a su API.
 */
export async function fetchSearchVolume(
  keywords: string[]
): Promise<SearchVolumeData[]> {
  if (!process.env.DATAFORSEO_LOGIN) {
    // Sin proveedor configurado: devolvemos null para que la UI lo indique
    // claramente en vez de inventar cifras.
    return keywords.map((keyword) => ({
      keyword,
      searchVolume: null,
      difficulty: null,
      cpc: null,
    }));
  }

  const auth = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
  ).toString("base64");

  const response = await fetch(
    "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keywords,
          location_name: "Spain",
          language_code: "es",
        },
      ]),
    }
  );

  if (!response.ok) {
    throw new Error(`Error en DataForSEO: ${response.status}`);
  }

  const data = await response.json();
  const results = data?.tasks?.[0]?.result ?? [];

  return results.map((r: { keyword: string; search_volume: number; competition_index: number; cpc: number }) => ({
    keyword: r.keyword,
    searchVolume: r.search_volume ?? null,
    difficulty: r.competition_index ?? null,
    cpc: r.cpc ?? null,
  }));
}
