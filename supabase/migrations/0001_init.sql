-- =========================================================
-- SEO Copiloto - Esquema inicial
-- =========================================================
create extension if not exists "uuid-ossp";
create extension if not exists vector; -- para embeddings de enlazado interno

-- ---------- PERFILES DE USUARIO ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  plan text not null default 'free', -- free | starter | pro | agency
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_status text default 'inactive', -- inactive | active | past_due | canceled
  articles_used_this_period int not null default 0,
  articles_limit int not null default 3, -- límite mensual según plan
  period_start date not null default date_trunc('month', now()),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "usuarios ven su propio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "usuarios editan su propio perfil" on public.profiles
  for update using (auth.uid() = id);

-- ---------- SITIOS CONECTADOS (WordPress) ----------
create table public.sites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  wp_url text not null,           -- https://midominio.com
  wp_username text not null,      -- usuario de aplicación WP
  wp_app_password text not null,  -- contraseña de aplicación (se guarda cifrada a nivel de app)
  language text not null default 'es',
  niche text, -- ej. "salud", "finanzas", "viajes" - da contexto al generador
  default_category_id int,
  created_at timestamptz not null default now()
);
alter table public.sites enable row level security;
create policy "usuarios gestionan sus propios sitios" on public.sites
  for all using (auth.uid() = user_id);

-- ---------- KEYWORDS (research) ----------
create table public.keywords (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  keyword text not null,
  search_volume int,
  difficulty numeric, -- 0-100
  cpc numeric,
  intent text, -- informational | commercial | transactional | navigational
  status text not null default 'pending', -- pending | queued | written | published | discarded
  source text default 'manual', -- manual | suggested | competitor
  created_at timestamptz not null default now(),
  unique(site_id, keyword)
);
alter table public.keywords enable row level security;
create policy "acceso via propiedad del sitio" on public.keywords
  for all using (
    site_id in (select id from public.sites where user_id = auth.uid())
  );

-- ---------- ARTÍCULOS ----------
create table public.articles (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  keyword_id uuid references public.keywords(id) on delete set null,
  title text not null,
  slug text,
  content_html text,
  content_markdown text,
  meta_description text,
  seo_score int, -- 0-100, calculado por el optimizador
  status text not null default 'draft', -- draft | optimizing | ready | publishing | published | failed
  wp_post_id int, -- id del post una vez publicado en WordPress
  wp_post_url text,
  embedding vector(1536), -- para cálculo de enlazado interno
  word_count int,
  generation_cost_usd numeric(10,4),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
alter table public.articles enable row level security;
create policy "acceso via propiedad del sitio" on public.articles
  for all using (
    site_id in (select id from public.sites where user_id = auth.uid())
  );

-- índice para búsqueda de similitud (enlazado interno)
create index on public.articles using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------- ENLACES INTERNOS SUGERIDOS ----------
create table public.internal_links (
  id uuid primary key default uuid_generate_v4(),
  source_article_id uuid not null references public.articles(id) on delete cascade,
  target_article_id uuid not null references public.articles(id) on delete cascade,
  anchor_text text,
  similarity numeric, -- 0-1
  status text not null default 'suggested', -- suggested | applied | rejected
  created_at timestamptz not null default now(),
  unique(source_article_id, target_article_id)
);
alter table public.internal_links enable row level security;
create policy "acceso via propiedad del sitio origen" on public.internal_links
  for all using (
    source_article_id in (
      select a.id from public.articles a
      join public.sites s on s.id = a.site_id
      where s.user_id = auth.uid()
    )
  );

-- ---------- SEGUIMIENTO DE POSICIONES ----------
create table public.rank_tracking (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references public.sites(id) on delete cascade,
  keyword_id uuid not null references public.keywords(id) on delete cascade,
  article_id uuid references public.articles(id) on delete set null,
  position int,
  search_engine text default 'google.es',
  checked_at timestamptz not null default now()
);
alter table public.rank_tracking enable row level security;
create policy "acceso via propiedad del sitio" on public.rank_tracking
  for all using (
    site_id in (select id from public.sites where user_id = auth.uid())
  );
create index on public.rank_tracking (keyword_id, checked_at desc);

-- ---------- COLA DE TRABAJOS (generación asíncrona) ----------
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- generate_article | publish_article | rank_check | keyword_research
  payload jsonb not null default '{}',
  status text not null default 'pending', -- pending | running | done | failed
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
alter table public.jobs enable row level security;
create policy "usuarios ven sus propios jobs" on public.jobs
  for all using (auth.uid() = user_id);

-- ---------- Trigger: crear perfil automáticamente al registrarse ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
