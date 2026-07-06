import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Instanciación perezosa: evita que el build falle en entornos sin
// STRIPE_SECRET_KEY configurada todavía (antes de conectar Stripe).
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
        apiVersion: "2026-06-24.dahlia",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_stripe as any)[prop];
  },
});

// Rellenar estos IDs cuando se creen los productos/precios en el Dashboard
// de Stripe (Product catalog -> Add product). Un precio recurrente mensual
// por cada plan de pago.
export const STRIPE_PRICE_IDS: Record<"starter" | "pro" | "agency", string> = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "price_XXXXXXXXXXXXX",
  pro: process.env.STRIPE_PRICE_PRO ?? "price_XXXXXXXXXXXXX",
  agency: process.env.STRIPE_PRICE_AGENCY ?? "price_XXXXXXXXXXXXX",
};
