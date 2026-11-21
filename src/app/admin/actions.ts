"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/server";
import { bool, dbMessage, json, lines, pounds, safeUrl, str } from "@/lib/form";
import { parseScore } from "@/lib/rating";
import { slugify } from "@/lib/format";
import { youtubeId, isInstagramUrl, isShortUrl } from "@/lib/youtube";
import type { GalleryImage, RetailerLink, Spec } from "@/lib/types";

export type ActionState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

const revalidateSite = () => revalidatePath("/", "layout");

// ── Auth ─────────────────────────────────────────────────────────────────
export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email");
  const password = str(fd, "password");
  if (!email || !password) return { ok: false, message: "Enter your email and password." };
  const sb = await getSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  // Same message for every failure so we don't reveal which accounts exist.
  if (error) return { ok: false, message: "Those details didn’t work. Check them and try again." };
  const next = str(fd, "next");
  redirect(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function signOut() {
  const sb = await getSupabase();
  await sb.auth.signOut();
  redirect("/admin/login");
}

// ── Reviews ──────────────────────────────────────────────────────────────
const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function saveReview(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const staff = await requireStaff("contributor");
  const sb = await getSupabase();
  const id = str(fd, "id");
  const intent = (str(fd, "intent") ?? "save") as "save" | "publish" | "schedule" | "unpublish" | "draft";
  const fieldErrors: Record<string, string> = {};

  let overall: number | null = null, perf: number | null = null, value: number | null = null, build: number | null = null;
  try { overall = parseScore(str(fd, "overall_rating")); } catch (e) { fieldErrors.overall_rating = (e as Error).message; }
  try { perf = parseScore(str(fd, "performance_rating")); } catch (e) { fieldErrors.performance_rating = (e as Error).message; }
  try { value = parseScore(str(fd, "value_rating")); } catch (e) { fieldErrors.value_rating = (e as Error).message; }
  try { build = parseScore(str(fd, "build_rating")); } catch (e) { fieldErrors.build_rating = (e as Error).message; }
  let price: number | null = null;
  try { price = pounds(fd, "price"); } catch (e) { fieldErrors.price = (e as Error).message; }

  const title = str(fd, "title");
  const product_name = str(fd, "product_name");
  if (!title || title.length < 3) fieldErrors.title = "Give the review a title (at least 3 characters).";
  if (!product_name) fieldErrors.product_name = "Product name is required.";
  const slug = str(fd, "slug") ?? slugify(title ?? "");
  if (!slugRe.test(slug)) fieldErrors.slug = "Use lowercase letters, numbers and hyphens only.";

  const specs = json<Spec[]>(fd, "specs", []).filter((s) => s.label?.trim() && s.value?.trim()).slice(0, 40)
    .map((s) => ({ label: s.label.trim().slice(0, 80), value: s.value.trim().slice(0, 200) }));
  const retailer_links = json<RetailerLink[]>(fd, "retailer_links", []).slice(0, 10)
    .map((l) => ({ name: (l.name ?? "").trim().slice(0, 60), url: safeUrl(l.url) ?? "", affiliate: !!l.affiliate }))
    .filter((l) => l.name && l.url);
  const gallery = json<GalleryImage[]>(fd, "gallery", []).slice(0, 20)
    .map((g) => ({ url: safeUrl(g.url) ?? "", alt: (g.alt ?? "").trim().slice(0, 200) })).filter((g) => g.url);

  const video_url = str(fd, "video_url");
  if (video_url && !youtubeId(video_url)) fieldErrors.video_url = "That doesn’t look like a YouTube link.";
  const is_sponsored = bool(fd, "is_sponsored");
  const sponsor_disclosure = str(fd, "sponsor_disclosure");
  if (is_sponsored && !sponsor_disclosure) fieldErrors.sponsor_disclosure = "Sponsored reviews must say who sponsored them.";
  const collection = str(fd, "collection");

  const row = {
    slug, title, product_name,
    brand: str(fd, "brand"), model: str(fd, "model"), category_id: str(fd, "category_id"),
    hero_image_url: safeUrl(str(fd, "hero_image_url")), hero_image_alt: str(fd, "hero_image_alt"), gallery,
    price_pence: price, price_note: str(fd, "price_note"),
    obtained_method: str(fd, "obtained_method"), obtained_note: str(fd, "obtained_note"),
    testing_duration: str(fd, "testing_duration"), testing_notes: str(fd, "testing_notes"),
    reviewed_at: str(fd, "reviewed_at"),
    video_url, short_verdict: str(fd, "short_verdict")?.slice(0, 240) ?? null, verdict_label: str(fd, "verdict_label")?.slice(0, 40) ?? null,
    body: str(fd, "body") ?? "", pros: lines(fd, "pros"), cons: lines(fd, "cons"),
    overall_rating: overall, performance_rating: perf, value_rating: value, build_rating: build,
    rating_approved: overall !== null && bool(fd, "rating_approved"),
    specs, final_verdict: str(fd, "final_verdict"), retailer_links,
    has_affiliate_links: retailer_links.some((l) => l.affiliate),
    is_sponsored, sponsor_disclosure,
    collection: collection === "good" || collection === "bad" || collection === "ugly" ? collection : null,
    worth_your_money: bool(fd, "worth_your_money"), featured: bool(fd, "featured"),
    seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"), og_image_url: safeUrl(str(fd, "og_image_url")),
  };

  // Current state (for existing reviews)
  type Cur = { status: string; published_at: string | null };
  let current: Cur | null = null;
  if (id) {
    const { data } = await sb.from("reviews").select("status,published_at").eq("id", id).maybeSingle();
    current = data as unknown as Cur | null;
    if (!current) return { ok: false, message: "Review not found." };
  }

  let status = current?.status ?? "draft";
  let published_at = current?.published_at ?? null;
  if (intent === "publish") { status = "published"; if (!published_at || new Date(published_at) > new Date()) published_at = new Date().toISOString(); }
  if (intent === "schedule") {
    const at = str(fd, "publish_at_iso");
    const d = at ? new Date(at) : null;
    if (!d || Number.isNaN(d.getTime()) || d <= new Date()) fieldErrors.publish_at = "Pick a date and time in the future.";
    else { status = "scheduled"; published_at = d.toISOString(); }
  }
  if (intent === "unpublish") status = "unpublished";
  if (intent === "draft") status = "draft";

  // Going (or staying) live requires the full transparency set.
  if (status === "published" || status === "scheduled") {
    if (overall === null) fieldErrors.overall_rating = "A live review needs an overall score.";
    else if (!row.rating_approved) fieldErrors.rating_approved = "Tick to confirm you’ve approved this score.";
    if (!row.category_id) fieldErrors.category_id = "Choose a category.";
    if (!row.obtained_method) fieldErrors.obtained_method = "Say how you got the product.";
    if (!row.testing_duration) fieldErrors.testing_duration = "Describe how long/how you actually tested it.";
    if (!row.short_verdict) fieldErrors.short_verdict = "Add a short verdict.";
    if (row.body.length < 50) fieldErrors.body = "The written review is too short to publish.";
  }

  if (Object.keys(fieldErrors).length) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };

  const payload = { ...row, status, published_at };
  let savedId = id;
  if (id) {
    const { error } = await sb.from("reviews").update(payload as never).eq("id", id);
    if (error) return { ok: false, message: dbMessage(error) };
  } else {
    const { data, error } = await sb.from("reviews").insert({ ...payload, created_by: staff.id } as never).select("id").single();
    if (error) return { ok: false, message: dbMessage(error) };
    savedId = (data as { id: string }).id;
  }
  revalidateSite();
  redirect(`/admin/reviews/${savedId}?saved=${intent}`);
}

