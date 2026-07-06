import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import Stripe from "stripe";

// Stripe necesita el body en crudo para verificar la firma.
export const runtime = "nodejs";

function planFromPriceId(priceId: string): Plan {
  const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
  return (entry?.[0] as Plan) ?? "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Falta firma o secreto de webhook" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("Firma de webhook inválida:", e);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = (session.metadata?.plan ?? "starter") as Plan;
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            plan,
            plan_status: "active",
            stripe_subscription_id: session.subscription as string,
            articles_limit: PLAN_LIMITS[plan].articles,
            articles_used_this_period: 0,
            period_start: new Date().toISOString().slice(0, 10),
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = planFromPriceId(priceId);
      const status = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "inactive";

      await supabase
        .from("profiles")
        .update({
          plan,
          plan_status: status,
          articles_limit: PLAN_LIMITS[plan].articles,
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("profiles")
        .update({ plan: "free", plan_status: "canceled", articles_limit: PLAN_LIMITS.free.articles })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    // Reinicia el contador de artículos usados al empezar cada periodo de facturación.
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === "subscription_cycle") {
        await supabase
          .from("profiles")
          .update({
            articles_used_this_period: 0,
            period_start: new Date().toISOString().slice(0, 10),
          })
          .eq("stripe_customer_id", invoice.customer as string);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
