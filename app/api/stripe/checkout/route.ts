import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { plan } = (await req.json()) as { plan: "starter" | "pro" | "agency" };

  if (!STRIPE_PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/facturacion?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel/facturacion?canceled=1`,
    metadata: { supabase_user_id: user.id, plan },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
