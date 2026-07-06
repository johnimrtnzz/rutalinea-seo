import { anthropic, ARTICLE_MODEL } from "./client";

export interface GenerateArticleInput {
  keyword: string;
  intent?: string | null;
  niche?: string | null;
  language?: string;
  targetWordCount?: number;
  relatedKeywords?: string[];
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  metaDescription: string;
  contentMarkdown: string;
  wordCount: number;
}

function buildSystemPrompt(input: GenerateArticleInput): string {
  return `Eres un redactor SEO senior especializado en contenido en español para ${
    input.niche ? `el nicho de "${input.niche}"` : "webs de utilidades y calculadoras online"
  }.

Reglas estrictas:
- Escribe SIEMPRE en español de España, tono claro y directo, frases cortas.
- Estructura obligatoria: H1 (título), introducción de 2-3 frases con la keyword principal en las primeras 100 palabras, mínimo 4 secciones H2, al menos una sección con lista o tabla, y una sección final de "Preguntas frecuentes" con 4-6 preguntas en H3.
- Optimiza para intención de búsqueda "${input.intent ?? "informational"}".
- Incluye la keyword principal de forma natural en el H1, en el primer párrafo, en al menos un H2, y en la meta descripción.
- Usa las keywords relacionadas de forma natural donde encajen: ${
    input.relatedKeywords?.join(", ") || "ninguna proporcionada"
  }.
- NUNCA inventes cifras, estudios o estadísticas falsas. Si mencionas un dato numérico, indica que es orientativo.
- No uses relleno ni frases vacías tipo "en la era digital actual".
- Longitud objetivo: ${input.targetWordCount ?? 1200} palabras.
- Devuelve el resultado ÚNICAMENTE como un objeto JSON válido, sin texto adicional, sin backticks, con esta forma exacta:
{
  "title": "string",
  "slug": "string-en-minusculas-con-guiones",
  "metaDescription": "string de máximo 155 caracteres",
  "contentMarkdown": "string con el artículo completo en formato Markdown, empezando por el H1"
}`;
}

export async function generateArticle(
  input: GenerateArticleInput
): Promise<{ article: GeneratedArticle; costUsd: number }> {
  const system = buildSystemPrompt(input);

  const message = await anthropic.messages.create({
    model: ARTICLE_MODEL,
    max_tokens: 8000,
    system,
    messages: [
      {
        role: "user",
        content: `Escribe el artículo para la keyword principal: "${input.keyword}"`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La API no devolvió contenido de texto");
  }

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();

  let parsed: GeneratedArticle;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudo parsear la respuesta del modelo como JSON");
  }

  const wordCount = parsed.contentMarkdown.trim().split(/\s+/).length;

  // Coste aproximado en USD (Sonnet: ~$3/M input, ~$15/M output tokens)
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const costUsd = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;

  return { article: { ...parsed, wordCount }, costUsd };
}
