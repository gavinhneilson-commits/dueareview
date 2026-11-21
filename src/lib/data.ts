import "server-only";
import { cache } from "react";
import { isDemoMode } from "./env";
import { getPublicSupabase } from "./supabase/server";
import {
  SAMPLE_CATEGORIES, SAMPLE_COMPARISONS, SAMPLE_REVIEWS, SAMPLE_SETTINGS, SAMPLE_UPDATES, SAMPLE_VIDEOS,
} from "./sample-data";
import { getDefaultLegal, type LegalPage } from "@/content/legal";
import type { Category, Comparison, Review, ReviewFilters, ReviewUpdate, SiteSettings, Video } from "./types";

/** All public reads go through the anon client → RLS guarantees only live content is returned. */

export const REVIEW_COLUMNS =
  "id,slug,status,published_at,reviewed_at,updated_at,created_at,title,product_name,brand,model,category_id," +
  "hero_image_url,hero_image_alt,gallery,price_pence,price_note,obtained_method,obtained_note,testing_duration,testing_notes," +
  "video_url,short_verdict,verdict_label,body,pros,cons,overall_rating,performance_rating,value_rating,build_rating," +
  "rating_approved,specs,final_verdict,retailer_links,has_affiliate_links,is_sponsored,sponsor_disclosure,collection," +
  "worth_your_money,featured,seo_title,seo_description,og_image_url,category:categories(id,slug,name,description,sort_order)";

const CARD_COLUMNS =
  "id,slug,status,published_at,updated_at,title,product_name,brand,category_id,hero_image_url,hero_image_alt,price_pence," +
  "video_url,short_verdict,verdict_label,overall_rating,collection,worth_your_money,featured,is_sponsored," +
  "category:categories(id,slug,name,description,sort_order)";

function num(v: unknown): number | null {
  return v === null || v === undefined ? null : Number(v);
}
function normaliseReview(row: Record<string, unknown>): Review {
  const r = row as unknown as Review;
  return {
    ...r,
    overall_rating: num(r.overall_rating),
    performance_rating: num(r.performance_rating),
    value_rating: num(r.value_rating),
    build_rating: num(r.build_rating),
    pros: r.pros ?? [], cons: r.cons ?? [], specs: r.specs ?? [], gallery: r.gallery ?? [], retailer_links: r.retailer_links ?? [],
    body: r.body ?? "",
  };
}

const isLive = (r: { status: string; published_at: string | null }) =>
  (r.status === "published" || r.status === "scheduled") && !!r.published_at && new Date(r.published_at) <= new Date();

// ── Categories ────────────────────────────────────────────────────────────
export const getCategories = cache(async (): Promise<Category[]> => {
  if (isDemoMode) return SAMPLE_CATEGORIES;
  const { data, error } = await getPublicSupabase().from("categories").select("*").order("sort_order").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
});

export const getCategory = cache(async (slug: string) => (await getCategories()).find((c) => c.slug === slug) ?? null);

// ── Reviews ───────────────────────────────────────────────────────────────
export interface ReviewPage { items: Review[]; total: number; page: number; pageSize: number }

