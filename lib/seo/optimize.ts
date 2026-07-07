export interface SeoCheck {
  label: string;
  passed: boolean;
  weight: number;
  hint: string;
}

export interface SeoAnalysis {
  score: number; // 0-100
  checks: SeoCheck[];
}

/**
 * Analiza un artículo en Markdown/HTML contra reglas SEO on-page clásicas.
 * No sustituye a un análisis de SERP real, pero cubre lo accionable
 * directamente desde el propio contenido.
 */
export function analyzeContent(params: {
  markdown: string;
  keyword: string;
  metaDescription: string;
  title: string;
}): SeoAnalysis {
  const { markdown, keyword, metaDescription, title } = params;
  const lowerContent = markdown.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const wordCount = markdown.trim().split(/\s+/).length;

  const firstParagraph = markdown
    .split("\n")
    .find((line) => line.trim().length > 0 && !line.startsWith("#")) ?? "";

  const h2Count = (markdown.match(/^##\s/gm) ?? []).length;
  const h3Count = (markdown.match(/^###\s/gm) ?? []).length;
  const hasList = /^(-|\*|\d+\.)\s/m.test(markdown);
  const hasTable = /\|.+\|.+\|/.test(markdown);
  const hasFaq = /preguntas frecuentes/i.test(markdown);

  const checks: SeoCheck[] = [
    {
      label: "Keyword en el título",
      passed: title.toLowerCase().includes(lowerKeyword),
      weight: 15,
      hint: "Incluye la keyword principal en el H1/título.",
    },
    {
      label: "Keyword en el primer párrafo",
      passed: firstParagraph.toLowerCase().includes(lowerKeyword),
      weight: 15,
      hint: "Menciona la keyword principal en las primeras 100 palabras.",
    },
    {
      label: "Keyword en la meta descripción",
      passed: metaDescription.toLowerCase().includes(lowerKeyword),
      weight: 10,
      hint: "Añade la keyword a la meta descripción.",
    },
    {
      label: "Meta descripción con longitud correcta",
      passed: metaDescription.length >= 120 && metaDescription.length <= 158,
      weight: 5,
      hint: "La meta descripción ideal tiene entre 120 y 158 caracteres.",
    },
    {
      label: "Al menos 4 subtítulos H2",
      passed: h2Count >= 4,
      weight: 15,
      hint: `Tienes ${h2Count} H2. Añade más secciones para cubrir el tema en profundidad.`,
    },
    {
      label: "Incluye lista o tabla",
      passed: hasList || hasTable,
      weight: 10,
      hint: "Añade una lista o tabla: mejora la escaneabilidad y las posibilidades de featured snippet.",
    },
    {
      label: "Incluye sección de FAQ",
      passed: hasFaq && h3Count >= 3,
      weight: 15,
      hint: "Añade una sección de preguntas frecuentes con al menos 3-4 preguntas en H3.",
    },
    {
      label: "Longitud mínima competitiva",
      passed: wordCount >= 1600,
      weight: 15,
      hint: `El artículo tiene ${wordCount} palabras. Para competir, apunta a 2000+.`,
    },
  ];

  const score = Math.round(
    checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0)
  );

  return { score, checks };
}
