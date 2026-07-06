"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_LIMITS, type Profile } from "@/lib/types";

export function BillingClient({ profile }: { profile: Profile }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleUpgrade(plan: "starter" | "pro" | "agency") {
    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoadingPlan(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "No se pudo iniciar el pago. Revisa que Stripe esté configurado.");
  }

  async function handlePortal() {
    setLoadingPortal(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoadingPortal(false);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "No se pudo abrir el portal de facturación.");
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
        {profile.stripe_customer_id && (
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
                <li>{p.sites} sitios WordPress</li>
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