export async function searchReviews(f: ReviewFilters = {}): Promise<ReviewPage> {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, f.pageSize ?? 12));
  const sort = f.sort ?? "newest";

  if (isDemoMode) {
    let items = SAMPLE_REVIEWS.filter(isLive);
    if (f.q) {
      const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
      items = items.filter((r) => {
        const hay = [r.title, r.product_name, r.brand, r.model, r.short_verdict, r.body].join(" ").toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
    }
    if (f.category) items = items.filter((r) => r.category?.slug === f.category);
    if (f.brand) items = items.filter((r) => (r.brand ?? "").toLowerCase() === f.brand!.toLowerCase());
    if (f.minRating !== undefined) items = items.filter((r) => (r.overall_rating ?? -1) >= f.minRating!);
    if (f.maxPrice !== undefined) items = items.filter((r) => r.price_pence !== null && r.price_pence <= f.maxPrice! * 100);
    if (f.collection) items = items.filter((r) => r.collection === f.collection);
    if (f.worth) items = items.filter((r) => r.worth_your_money);
    items = [...items].sort((a, b) =>
      sort === "highest" ? (b.overall_rating ?? 0) - (a.overall_rating ?? 0)
      : sort === "lowest" ? (a.overall_rating ?? 0) - (b.overall_rating ?? 0)
      : +new Date(b.published_at!) - +new Date(a.published_at!));
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  }

  const sb = getPublicSupabase();
  let q = sb.from("reviews").select(CARD_COLUMNS, { count: "exact" });
  if (f.q) q = q.textSearch("search", f.q, { type: "websearch", config: "english" });
  if (f.category) {
    const c = await getCategory(f.category);
    if (!c) return { items: [], total: 0, page, pageSize };
    q = q.eq("category_id", c.id);
  }
  if (f.brand) q = q.ilike("brand", f.brand.replace(/[%_]/g, ""));
  if (f.minRating !== undefined) q = q.gte("overall_rating", f.minRating);
  if (f.maxPrice !== undefined) q = q.lte("price_pence", Math.round(f.maxPrice * 100));
  if (f.collection) q = q.eq("collection", f.collection);
  if (f.worth) q = q.eq("worth_your_money", true);
  q = sort === "highest" ? q.order("overall_rating", { ascending: false, nullsFirst: false })
    : sort === "lowest" ? q.order("overall_rating", { ascending: true, nullsFirst: false })
    : q.order("published_at", { ascending: false });
  q = q.range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await q;
  if (error) throw error;
  return { items: (data ?? []).map((d) => normaliseReview(d as unknown as Record<string, unknown>)), total: count ?? 0, page, pageSize };
}

export const getLatestReviews = (limit = 6) => searchReviews({ pageSize: limit }).then((p) => p.items);

export const getReviewBySlug = cache(async (slug: string): Promise<Review | null> => {
  if (isDemoMode) return SAMPLE_REVIEWS.find((r) => r.slug === slug && isLive(r)) ?? null;
  const { data, error } = await getPublicSupabase().from("reviews").select(REVIEW_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? normaliseReview(data as unknown as Record<string, unknown>) : null;
});

export async function getReviewsByIds(ids: string[]): Promise<Review[]> {
  if (!ids.length) return [];
  if (isDemoMode) return SAMPLE_REVIEWS.filter((r) => ids.includes(r.id) && isLive(r));
  const { data, error } = await getPublicSupabase().from("reviews").select(CARD_COLUMNS).in("id", ids);
  if (error) throw error;
  const rows = (data ?? []).map((d) => normaliseReview(d as unknown as Record<string, unknown>));
  return ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Review[];
}

export async function getFeaturedReviews(limit = 4): Promise<Review[]> {
  if (isDemoMode) return SAMPLE_REVIEWS.filter((r) => r.featured).slice(0, limit);
  const { data, error } = await getPublicSupabase().from("reviews").select(CARD_COLUMNS)
    .eq("featured", true).order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((d) => normaliseReview(d as unknown as Record<string, unknown>));
}

export async function getRelatedReviews(review: Review, limit = 3): Promise<Review[]> {
  const sameCat = review.category?.slug
    ? (await searchReviews({ category: review.category.slug, pageSize: limit + 1 })).items
    : [];
  let related = sameCat.filter((r) => r.id !== review.id);
  if (related.length < limit) {
    const latest = await getLatestReviews(limit + 4);
    related = [...related, ...latest.filter((r) => r.id !== review.id && !related.some((x) => x.id === r.id))];
  }
  return related.slice(0, limit);
}

export async function getBrands(): Promise<string[]> {
  if (isDemoMode) return [...new Set(SAMPLE_REVIEWS.map((r) => r.brand).filter(Boolean) as string[])].sort();
  const { data, error } = await getPublicSupabase().from("reviews").select("brand").not("brand", "is", null).limit(2000);
  if (error) throw error;
  const rows = (data ?? []) as unknown as { brand: string }[];
  return [...new Set(rows.map((d) => d.brand.trim()))].sort((a, b) => a.localeCompare(b));
}

export async function getReviewUpdates(reviewId: string): Promise<ReviewUpdate[]> {
  if (isDemoMode) return SAMPLE_UPDATES.filter((u) => u.review_id === reviewId);
  const { data, error } = await getPublicSupabase().from("review_updates").select("*")
    .eq("review_id", reviewId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewUpdate[];
}

export async function getAllReviewSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (isDemoMode) return SAMPLE_REVIEWS.filter(isLive).map(({ slug, updated_at }) => ({ slug, updated_at }));
  const { data, error } = await getPublicSupabase().from("reviews").select("slug,updated_at").limit(5000);
  if (error) throw error;
  return (data ?? []) as { slug: string; updated_at: string }[];
}

// ── Comparisons ───────────────────────────────────────────────────────────
export async function getComparisons(): Promise<Comparison[]> {
  if (isDemoMode) return SAMPLE_COMPARISONS.filter(isLive);
  const { data, error } = await getPublicSupabase().from("comparisons")
    .select("id,slug,kind,status,published_at,title,intro,hero_image_url,updated_at,created_at,body,recommendation,seo_title,seo_description")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Comparison[];
}

export const getComparisonBySlug = cache(async (slug: string): Promise<Comparison | null> => {
  if (isDemoMode) return SAMPLE_COMPARISONS.find((c) => c.slug === slug && isLive(c)) ?? null;
  const { data, error } = await getPublicSupabase().from("comparisons")
    .select("*, items:comparison_items(*, review:reviews(slug,title))").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const c = data as unknown as Comparison;
  c.items = (c.items ?? []).map((i) => ({ ...i, rating: num(i.rating) })).sort((a, b) => a.position - b.position);
  return c;
});

// ── Videos ────────────────────────────────────────────────────────────────
export async function getVideos(limit = 24): Promise<Video[]> {
  if (isDemoMode) return SAMPLE_VIDEOS.slice(0, limit);
  const { data, error } = await getPublicSupabase().from("videos").select("*, review:reviews(slug,title)")
    .order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as Video[];
}

// ── Settings ──────────────────────────────────────────────────────────────
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (isDemoMode) return SAMPLE_SETTINGS;
  const { data, error } = await getPublicSupabase().from("site_settings").select("key,value");
  if (error) throw error;
  const map = Object.fromEntries((data ?? []).map((d) => [(d as { key: string }).key, (d as { value: unknown }).value]));
  return {
    social: { ...SAMPLE_SETTINGS.social, ...(map.social ?? {}) },
    homepage: { ...SAMPLE_SETTINGS.homepage, hero_review_id: null, ...(map.homepage ?? {}) },
    disclosures: { ...SAMPLE_SETTINGS.disclosures, ...(map.disclosures ?? {}) },
    contact: { ...SAMPLE_SETTINGS.contact, ...(map.contact ?? {}) },
  };
});

// ── Editable pages (legal etc.) ───────────────────────────────────────────
export async function getPage(slug: string): Promise<LegalPage | null> {
  const def = getDefaultLegal(slug);
  if (!def) return null;
  if (isDemoMode) return def;
  const { data } = await getPublicSupabase().from("site_settings").select("value").eq("key", `page:${slug}`).maybeSingle();
  const v = (data as { value?: { title?: string; body?: string } } | null)?.value;
  return v?.body ? { ...def, title: v.title || def.title, body: v.body } : def;
}
