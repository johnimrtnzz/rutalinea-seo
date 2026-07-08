import { NextRequest, NextResponse } from "next/server";
import { getPaddleClient, PADDLE_PRICE_IDS } from "@/lib/paddle/client";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type Plan } from "@/lib/types";
import { EventName } from "@paddle/paddle-node-sdk";

export const runtime = "nodejs";

function planFromPriceId(priceId: string | undefined): Plan {
  if (!priceId) return "free";
  const entry = Object.entries(PADDLE_PRICE_IDS).find(([, id]) => id === priceId);
  return (entry?.[0] as Plan) ?? "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Falta firma o secreto de webhook" }, { status: 400 });
  }

  const paddle = getPaddleClient();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(body, process.env.PADDLE_WEBHOOK_SECRET, signature);
  } catch (e) {
    console.error("Firma de webhook de Paddle inválida:", e);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ received: true });

  const supabase = createServiceClient();

  switch (event.eventType) {
    case EventName.TransactionCompleted: {
      const tx = event.data;
      const userId = tx.customData?.supabase_user_id as string | undefined;
      const plan = (tx.customData?.plan as Plan) ?? "starter";
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            plan,
            plan_status: "active",
            paddle_customer_id: tx.customerId ?? null,
            paddle_subscription_id: tx.subscriptionId ?? null,
            articles_limit: PLAN_LIMITS[plan].articles,
            articles_used_this_period: 0,
            period_start: new Date().toISOString().slice(0, 10),
          })
          .eq("id", userId);
      }
      break;
    }

    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      const priceId = sub.items?.[0]?.price?.id;
      const plan = planFromPriceId(priceId);
      const status =
        sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "inactive";
      await supabase
        .from("profiles")
        .update({ plan, plan_status: status, articles_limit: PLAN_LIMITS[plan].articles })
        .eq("paddle_customer_id", sub.customerId);
      break;
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data;
      await supabase
        .from("profiles")
        .update({ plan: "free", plan_status: "canceled", articles_limit: PLAN_LIMITS.free.articles })
        .eq("paddle_customer_id", sub.customerId);
      break;
    }

    case EventName.TransactionPaid: {
      const tx = event.data;
      if (tx.origin === "subscription_recurring") {
        await supabase
          .from("profiles")
          .update({ articles_used_this_period: 0, period_start: new Date().toISOString().slice(0, 10) })
          .eq("paddle_customer_id", tx.customerId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
