"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegistroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Si Supabase tiene confirmación de email activada, no hay sesión todavía.
    if (!data.session) {
      setSent(true);
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl mb-3">Revisa tu correo</h1>
          <p className="text-sm text-[var(--color-slate)]">
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Confírmalo para activar tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg block mb-8">
          Rutalinea SEO
        </Link>
        <h1 className="font-display text-2xl mb-1">Crear cuenta</h1>
        <p className="text-sm text-[var(--color-slate)] mb-6">
          Empieza gratis, sin tarjeta de crédito.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
          </Button>
        </form>

        <p className="text-sm text-[var(--color-slate)] mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[var(--color-signal)] font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
