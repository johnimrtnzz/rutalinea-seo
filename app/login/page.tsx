"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message
      );
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg block mb-8">
          Rutalinea SEO
        </Link>
        <h1 className="font-display text-2xl mb-1">Iniciar sesión</h1>
        <p className="text-sm text-[var(--color-slate)] mb-6">
          Accede a tu panel de contenidos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-[var(--color-slate)] mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-[var(--color-signal)] font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
