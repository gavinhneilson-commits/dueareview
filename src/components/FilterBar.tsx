"use client";
import { useRef } from "react";
import type { Category } from "@/lib/types";

type P = { q?: string; category?: string; brand?: string; min?: string; max?: string; sort?: string };

/** Plain GET form → works without JavaScript; with JS it applies filters as soon as a select changes. */
export function FilterBar({ categories, brands, params, action = "/reviews", hideCategory = false }: {
  categories: Category[]; brands: string[]; params: P; action?: string; hideCategory?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const submit = () => ref.current?.requestSubmit();
  const active = Object.entries(params).some(([k, v]) => v && k !== "sort");
  return (
    <form ref={ref} action={action} method="get" role="search" aria-label="Filter reviews" className="border-2 border-ink bg-card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <div className="lg:col-span-2">
        <label htmlFor="f-q" className="label">Search</label>
        <input id="f-q" name="q" type="search" defaultValue={params.q} placeholder="Product, brand, model…" className="field" />
      </div>
      {!hideCategory && (
        <div>
          <label htmlFor="f-cat" className="label">Category</label>
          <select id="f-cat" name="category" defaultValue={params.category ?? ""} onChange={submit} className="field">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="f-brand" className="label">Brand</label>
        <select id="f-brand" name="brand" defaultValue={params.brand ?? ""} onChange={submit} className="field">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-min" className="label">Min. score</label>
        <select id="f-min" name="min" defaultValue={params.min ?? ""} onChange={submit} className="field">
          <option value="">Any</option>
          <option value="9">9+ Outstanding</option>
          <option value="8">8+ Excellent</option>
          <option value="7">7+ Very good</option>
          <option value="6">6+ Good</option>
          <option value="5">5+ Average</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-max" className="label">Max. price</label>
        <select id="f-max" name="max" defaultValue={params.max ?? ""} onChange={submit} className="field">
          <option value="">Any price</option>
          {[25, 50, 100, 250, 500, 1000].map((p) => <option key={p} value={p}>Under £{p}</option>)}
        </select>
      </div>
      <div className={hideCategory ? "lg:col-start-6" : ""}>
        <label htmlFor="f-sort" className="label">Sort by</label>
        <select id="f-sort" name="sort" defaultValue={params.sort ?? "newest"} onChange={submit} className="field">
          <option value="newest">Newest</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
        <button className="btn btn-ink btn-sm">Apply filters</button>
        {active && <a href={action} className="btn btn-ghost btn-sm">Clear all</a>}
      </div>
    </form>
  );
}
