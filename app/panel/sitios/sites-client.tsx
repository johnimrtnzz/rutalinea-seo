"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Site } from "@/lib/types";

export function SitesClient({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites);
  const [showForm, setShowForm] = useState(initialSites.length === 0);
  const [form, setForm] = useState({
    name: "",
    wpUrl: "",
    wpUsername: "",
    wpAppPassword: "",
    niche: "",
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; error?: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    const res = await fetch("/api/sites/verify-wp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wpUrl: form.wpUrl,
        username: form.wpUsername,
        appPassword: form.wpAppPassword,
      }),
    });
    const data = await res.json();
    setVerifyResult(data);
    setVerifying(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Error guardando el sitio");
      return;
    }
    setSites((prev) => [data.site, ...prev]);
    setShowForm(false);
    setForm({ name: "", wpUrl: "", wpUsername: "", wpAppPassword: "", niche: "" });
    setVerifyResult(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Sitios</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>Conectar sitio</Button>}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="font-display text-lg mb-4">Conectar WordPress</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del sitio</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Calcularuta"
                />
              </div>
              <div>
                <Label htmlFor="niche">Nicho (opcional)</Label>
                <Input
                  id="niche"
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="viajes y calculadoras"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="wpUrl">URL de WordPress</Label>
              <Input
                id="wpUrl"
                required
                type="url"
                value={form.wpUrl}
                onChange={(e) => setForm({ ...form, wpUrl: e.target.value })}
                placeholder="https://tudominio.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wpUsername">Usuario de WordPress</Label>
                <Input
                  id="wpUsername"
                  required
                  value={form.wpUsername}
                  onChange={(e) => setForm({ ...form, wpUsername: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="wpAppPassword">Contraseña de aplicación</Label>
                <Input
                  id="wpAppPassword"
                  required
                  type="password"
                  value={form.wpAppPassword}
                  onChange={(e) => setForm({ ...form, wpAppPassword: e.target.value })}
                  placeholder="xxxx xxxx xxxx xxxx"
                />
              </div>
            </div>

            <p className="text-xs text-[var(--color-slate-soft)]">
              Genera una contraseña de aplicación en tu WordPress desde Usuarios → Tu perfil →
              Contraseñas de aplicación. No es tu contraseña normal de acceso.
            </p>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleVerify}
                disabled={verifying || !form.wpUrl || !form.wpUsername || !form.wpAppPassword}
              >
                {verifying ? "Comprobando…" : "Comprobar conexión"}
              </Button>
              {verifyResult && (
                <span
                  className={`text-sm ${
                    verifyResult.ok ? "text-[var(--color-signal)]" : "text-red-700"
                  }`}
                >
                  {verifyResult.ok ? "Conexión correcta ✓" : verifyResult.error}
                </span>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar sitio"}
              </Button>
              {sites.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sites.map((site) => (
          <Card key={site.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{site.name}</p>
              <p className="text-sm text-[var(--color-slate-soft)]">{site.wp_url}</p>
            </div>
            {site.niche && (
              <span className="text-xs bg-[var(--color-signal-soft)] text-[var(--color-signal)] px-2 py-1 rounded">
                {site.niche}
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
