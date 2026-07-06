import { NextRequest, NextResponse } from "next/server";
import { verifyWordPressConnection } from "@/lib/wordpress/client";

export async function POST(req: NextRequest) {
  const { wpUrl, username, appPassword } = (await req.json()) as {
    wpUrl: string;
    username: string;
    appPassword: string;
  };

  if (!wpUrl || !username || !appPassword) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos: URL, usuario o contraseña de aplicación" },
      { status: 400 }
    );
  }

  const result = await verifyWordPressConnection({ wpUrl, username, appPassword });
  return NextResponse.json(result);
}
