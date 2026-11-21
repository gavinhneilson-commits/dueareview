import type { Collection, ReviewFilters, ReviewSort } from "./types";

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.slice(0, 200) || undefined;

/** Parse & sanitise URL search params into review filters. Invalid values are ignored, never trusted. */
export function parseFilters(sp: SP): { filters: ReviewFilters; raw: Record<string, string | undefined> } {
  const q = one(sp.q)?.trim();
  const category = one(sp.category);
  const brand = one(sp.brand);
  const min = Number(one(sp.min));
  const max = Number(one(sp.max));
  const sortRaw = one(sp.sort);
  const sort: ReviewSort = sortRaw === "highest" || sortRaw === "lowest" ? sortRaw : "newest";
  const page = Math.max(1, Math.min(500, parseInt(one(sp.page) || "1", 10) || 1));
  const collection = (["good", "bad", "ugly"] as const).find((c) => c === one(sp.collection)) as Collection | undefined;
  const filters: ReviewFilters = {
    q: q || undefined,
    category: category && /^[a-z0-9-]+$/.test(category) ? category : undefined,
    brand: brand || undefined,
    minRating: Number.isFinite(min) && min >= 0 && min <= 10 && one(sp.min) ? min : undefined,
    maxPrice: Number.isFinite(max) && max > 0 && one(sp.max) ? max : undefined,
    sort, page, collection,
  };
  return {
    filters,
    raw: { q: filters.q, category: filters.category, brand: filters.brand, min: one(sp.min), max: one(sp.max), sort: sortRaw, page: one(sp.page) },
  };
}
