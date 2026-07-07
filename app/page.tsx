import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/types";

const STAGES = [
  { n: "keyword", label: "Keyword", detail: "Detectamos oportunidades con volumen real" },
  { n: "generado", label: "Generado", detail: "Artículo completo en español, listo en minutos" },
  { n: "optimizado", label: "Optimizado", detail: "Score SEO on-page con checklist accionable" },
  { n: "enlazado", label: "Enlazado", detail: "Enlaces internos sugeridos automáticamente" },
  { n: "publicado", label: "Publicado", detail: "Directo a WordPress, sin copiar y pegar" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-lg font-medium">Rutalinea SEO</span>
          <nav className="flex items-center gap-6">
            <Link href="#precios" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)]">
              Precios
            </Link>
            <Link href="/login" className="text-sm text-[var(--color-slate)] hover:text-[var(--color-ink)]">
              Iniciar sesión
            </Link>
            <Link href="/registro">
              <Button className="text-sm">Empezar gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO: el pipeline como tesis del producto */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <span className="font-mono-tab text-xs uppercase tracking-widest text-[var(--color-signal)]">
            Copiloto SEO en español
          </span>
          <h1 className="font-display text-5xl leading-[1.1] mt-4 mb-6">
            De la keyword al artículo publicado, sin tocar cinco herramientas distintas.
          </h1>
          <p className="text-[var(--color-slate)] text-lg mb-8">
            Investigación de palabras clave, redacción con IA, optimización on-page,
            enlazado interno y publicación directa en WordPress. Todo en un solo sitio,
            pensado para quien vive de webs de contenido en español.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/registro">
              <Button className="text-base px-6 py-3">Crear cuenta gratis</Button>
            </Link>
            <span className="text-sm text-[var(--color-slate-soft)]">
              Sin tarjeta · {PLAN_LIMITS.free.articles} artículos incluidos
            </span>
          </div>
        </div>

        {/* Pipeline visual - el elemento firma */}
        <div className="mt-16 border border-[var(--color-line)] rounded-xl bg-white p-8 overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-[900px]">
            {STAGES.map((s, i) => (
              <div key={s.n} className="flex items-stretch flex-1">
                <div className="flex-1 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono-tab text-xs text-[var(--color-signal)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-signal)]" />
                  </div>
                  <h3 className="font-display text-lg mb-1">{s.label}</h3>
                  <p className="text-sm text-[var(--color-slate)]">{s.detail}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-px bg-[var(--color-line)] mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="max-w-6xl mx-auto px-6 py-20 border-t border-[var(--color-line)]">
        <h2 className="font-display text-3xl mb-2">Precios</h2>
        <p className="text-[var(--color-slate)] mb-10">
          Cambia de plan cuando quieras. Todos incluyen las 5 etapas del pipeline.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Object.keys(PLAN_LIMITS) as (keyof typeof PLAN_LIMITS)[]).map((plan) => {
            const p = PLAN_LIMITS[plan];
            return (
              <div
                key={plan}
                className="border border-[var(--color-line)] rounded-lg p-6 bg-white flex flex-col"
              >
                <span className="font-mono-tab text-xs uppercase tracking-wide text-[var(--color-slate-soft)]">
                  {plan}
                </span>
                <div className="font-display text-3xl my-3">
                  {p.priceMonthly === 0 ? "Gratis" : `${p.priceMonthly}€`}
                  {p.priceMonthly > 0 && (
                    <span className="text-sm text-[var(--color-slate-soft)]"> /mes</span>
                  )}
                </div>
                <ul className="text-sm text-[var(--color-slate)] space-y-1.5 mb-6 flex-1">
                  <li>{p.articles} artículos/mes</li>
                  <li>{p.sites} sitio{p.sites > 1 ? "s" : ""} WordPress</li>
                  <li>Enlazado interno automático</li>
                  <li>Seguimiento de posiciones</li>
                </ul>
                <Link href="/registro">
                  <Button variant={plan === "pro" ? "primary" : "secondary"} className="w-full">
                    Elegir {plan}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-[var(--color-line)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--color-slate-soft)]">
          <span>Rutalinea SEO — hecho para publicar en español.</span>
          <div className="flex gap-4 text-xs">
            <Link href="/terminos" className="hover:underline">Términos de servicio</Link>
            <Link href="/privacidad" className="hover:underline">Privacidad</Link>
            <Link href="/reembolsos" className="hover:underline">Reembolsos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
