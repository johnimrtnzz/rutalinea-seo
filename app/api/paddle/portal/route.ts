import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient } from "@/lib/paddle/client";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_subscription_id) {
    return NextResponse.json({ error: "Este usuario no tiene suscripción activa" }, { status: 400 });
  }

  const paddle = getPaddleClient();
  const subscription = await paddle.subscriptions.get(profile.paddle_subscription_id);

  return NextResponse.json({
    updateUrl: subscription.managementUrls?.updatePaymentMethod ?? null,
    cancelUrl: subscription.managementUrls?.cancel ?? null,
  });
}
