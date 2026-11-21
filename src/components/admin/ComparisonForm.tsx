"use client";
import { useMemo, useState } from "react";
import { saveComparison, type ActionState } from "@/app/admin/actions";
import type { Comparison, Spec } from "@/lib/types";
import { slugify } from "@/lib/format";
import { Btn, FormMessage, useKeepForm } from "./ui";
import { StatusBadge } from "./StatusBadge";

type Opt = { id: string; title: string; overall_rating: number | null; price_pence: number | null; product_name: string; brand: string | null };
type Item = { review_id: string; product_name: string; price: string; rating: string; pros: string; cons: string; specs: Spec[]; observations: string; best_for: string; image_url: string };

const blank = (): Item => ({ review_id: "", product_name: "", price: "", rating: "", pros: "", cons: "", specs: [], observations: "", best_for: "", image_url: "" });

export function ComparisonForm({ comparison, reviews }: { comparison: Comparison | null; reviews: Opt[] }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(saveComparison, null);
  const [title, setTitle] = useState(comparison?.title ?? "");
  const [slug, setSlug] = useState(comparison?.slug ?? "");
  const [scheduleAt, setScheduleAt] = useState("");
  const [items, setItems] = useState<Item[]>(
    comparison?.items?.length ? comparison.items.map((i) => ({
      review_id: i.review_id ?? "", product_name: i.product_name, price: i.price_pence != null ? (i.price_pence / 100).toFixed(2) : "",
      rating: i.rating != null ? String(i.rating) : "", pros: i.pros.join("\n"), cons: i.cons.join("\n"), specs: i.specs,
      observations: i.observations ?? "", best_for: i.best_for ?? "", image_url: i.image_url ?? "",
    })) : [blank(), blank()],
  );
  const iso = useMemo(() => (scheduleAt ? new Date(scheduleAt).toISOString() : ""), [scheduleAt]);
  const set = (i: number, patch: Partial<Item>) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const fromReview = (i: number, id: string) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return set(i, { review_id: "" });
    set(i, { review_id: id, product_name: items[i].product_name || [r.brand, r.product_name].filter(Boolean).join(" "),
      rating: items[i].rating || (r.overall_rating != null ? String(r.overall_rating) : ""), price: items[i].price || (r.price_pence != null ? (r.price_pence / 100).toFixed(2) : "") });
  };
  const status = comparison?.status ?? "draft";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {comparison && <input type="hidden" name="id" value={comparison.id} />}
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="publish_at_iso" value={iso} />
      <FormMessage state={state} />
      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div><label htmlFor="ct" className="label">Title</label><input id="ct" name="title" value={title} onChange={(e) => { setTitle(e.target.value); if (!comparison) setSlug(slugify(e.target.value)); }} className="field" placeholder="Budget vs Premium — is the extra money worth it?" required /></div>
          <div><label htmlFor="ck" className="label">Type</label>
            <select id="ck" name="kind" defaultValue={comparison?.kind ?? "versus"} className="field"><option value="versus">A vs B</option><option value="best_under">Best under £X</option><option value="budget_vs_premium">Budget vs premium</option><option value="guide">Buying guide</option></select></div>
        </div>
        <div><label htmlFor="cs" className="label">URL</label><div className="flex items-center gap-1"><span className="text-sm text-muted">/compare/</span><input id="cs" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="field font-mono text-sm" /></div></div>
        <div><label htmlFor="ci" className="label">Intro</label><textarea id="ci" name="intro" rows={2} defaultValue={comparison?.intro ?? ""} className="field" /></div>
      </section>

      <section className="space-y-4">
        <h2 className="display text-3xl">Products</h2>
        <p className="hint !mt-0">Only include results from testing you’ve actually done. Link each product to its review where one exists.</p>
        {items.map((it, i) => (
          <div key={i} className="border-2 border-ink bg-card p-5 space-y-3">
            <div className="flex justify-between items-center"><span className="display text-2xl">Product {i + 1}</span>
              <span className="flex gap-1">
                {i > 0 && <button type="button" className="btn btn-ghost btn-sm" aria-label="Move up" onClick={() => { const a = [...items]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setItems(a); }}>↑</button>}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>Remove</button>
              </span></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label text-sm" htmlFor={`r${i}`}>Linked review</label><select id={`r${i}`} value={it.review_id} onChange={(e) => fromReview(i, e.target.value)} className="field text-sm"><option value="">None</option>{reviews.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
              <div><label className="label text-sm" htmlFor={`n${i}`}>Product name</label><input id={`n${i}`} value={it.product_name} onChange={(e) => set(i, { product_name: e.target.value })} className="field text-sm" /></div>
              <div><label className="label text-sm" htmlFor={`p${i}`}>Price (£)</label><input id={`p${i}`} value={it.price} onChange={(e) => set(i, { price: e.target.value })} className="field text-sm" inputMode="decimal" /></div>
              <div><label className="label text-sm" htmlFor={`s${i}`}>Score (0–10)</label><input id={`s${i}`} value={it.rating} onChange={(e) => set(i, { rating: e.target.value })} className="field text-sm" inputMode="decimal" /></div>
              <div><label className="label text-sm" htmlFor={`pr${i}`}>Pros (one per line)</label><textarea id={`pr${i}`} rows={3} value={it.pros} onChange={(e) => set(i, { pros: e.target.value })} className="field text-sm" /></div>
              <div><label className="label text-sm" htmlFor={`co${i}`}>Cons (one per line)</label><textarea id={`co${i}`} rows={3} value={it.cons} onChange={(e) => set(i, { cons: e.target.value })} className="field text-sm" /></div>
              <div><label className="label text-sm" htmlFor={`b${i}`}>Best suited to</label><input id={`b${i}`} value={it.best_for} onChange={(e) => set(i, { best_for: e.target.value })} className="field text-sm" placeholder="e.g. Commuters on a budget" /></div>
              <div><label className="label text-sm" htmlFor={`o${i}`}>Testing observations</label><textarea id={`o${i}`} rows={2} value={it.observations} onChange={(e) => set(i, { observations: e.target.value })} className="field text-sm" /></div>
            </div>
            <div>
              <p className="label text-sm">Specs (use the same labels across products so rows line up)</p>
              {it.specs.map((s, k) => (
                <div key={k} className="flex gap-2 mb-2">
                  <input aria-label="Spec label" value={s.label} onChange={(e) => set(i, { specs: it.specs.map((x, m) => (m === k ? { ...x, label: e.target.value } : x)) })} className="field text-sm" placeholder="Label" />
                  <input aria-label="Spec value" value={s.value} onChange={(e) => set(i, { specs: it.specs.map((x, m) => (m === k ? { ...x, value: e.target.value } : x)) })} className="field text-sm" placeholder="Value" />
                  <button type="button" className="btn btn-ghost btn-sm" aria-label="Remove spec" onClick={() => set(i, { specs: it.specs.filter((_, m) => m !== k) })}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => set(i, { specs: [...it.specs, { label: "", value: "" }] })}>+ Spec</button>
              {i > 0 && items[0].specs.length > 0 && <button type="button" className="btn btn-ghost btn-sm ml-2" onClick={() => set(i, { specs: items[0].specs.map((s) => ({ label: s.label, value: it.specs.find((x) => x.label === s.label)?.value ?? "" })) })}>Copy labels from product 1</button>}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setItems([...items, blank()])}>+ Add product</button>
      </section>

      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <div><label htmlFor="cb" className="label">Article body (Markdown)</label><textarea id="cb" name="body" rows={10} defaultValue={comparison?.body ?? ""} className="field font-mono text-sm" /></div>
        <div><label htmlFor="cr" className="label">Overall recommendation</label><textarea id="cr" name="recommendation" rows={3} defaultValue={comparison?.recommendation ?? ""} className="field" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="st" className="label">SEO title</label><input id="st" name="seo_title" defaultValue={comparison?.seo_title ?? ""} className="field" /></div>
          <div><label htmlFor="sd" className="label">Meta description</label><input id="sd" name="seo_description" defaultValue={comparison?.seo_description ?? ""} className="field" /></div>
        </div>
      </section>

      <section className="border-2 border-ink bg-card p-5 flex flex-wrap items-end gap-3">
        <p className="w-full flex items-center gap-2 text-sm">Status: <StatusBadge status={status} publishedAt={comparison?.published_at} /></p>
        <Btn pending={pending} name="intent" value="save">Save</Btn>
        {status !== "published" && <Btn pending={pending} name="intent" value="publish" className="btn btn-primary">Publish now</Btn>}
        <div><label htmlFor="sch" className="label text-sm">Schedule for</label><input id="sch" type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="field text-sm" /></div>
        <Btn pending={pending} name="intent" value="schedule" className="btn btn-ghost" disabled={!scheduleAt}>Schedule</Btn>
        {(status === "published" || status === "scheduled") && <Btn pending={pending} name="intent" value="unpublish" className="btn btn-ghost">Unpublish</Btn>}
      </section>
    </form>
  );
}
