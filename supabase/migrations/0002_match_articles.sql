-- Función para encontrar artículos similares dentro de un mismo sitio,
-- usada por el módulo de enlazado interno automático.
create or replace function match_articles(
  query_embedding vector(1536),
  match_site_id uuid,
  exclude_article_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  similarity float
)
language sql stable
as $$
  select
    articles.id,
    articles.title,
    1 - (articles.embedding <=> query_embedding) as similarity
  from articles
  where articles.site_id = match_site_id
    and articles.id != exclude_article_id
    and articles.embedding is not null
    and articles.status = 'published'
  order by articles.embedding <=> query_embedding
  limit match_count;
$$;
