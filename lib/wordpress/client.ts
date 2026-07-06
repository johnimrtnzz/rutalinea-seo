export interface WpCredentials {
  wpUrl: string; // ej. https://midominio.com (sin barra final)
  username: string;
  appPassword: string;
}

function authHeader(creds: WpCredentials): string {
  const token = Buffer.from(`${creds.username}:${creds.appPassword}`).toString(
    "base64"
  );
  return `Basic ${token}`;
}

function baseUrl(creds: WpCredentials): string {
  return creds.wpUrl.replace(/\/$/, "") + "/wp-json/wp/v2";
}

export interface PublishPostInput {
  title: string;
  contentHtml: string;
  slug?: string;
  status?: "publish" | "draft" | "future";
  categoryId?: number;
  metaDescription?: string;
  excerpt?: string;
}

export interface PublishPostResult {
  id: number;
  link: string;
  status: string;
}

/**
 * Publica (o guarda como borrador) un artículo en WordPress vía REST API,
 * usando contraseñas de aplicación (Application Passwords, nativo desde WP 5.6).
 */
export async function publishToWordPress(
  creds: WpCredentials,
  post: PublishPostInput
): Promise<PublishPostResult> {
  const res = await fetch(`${baseUrl(creds)}/posts`, {
    method: "POST",
    headers: {
      Authorization: authHeader(creds),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: post.title,
      content: post.contentHtml,
      slug: post.slug,
      status: post.status ?? "publish",
      categories: post.categoryId ? [post.categoryId] : undefined,
      excerpt: post.excerpt,
      // Meta descripción: depende del plugin SEO instalado (Yoast/RankMath).
      // Se intenta con los dos formatos más comunes; si el sitio usa otro
      // plugin, este campo se ignora silenciosamente sin romper la publicación.
      meta: {
        _yoast_wpseo_metadesc: post.metaDescription,
        rank_math_description: post.metaDescription,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Error publicando en WordPress (${res.status}): ${errorBody}`
    );
  }

  const data = await res.json();
  return { id: data.id, link: data.link, status: data.status };
}

export async function updateWordPressPost(
  creds: WpCredentials,
  postId: number,
  updates: Partial<PublishPostInput>
): Promise<PublishPostResult> {
  const res = await fetch(`${baseUrl(creds)}/posts/${postId}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(creds),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: updates.title,
      content: updates.contentHtml,
      status: updates.status,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error actualizando post de WordPress (${res.status})`);
  }

  const data = await res.json();
  return { id: data.id, link: data.link, status: data.status };
}

/**
 * Comprueba que las credenciales de un sitio son válidas antes de guardarlo.
 */
export async function verifyWordPressConnection(
  creds: WpCredentials
): Promise<{ ok: boolean; siteName?: string; error?: string }> {
  try {
    const res = await fetch(`${baseUrl(creds)}/users/me`, {
      headers: { Authorization: authHeader(creds) },
    });
    if (!res.ok) {
      return { ok: false, error: `Credenciales rechazadas (${res.status})` };
    }
    const data = await res.json();
    return { ok: true, siteName: data.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}

export async function fetchCategories(
  creds: WpCredentials
): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${baseUrl(creds)}/categories?per_page=100`, {
    headers: { Authorization: authHeader(creds) },
  });
  if (!res.ok) return [];
  return res.json();
}
