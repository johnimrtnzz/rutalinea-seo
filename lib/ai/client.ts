import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

// Instanciación perezosa: evita que el build falle en entornos sin
// ANTHROPIC_API_KEY configurada todavía (p. ej. antes del primer deploy).
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    if (!_client) {
      _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_client as any)[prop];
  },
});

export const ARTICLE_MODEL = "claude-sonnet-4-6";
export const FAST_MODEL = "claude-haiku-4-5-20251001";
