"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_LIMITS, type Profile } from "@/lib/types";

declare global {
  interface Window {
    Paddle?: any;
  }
}

const PADDLE_PRICE_IDS: Record<"starter" | "pro" | "agency", string | undefined> = {
  starter: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER,
  pro: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO,
  agency: process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY,
};

export function BillingClient({ profile, userEmail }: { profile: Profile; userEmail: string }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);

  useEffect(() => {
    if (window.Paddle) {
      setPaddleReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      window.Paddle?.Environment.set(
        process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox"
      );
      window.Paddle?.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
      });
      setPaddleReady(true);
    };
    document.body.appendChild(script);
  }, []);

  function handleUpgrade(plan: "starter" | "pro" | "agency") {
    const priceId = PADDLE_PRICE_IDS[plan];
    if (!paddleReady || !priceId) {
      alert("Paddle todavía no está configurado. Revisa que las variables de entorno estén puestas.");
      return;
    }
    setLoadingPlan(plan);
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: userEmail },
      customData: { supabase_user_id: profile.id, plan },
      settings: {
        successUrl: `${window.location.origin}/panel/facturacion?success=1`,
      },
    });
    setLoadingPlan(null);
  }

  async function handlePortal() {
    setLoadingPortal(true);
    const res = await fetch("/api/paddle/portal", { method: "POST" });
    const data = await res.json();
    setLoadingPortal(false);
    if (data.updateUrl) window.location.href = data.updateUrl;
    else alert(data.error ?? "No se pudo abrir la gestión de la suscripción.");
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Facturación</h1>

      <Card className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-slate-soft)] uppercase tracking-wide">
            Plan actual
          </p>
          <p className="font-display text-2xl mt-1 capitalize">{profile.plan}</p>
          <p className="text-sm text-[var(--color-slate)] mt-1">
            {profile.articles_used_this_period}/{profile.articles_limit} artículos usados este
            periodo · estado: {profile.plan_status}
          </p>
        </div>
        {profile.paddle_subscription_id && (
          <Button variant="secondary" onClick={handlePortal} disabled={loadingPortal}>
            {loadingPortal ? "Abriendo…" : "Gestionar suscripción"}
          </Button>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {(["starter", "pro", "agency"] as const).map((plan) => {
          const p = PLAN_LIMITS[plan];
          const isCurrent = profile.plan === plan;
          return (
            <Card key={plan} className="flex flex-col">
              <span className="font-mono-tab text-xs uppercase tracking-wide text-[var(--color-slate-soft)]">
                {plan}
              </span>
              <div className="font-display text-3xl my-3">
                {p.priceMonthly}€<span className="text-sm text-[var(--color-slate-soft)]"> /mes</span>
              </div>
              <ul className="text-sm text-[var(--color-slate)] space-y-1 mb-6 flex-1">
                <li>{p.articles} artículos/mes</li>
                <li>{p.sites} sitio{p.sites > 1 ? "s" : ""} WordPress</li>
              </ul>
              <Button
                variant={isCurrent ? "secondary" : "primary"}
                disabled={isCurrent || loadingPlan === plan}
                onClick={() => handleUpgrade(plan)}
                className="w-full"
              >
                {isCurrent ? "Plan actual" : loadingPlan === plan ? "Redirigiendo…" : "Elegir plan"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