export async function deleteReview(fd: FormData) {
  await requireStaff("admin");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("reviews").delete().eq("id", id);
  revalidateSite();
  redirect("/admin/reviews?deleted=1");
}

export async function addReviewUpdate(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("editor");
  const review_id = str(fd, "review_id");
  const note = str(fd, "note");
  if (!review_id || !note || note.length < 3) return { ok: false, message: "Write a short note about what changed." };
  const sb = await getSupabase();
  const { error } = await sb.from("review_updates").insert({ review_id, note: note.slice(0, 1000), is_correction: bool(fd, "is_correction") } as never);
  if (error) return { ok: false, message: dbMessage(error) };
  // Touch the review so "Updated" date and sitemap lastmod change.
  await sb.from("reviews").update({ updated_at: new Date().toISOString() } as never).eq("id", review_id);
  revalidateSite();
  return { ok: true, message: "Update note added." };
}

// ── Media ────────────────────────────────────────────────────────────────
const MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function uploadMedia(fd: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  await requireStaff("contributor");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image." };
  if (!MIME.includes(file.type)) return { ok: false, message: "Use JPEG, PNG, WebP, AVIF or GIF." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, message: "Images must be under 8 MB." };
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const now = new Date();
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
  const sb = await getSupabase();
  const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return { ok: false, message: dbMessage(error) };
  const { data } = sb.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function deleteMedia(fd: FormData) {
  await requireStaff("editor");
  const path = str(fd, "path");
  if (!path || path.includes("..")) return;
  const sb = await getSupabase();
  await sb.storage.from("media").remove([path]);
  revalidatePath("/admin/media");
}

// ── Categories ───────────────────────────────────────────────────────────
export async function saveCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("editor");
  const parsed = z.object({
    name: z.string().trim().min(1, "Name is required").max(80),
    slug: z.string().trim().regex(slugRe, "Slug: lowercase letters, numbers and hyphens").optional(),
    description: z.string().trim().max(300).optional(),
    sort_order: z.coerce.number().int().min(0).max(10000).default(0),
  }).safeParse({ name: str(fd, "name") ?? "", slug: str(fd, "slug") ?? slugify(str(fd, "name") ?? "") , description: str(fd, "description") ?? undefined, sort_order: str(fd, "sort_order") ?? 0 });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const sb = await getSupabase();
  const id = str(fd, "id");
  const row = { ...parsed.data, description: parsed.data.description ?? null };
  const { error } = id ? await sb.from("categories").update(row as never).eq("id", id) : await sb.from("categories").insert(row as never);
  if (error) return { ok: false, message: dbMessage(error) };
  revalidateSite();
  return { ok: true, message: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(fd: FormData) {
  await requireStaff("editor");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("categories").delete().eq("id", id); // reviews keep existing; category_id becomes null
  revalidateSite();
}

// ── Comparisons ──────────────────────────────────────────────────────────
interface ItemIn { review_id?: string | null; product_name: string; price?: string; rating?: string; pros?: string; cons?: string; specs?: Spec[]; observations?: string; best_for?: string; image_url?: string }

export async function saveComparison(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("editor");
  const sb = await getSupabase();
  const id = str(fd, "id");
  const intent = str(fd, "intent") ?? "save";
  const title = str(fd, "title");
  if (!title) return { ok: false, message: "Title is required." };
  const slug = str(fd, "slug") ?? slugify(title);
  if (!slugRe.test(slug)) return { ok: false, message: "Slug: lowercase letters, numbers and hyphens only." };
  const kind = str(fd, "kind") ?? "versus";
  if (!["versus", "best_under", "budget_vs_premium", "guide"].includes(kind)) return { ok: false, message: "Invalid comparison type." };

  let items;
  try {
    items = json<ItemIn[]>(fd, "items", []).filter((i) => i.product_name?.trim()).slice(0, 12).map((i, position) => ({
      position, review_id: i.review_id || null, product_name: i.product_name.trim().slice(0, 120),
      price_pence: i.price ? Math.round(Number(String(i.price).replace(/[£,]/g, "")) * 100) : null,
      rating: parseScore(i.rating ?? null),
      pros: (i.pros ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      cons: (i.cons ?? "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      specs: (i.specs ?? []).filter((s) => s.label?.trim() && s.value?.trim()).slice(0, 30),
      observations: i.observations?.trim() || null, best_for: i.best_for?.trim() || null, image_url: safeUrl(i.image_url ?? null),
    }));
    if (items.some((i) => i.price_pence !== null && (!Number.isFinite(i.price_pence) || i.price_pence < 0))) throw new Error("Prices must be numbers.");
  } catch (e) { return { ok: false, message: (e as Error).message }; }

  const { data: cur } = id ? await sb.from("comparisons").select("status,published_at").eq("id", id).maybeSingle() : { data: null };
  const c = cur as { status: string; published_at: string | null } | null;
  let status = c?.status ?? "draft";
  let published_at = c?.published_at ?? null;
  if (intent === "publish") { status = "published"; if (!published_at || new Date(published_at) > new Date()) published_at = new Date().toISOString(); }
  if (intent === "schedule") {
    const d = new Date(str(fd, "publish_at_iso") ?? "");
    if (Number.isNaN(d.getTime()) || d <= new Date()) return { ok: false, message: "Pick a future date and time to schedule." };
    status = "scheduled"; published_at = d.toISOString();
  }
  if (intent === "unpublish") status = "unpublished";
  if ((status === "published" || status === "scheduled") && items.length < 2) return { ok: false, message: "A live comparison needs at least two products." };

  const row = {
    slug, title, kind, status, published_at, intro: str(fd, "intro"), body: str(fd, "body") ?? "", recommendation: str(fd, "recommendation"),
    hero_image_url: safeUrl(str(fd, "hero_image_url")), seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"),
  };
  let cid = id;
  if (id) {
    const { error } = await sb.from("comparisons").update(row as never).eq("id", id);
    if (error) return { ok: false, message: dbMessage(error) };
  } else {
    const { data, error } = await sb.from("comparisons").insert(row as never).select("id").single();
    if (error) return { ok: false, message: dbMessage(error) };
    cid = (data as { id: string }).id;
  }
  // Replace items
  await sb.from("comparison_items").delete().eq("comparison_id", cid!);
  if (items.length) {
    const { error } = await sb.from("comparison_items").insert(items.map((i) => ({ ...i, comparison_id: cid })) as never);
    if (error) return { ok: false, message: dbMessage(error) };
  }
  revalidateSite();
  redirect(`/admin/comparisons/${cid}?saved=${intent}`);
}

export async function deleteComparison(fd: FormData) {
  await requireStaff("admin");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("comparisons").delete().eq("id", id);
  revalidateSite();
  redirect("/admin/comparisons");
}

// ── Videos ───────────────────────────────────────────────────────────────
export async function saveVideo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("editor");
  const url = safeUrl(str(fd, "url"));
  const title = str(fd, "title");
  if (!title) return { ok: false, message: "Give the video a title." };
  if (!url) return { ok: false, message: "Paste a valid YouTube or Instagram link." };
  const yt = youtubeId(url);
  const insta = isInstagramUrl(url);
  if (!yt && !insta) return { ok: false, message: "Only YouTube and Instagram links are supported." };
  const kind = insta ? "instagram" : isShortUrl(url) || str(fd, "kind") === "short" ? "short" : "video";
  const publish = bool(fd, "published");
  const sb = await getSupabase();
  const id = str(fd, "id");
  const row = {
    title: title.slice(0, 200), url, youtube_id: yt, kind, review_id: str(fd, "review_id"),
    status: publish ? "published" : "draft", published_at: publish ? (str(fd, "published_at") ?? new Date().toISOString()) : null,
  };
  const { error } = id ? await sb.from("videos").update(row as never).eq("id", id) : await sb.from("videos").insert(row as never);
  if (error) return { ok: false, message: dbMessage(error) };
  revalidateSite();
  return { ok: true, message: "Video saved." };
}

export async function deleteVideo(fd: FormData) {
  await requireStaff("editor");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("videos").delete().eq("id", id);
  revalidateSite();
}

// ── Settings ─────────────────────────────────────────────────────────────
export async function saveSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("admin");
  const sb = await getSupabase();
  const socialKeys = ["youtube", "instagram", "tiktok", "x", "facebook", "threads"] as const;
  const social: Record<string, string> = {};
  for (const k of socialKeys) {
    const v = str(fd, `social_${k}`);
    if (v && !safeUrl(v)) return { ok: false, message: `The ${k} link isn’t a valid URL (include https://).` };
    social[k] = v ? safeUrl(v)! : "";
  }
  const featured = (fd.getAll("featured_review_ids") as string[]).filter(Boolean).slice(0, 6);
  const contactEmail = str(fd, "contact_email");
  if (contactEmail && !z.string().email().safeParse(contactEmail).success) return { ok: false, message: "Contact email isn’t valid." };
  const rows = [
    { key: "social", value: social },
    { key: "homepage", value: { hero_review_id: str(fd, "hero_review_id"), featured_review_ids: featured } },
    { key: "disclosures", value: { affiliate_short: str(fd, "affiliate_short") ?? "", sponsored_short: str(fd, "sponsored_short") ?? "" } },
    { key: "contact", value: { email: contactEmail ?? "" } },
  ].map((r) => ({ ...r, updated_at: new Date().toISOString() }));
  const { error } = await sb.from("site_settings").upsert(rows as never);
  if (error) return { ok: false, message: dbMessage(error) };
  revalidateSite();
  return { ok: true, message: "Settings saved." };
}

export async function savePage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireStaff("admin");
  const slug = str(fd, "slug");
  if (!slug || !slugRe.test(slug)) return { ok: false, message: "Invalid page." };
  const sb = await getSupabase();
  if (bool(fd, "reset")) {
    await sb.from("site_settings").delete().eq("key", `page:${slug}`);
  } else {
    const body = str(fd, "body");
    if (!body) return { ok: false, message: "Page content can’t be empty." };
    const { error } = await sb.from("site_settings").upsert({ key: `page:${slug}`, value: { title: str(fd, "title"), body }, updated_at: new Date().toISOString() } as never);
    if (error) return { ok: false, message: dbMessage(error) };
  }
  revalidateSite();
  return { ok: true, message: bool(fd, "reset") ? "Reset to the default draft." : "Page saved." };
}

// ── Inbox ────────────────────────────────────────────────────────────────
export async function toggleSubmission(fd: FormData) {
  await requireStaff("contributor");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("submissions").update({ handled: bool(fd, "handled") } as never).eq("id", id);
  revalidatePath("/admin/inbox");
}

export async function deleteSubmission(fd: FormData) {
  await requireStaff("admin");
  const id = str(fd, "id");
  if (!id) return;
  const sb = await getSupabase();
  await sb.from("submissions").delete().eq("id", id);
  revalidatePath("/admin/inbox");
}

// ── Users ────────────────────────────────────────────────────────────────
export async function setRole(fd: FormData) {
  const me = await requireStaff("admin");
  const id = str(fd, "id");
  const role = str(fd, "role");
  if (!id || id === me.id) return; // can't change your own role (avoids locking yourself out)
  if (role !== null && role !== "none" && !["admin", "editor", "contributor"].includes(role)) return;
  const sb = await getSupabase();
  await sb.from("profiles").update({ role: role === "none" ? null : role } as never).eq("id", id);
  revalidatePath("/admin/users");
}
