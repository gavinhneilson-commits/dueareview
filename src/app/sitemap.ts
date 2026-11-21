import type { MetadataRoute } from "next";
import { getAllReviewSlugs, getCategories, getComparisons } from "@/lib/data";
import { SITE_URL, isDemoMode } from "@/lib/env";
import { LEGAL_PAGES } from "@/content/legal";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isDemoMode) return []; // never advertise sample content
  let reviews: Awaited<ReturnType<typeof getAllReviewSlugs>> = [], cats: Awaited<ReturnType<typeof getCategories>> = [], comps: Awaited<ReturnType<typeof getComparisons>> = [];
  try {
    [reviews, cats, comps] = await Promise.all([getAllReviewSlugs(), getCategories(), getComparisons()]);
  } catch (e) {
    console.error("Sitemap: couldn't load content (is the database set up?)", e); // still serve the static pages
  }
  const now = new Date();
  const statics = ["", "/reviews", "/categories", "/compare", "/videos", "/our-promise", "/how-we-score", "/worth-your-money",
    "/collections/good", "/collections/bad", "/collections/ugly", "/contact", ...LEGAL_PAGES.map((p) => `/legal/${p.slug}`)];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...cats.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...reviews.map((r) => ({ url: `${SITE_URL}/reviews/${r.slug}`, lastModified: new Date(r.updated_at), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...comps.map((c) => ({ url: `${SITE_URL}/compare/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
