import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let _paddle: Paddle | null = null;

// Instanciación perezosa: evita que el build falle si PADDLE_API_KEY
// todavía no está configurada.
export function getPaddleClient(): Paddle {
  if (!_paddle) {
    _paddle = new Paddle(process.env.PADDLE_API_KEY ?? "paddle_test_placeholder", {
      environment:
        process.env.PADDLE_ENVIRONMENT === "production"
          ? Environment.production
          : Environment.sandbox,
    });
  }
  return _paddle;
}

// IDs de los precios creados en el Dashboard de Paddle (Catalog -> Products).
export const PADDLE_PRICE_IDS: Record<"starter" | "pro" | "agency", string> = {
  starter: process.env.PADDLE_PRICE_STARTER ?? "pri_XXXXXXXXXXXXX",
  pro: process.env.PADDLE_PRICE_PRO ?? "pri_XXXXXXXXXXXXX",
  agency: process.env.PADDLE_PRICE_AGENCY ?? "pri_XXXXXXXXXXXXX",
};
