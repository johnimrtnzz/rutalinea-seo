export type Plan = "free" | "starter" | "pro" | "agency";

export const PLAN_LIMITS: Record<Plan, { articles: number; sites: number; priceMonthly: number }> = {
  free: { articles: 3, sites: 1, priceMonthly: 0 },
  starter: { articles: 20, sites: 3, priceMonthly: 29 },
  pro: { articles: 80, sites: 10, priceMonthly: 79 },
  agency: { articles: 300, sites: 50, priceMonthly: 199 },
};

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  plan_status: "inactive" | "active" | "past_due" | "canceled";
  articles_used_this_period: number;
  articles_limit: number;
  period_start: string;
  created_at: string;
}

export interface Site {
  id: string;
  user_id: string;
  name: string;
  wp_url: string;
  wp_username: string;
  wp_app_password: string;
  language: string;
  niche: string | null;
  default_category_id: number | null;
  created_at: string;
}

export type KeywordStatus = "pending" | "queued" | "written" | "published" | "discarded";
export type KeywordIntent = "informational" | "commercial" | "transactional" | "navigational";

export interface Keyword {
  id: string;
  site_id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  cpc: number | null;
  intent: KeywordIntent | null;
  status: KeywordStatus;
  source: "manual" | "suggested" | "competitor";
  created_at: string;
}

export type ArticleStatus =
  | "draft"
  | "optimizing"
  | "ready"
  | "publishing"
  | "published"
  | "failed";

export interface Article {
  id: string;
  site_id: string;
  keyword_id: string | null;
  title: string;
  slug: string | null;
  content_html: string | null;
  content_markdown: string | null;
  meta_description: string | null;
  seo_score: number | null;
  status: ArticleStatus;
  wp_post_id: number | null;
  wp_post_url: string | null;
  word_count: number | null;
  generation_cost_usd: number | null;
  created_at: string;
  published_at: string | null;
}

export interface InternalLink {
  id: string;
  source_article_id: string;
  target_article_id: string;
  anchor_text: string | null;
  similarity: number;
  status: "suggested" | "applied" | "rejected";
  created_at: string;
}

export interface RankTrackingEntry {
  id: string;
  site_id: string;
  keyword_id: string;
  article_id: string | null;
  position: number | null;
  search_engine: string;
  checked_at: string;
}

export type JobType =
  | "generate_article"
  | "publish_article"
  | "rank_check"
  | "keyword_research";

export interface Job {
  id: string;
  user_id: string;
  type: JobType;
  payload: Record<string, unknown>;
  status: "pending" | "running" | "done" | "failed";
  error: string | null;
  created_at: string;
  finished_at: string | null;
}
