# Rutalinea SEO — Copiloto SEO en español

MVP completo: investigación de keywords, generación de artículos con IA,
optimización SEO on-page, enlazado interno automático, seguimiento de
posiciones y publicación directa en WordPress. Listo para desplegar en
Vercel + Supabase. Stripe está integrado en el código pero desactivado
hasta que rellenes las claves (ver más abajo).

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com → **New project**.
2. Cuando esté creado, entra en **SQL Editor** y ejecuta, en este orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_match_articles.sql`
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → será `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la expongas en el navegador!)
4. Ve a **Authentication → Providers** y confirma que **Email** está activado.
   Si no quieres que los usuarios confirmen su email antes de entrar, desactiva
   "Confirm email" en Authentication → Settings (útil para probar rápido).

## 2. Claves de IA

- **Anthropic** (generación de artículos): crea una clave en
  https://console.anthropic.com → `ANTHROPIC_API_KEY`.
- **Embeddings** (enlazado interno): necesitas una clave de OpenAI
  (`text-embedding-3-small`) o Voyage AI. Ponla en `EMBEDDING_API_KEY` y
  ajusta `EMBEDDING_PROVIDER` a `openai` o `voyage`.

Sin estas dos claves, la generación de artículos y el enlazado interno no
funcionarán, pero el resto de la app sí carga y compila.

## 3. Datos opcionales (puedes activarlos más adelante)

- **Volumen de búsqueda real**: contrata https://dataforseo.com y añade
  `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD`. Sin esto, la investigación de
  keywords sigue funcionando con sugerencias de IA, pero sin cifras de
  volumen/dificultad reales.
- **Seguimiento de posiciones**: contrata https://serpapi.com y añade
  `SERPAPI_KEY`. Sin esto, el botón de comprobar posiciones dará error.

## 4. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a https://vercel.com → **Add New → Project** → importa el repo.
3. En **Environment Variables**, añade todas las variables de `.env.example`
   con sus valores reales (menos las de Stripe, que puedes dejar vacías por
   ahora).
4. Despliega. Cuando tengas la URL final (ej. `https://rutalinea.vercel.app`),
   ponla en `NEXT_PUBLIC_APP_URL` y vuelve a desplegar.

## 5. Activar Stripe (cuando estés listo)

El código ya tiene toda la lógica de suscripciones, límites por plan, checkout
y webhook. Para activarlo:

1. Crea una cuenta en https://dashboard.stripe.com.
2. Ve a **Product catalog** y crea 3 productos con precio recurrente mensual:
   - Starter — 29€/mes
   - Pro — 79€/mes
   - Agency — 199€/mes
3. Copia el `price_...` de cada uno y ponlos en `STRIPE_PRICE_STARTER`,
   `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`.
4. En **Developers → API keys**, copia la clave secreta → `STRIPE_SECRET_KEY`.
5. En **Developers → Webhooks**, añade un endpoint apuntando a:
   `https://tu-dominio.com/api/stripe/webhook`
   con estos eventos: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.paid`. Copia el "Signing secret" → `STRIPE_WEBHOOK_SECRET`.
6. Redespliega. La página **Facturación** del panel ya funcionará de extremo
   a extremo.

Mientras estas claves estén vacías, los botones de "Elegir plan" mostrarán un
error controlado en vez de romper la app.

## 6. Cómo funciona el pipeline (para orientarte en el código)

```
lib/ai/keyword-research.ts   → sugerencias de keywords + volumen (opcional)
lib/ai/generate-article.ts   → genera el artículo completo con Claude
lib/seo/optimize.ts          → calcula el score SEO on-page
lib/seo/internal-linking.ts  → embeddings + búsqueda de similitud (pgvector)
lib/seo/rank-tracking.ts     → consulta de posiciones (SerpApi)
lib/wordpress/client.ts      → publicación vía REST API de WordPress
lib/stripe/client.ts         → suscripciones (listo, desactivado por defecto)
```

Cada pieza está aislada en su propio archivo para poder cambiar de proveedor
(por ejemplo, pasar de SerpApi a otro proveedor de rank tracking) sin tocar el
resto de la aplicación.

## 7. Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellena las claves
npm run dev
```

## 8. Límite conocido de este MVP

La generación de artículos se ejecuta de forma síncrona dentro de la propia
API route (puede tardar 20-40 segundos). Para volúmenes altos de uso,
conviene mover `POST /api/articles/generate` a una cola de trabajos (la
tabla `jobs` ya está preparada en el esquema SQL para esto) usando, por
ejemplo, Vercel Queues, Inngest o un worker separado en Railway.
