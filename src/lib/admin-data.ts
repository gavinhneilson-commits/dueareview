import "server-only";
import { getSupabase } from "./supabase/server";
import { REVIEW_COLUMNS } from "./data";
import type { Category, Comparison, Review, ReviewUpdate, Submission, Video } from "./types";

/** Staff reads: uses the signed-in user's session, so RLS shows drafts only to staff. */
const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export async function adminListReviews(status?: string, q?: string) {
  const sb = await getSupabase();
  let query = sb.from("reviews").select("id,slug,title,product_name,brand,status,published_at,updated_at,overall_rating,rating_approved,featured,category:categories(name)")
    .order("updated_at", { ascending: false }).limit(200);
  if (status && ["draft", "scheduled", "published", "unpublished"].includes(status)) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q.replace(/[%_]/g, "")}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as (Pick<Review, "id" | "slug" | "title" | "product_name" | "brand" | "status" | "published_at" | "updated_at" | "overall_rating" | "rating_approved" | "featured"> & { category: { name: string } | null })[];
}

export async function adminGetReview(id: string): Promise<Review | null> {
  const sb = await getSupabase();
  const { data, error } = await sb.from("reviews").select(REVIEW_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const r = data as unknown as Review;
  return { ...r, overall_rating: n(r.overall_rating), performance_rating: n(r.performance_rating), value_rating: n(r.value_rating), build_rating: n(r.build_rating) };
}

export async function adminReviewUpdates(id: string): Promise<ReviewUpdate[]> {
  const sb = await getSupabase();
  const { data } = await sb.from("review_updates").select("*").eq("review_id", id).order("created_at", { ascending: false });
  return (data ?? []) as ReviewUpdate[];
}

export async function adminCategories(): Promise<Category[]> {
  const sb = await getSupabase();
  const { data } = await sb.from("categories").select("*").order("sort_order").order("name");
  return (data ?? []) as Category[];
}

export async function adminReviewOptions() {
  const sb = await getSupabase();
  const { data } = await sb.from("reviews").select("id,title,status,overall_rating,price_pence,product_name,brand").order("updated_at", { ascending: false }).limit(500);
  return (data ?? []) as { id: string; title: string; status: string; overall_rating: number | null; price_pence: number | null; product_name: string; brand: string | null }[];
}

export async function adminComparisons(): Promise<Comparison[]> {
  const sb = await getSupabase();
  const { data } = await sb.from("comparisons").select("*").order("updated_at", { ascending: false });
  return (data ?? []) as Comparison[];
}

export async function adminGetComparison(id: string): Promise<Comparison | null> {
  const sb = await getSupabase();
  const { data } = await sb.from("comparisons").select("*, items:comparison_items(*)").eq("id", id).maybeSingle();
  if (!data) return null;
  const c = data as unknown as Comparison;
  c.items = (c.items ?? []).sort((a, b) => a.position - b.position);
  return c;
}

export async function adminVideos(): Promise<Video[]> {
  const sb = await getSupabase();
  const { data } = await sb.from("videos").select("*, review:reviews(slug,title)").order("created_at", { ascending: false });
  return (data ?? []) as Video[];
}

export async function adminSubmissions(showHandled: boolean): Promise<Submission[]> {
  const sb = await getSupabase();
  let q = sb.from("submissions").select("*").order("created_at", { ascending: false }).limit(200);
  if (!showHandled) q = q.eq("handled", false);
  const { data } = await q;
  return (data ?? []) as Submission[];
}

export async function adminStats() {
  const sb = await getSupabase();
  const count = async (table: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = sb.from(table).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    const { count: c } = await q;
    return c ?? 0;
  };
  const [drafts, scheduled, published, inbox, comparisons, videos] = await Promise.all([
    count("reviews", (q) => q.eq("status", "draft")),
    count("reviews", (q) => q.eq("status", "scheduled")),
    count("reviews", (q) => q.eq("status", "published")),
    count("submissions", (q) => q.eq("handled", false)),
    count("comparisons"),
    count("videos"),
  ]);
  return { drafts, scheduled, published, inbox, comparisons, videos };
}

export async function adminProfiles() {
  const sb = await getSupabase();
  const { data } = await sb.from("profiles").select("id,email,display_name,role,created_at").order("created_at");
  return (data ?? []) as { id: string; email: string | null; display_name: string | null; role: string | null; created_at: string }[];
}

export async function adminMedia(prefix = "") {
  const sb = await getSupabase();
  // List year/month folders then files (2 levels deep).
  const out: { path: string; url: string; size: number; created_at: string }[] = [];
  const { data: years } = await sb.storage.from("media").list(prefix, { limit: 100, sortBy: { column: "name", order: "desc" } });
  for (const y of (years ?? []).filter((x) => !x.id).slice(0, 3)) {
    const { data: months } = await sb.storage.from("media").list(y.name, { limit: 12, sortBy: { column: "name", order: "desc" } });
    for (const m of (months ?? []).filter((x) => !x.id)) {
      const { data: files } = await sb.storage.from("media").list(`${y.name}/${m.name}`, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      for (const f of files ?? []) {
        if (!f.id) continue;
        const path = `${y.name}/${m.name}/${f.name}`;
        out.push({ path, url: sb.storage.from("media").getPublicUrl(path).data.publicUrl, size: (f.metadata?.size as number) ?? 0, created_at: f.created_at ?? "" });
      }
      if (out.length > 300) return out;
    }
  }
  return out;
}
