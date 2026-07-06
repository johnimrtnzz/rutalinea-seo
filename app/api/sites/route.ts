import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type Plan } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sites: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const { count } = await supabase
    .from("sites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const plan = (profile?.plan ?? "free") as Plan;
  const limit = PLAN_LIMITS[plan].sites;

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: `Tu plan permite hasta ${limit} sitio(s) conectado(s). Mejora tu plan para añadir más.`,
        code: "SITE_LIMIT_REACHED",
      },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { name, wpUrl, wpUsername, wpAppPassword, language, niche } = body;

  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: user.id,
      name,
      wp_url: wpUrl,
      wp_username: wpUsername,
      wp_app_password: wpAppPassword,
      language: language ?? "es",
      niche,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ site: data });
}
