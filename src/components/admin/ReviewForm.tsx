"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { saveReview, type ActionState } from "@/app/admin/actions";
import type { Category, Review } from "@/lib/types";
import { formatScore, ratingBand, VERDICT_PRESETS } from "@/lib/rating";
import { slugify } from "@/lib/format";
import { Btn, FieldError, FormMessage, useKeepForm } from "./ui";
import { ImageField } from "./ImageField";
import { GalleryEditor, LinksEditor, SpecsEditor } from "./Repeaters";
import { StatusBadge } from "./StatusBadge";

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReviewForm({ review, categories, canPublish }: { review: Review | null; categories: Category[]; canPublish: boolean }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(saveReview, null);
  const fe = state?.fieldErrors ?? {};
  const [title, setTitle] = useState(review?.title ?? "");
  const [slug, setSlug] = useState(review?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!review);
  const [overall, setOverall] = useState(review?.overall_rating?.toString() ?? "");
  const [sponsored, setSponsored] = useState(review?.is_sponsored ?? false);
  const [scheduleAt, setScheduleAt] = useState(review?.status === "scheduled" ? toLocalInput(review.published_at) : "");
  const [shortVerdict, setShortVerdict] = useState(review?.short_verdict ?? "");
  const scheduleIso = useMemo(() => (scheduleAt ? new Date(scheduleAt).toISOString() : ""), [scheduleAt]);
  const band = overall !== "" && !Number.isNaN(Number(overall)) ? ratingBand(Number(overall)) : null;
  const status = review?.status ?? "draft";
  const isLive = status === "published" || status === "scheduled";

  const err = (k: string) => (fe[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});
  const F = ({ k }: { k: string }) => <FieldError msg={fe[k]} id={`${k}-err`} />;

  return (
    <form onSubmit={onSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]" noValidate>
      {review && <input type="hidden" name="id" value={review.id} />}
      <input type="hidden" name="publish_at_iso" value={scheduleIso} />

      <div className="space-y-8 min-w-0">
        <FormMessage state={state} />

        <Section title="The basics">
          <div><label htmlFor="title" className="label">Review title</label>
            <input id="title" name="title" className="field text-lg font-semibold" value={title} {...err("title")} required
              onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder="Kettlecraft RapidBoil 2 review: the kettle that finally shuts up" />
            <F k="title" /></div>
          <div><label htmlFor="slug" className="label">URL</label>
            <div className="flex items-center gap-1"><span className="text-muted text-sm whitespace-nowrap">/reviews/</span>
              <input id="slug" name="slug" className="field font-mono text-sm" value={slug} {...err("slug")} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} /></div>
            <p className="hint">Changing this on a live review breaks existing links. Avoid it after publishing.</p><F k="slug" /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label htmlFor="brand" className="label">Brand</label><input id="brand" name="brand" className="field" defaultValue={review?.brand ?? ""} /></div>
            <div><label htmlFor="product_name" className="label">Product name</label><input id="product_name" name="product_name" className="field" defaultValue={review?.product_name ?? ""} {...err("product_name")} required /><F k="product_name" /></div>
            <div><label htmlFor="model" className="label">Model</label><input id="model" name="model" className="field" defaultValue={review?.model ?? ""} /></div>
          </div>
          <div><label htmlFor="category_id" className="label">Category</label>
            <select id="category_id" name="category_id" className="field" defaultValue={review?.category_id ?? ""} {...err("category_id")}>
              <option value="">— Choose —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select><F k="category_id" /></div>
        </Section>

        <Section title="Images & video">
          <ImageField name="hero_image_url" label="Main product image" defaultValue={review?.hero_image_url} hint="Landscape works best (roughly 16:10). Use your own photos." />
          <div><label htmlFor="hero_image_alt" className="label">Main image alt text</label><input id="hero_image_alt" name="hero_image_alt" className="field" defaultValue={review?.hero_image_alt ?? ""} placeholder="Describe what's in the photo" /></div>
          <GalleryEditor name="gallery" initial={review?.gallery ?? []} />
          <div><label htmlFor="video_url" className="label">YouTube video URL</label><input id="video_url" name="video_url" type="url" className="field" defaultValue={review?.video_url ?? ""} placeholder="https://www.youtube.com/watch?v=… or a Shorts link" {...err("video_url")} /><F k="video_url" /></div>
        </Section>

        <Section title="Transparency" note="Shown on every review. Only state what actually happened.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="obtained_method" className="label">How did you get it?</label>
              <select id="obtained_method" name="obtained_method" className="field" defaultValue={review?.obtained_method ?? ""} {...err("obtained_method")}>
                <option value="">— Choose —</option><option value="purchased">Bought it ourselves</option><option value="loaned">Loaned by brand</option>
                <option value="gifted">Sent free by brand</option><option value="sponsored">Sponsored</option><option value="other">Other</option>
              </select><F k="obtained_method" /></div>
            <div><label htmlFor="obtained_note" className="label">Note <span className="font-normal text-muted">(optional)</span></label><input id="obtained_note" name="obtained_note" className="field" defaultValue={review?.obtained_note ?? ""} placeholder="e.g. Returned to the brand after testing" /></div>
            <div><label htmlFor="price" className="label">Price (£)</label><input id="price" name="price" inputMode="decimal" className="field" defaultValue={review?.price_pence != null ? (review.price_pence / 100).toFixed(2) : ""} {...err("price")} /><F k="price" /></div>
            <div><label htmlFor="price_note" className="label">Price label</label><input id="price_note" name="price_note" className="field" defaultValue={review?.price_note ?? ""} placeholder="Price paid / RRP at time of review" /></div>
            <div><label htmlFor="testing_duration" className="label">How long / how you tested</label><input id="testing_duration" name="testing_duration" className="field" defaultValue={review?.testing_duration ?? ""} placeholder="e.g. Three weeks of daily commuting" {...err("testing_duration")} /><F k="testing_duration" /></div>
            <div><label htmlFor="reviewed_at" className="label">Date testing finished</label><input id="reviewed_at" name="reviewed_at" type="date" className="field" defaultValue={review?.reviewed_at ?? ""} /></div>
          </div>
          <div><label htmlFor="testing_notes" className="label">Testing notes <span className="font-normal text-muted">(optional)</span></label><textarea id="testing_notes" name="testing_notes" rows={2} className="field" defaultValue={review?.testing_notes ?? ""} placeholder="What you did, what you measured, any limits of your testing" /></div>
          <label className="flex items-start gap-2"><input type="checkbox" name="is_sponsored" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} className="mt-1" /><span><strong>This is sponsored content</strong> — the brand paid for it.</span></label>
          {sponsored && <div><label htmlFor="sponsor_disclosure" className="label">Sponsor disclosure (shown at the top)</label><textarea id="sponsor_disclosure" name="sponsor_disclosure" rows={2} className="field" defaultValue={review?.sponsor_disclosure ?? ""} placeholder="Paid partnership with [Brand]. They didn't see this review before it was published and had no say over the score." {...err("sponsor_disclosure")} /><F k="sponsor_disclosure" /></div>}
        </Section>

        <Section title="The review">
          <div><label htmlFor="short_verdict" className="label">Short verdict <span className="font-normal text-muted">({shortVerdict.length}/240)</span></label>
            <textarea id="short_verdict" name="short_verdict" rows={2} maxLength={240} className="field" value={shortVerdict} onChange={(e) => setShortVerdict(e.target.value)} placeholder="One or two punchy sentences. Shown on cards and in search results." {...err("short_verdict")} /><F k="short_verdict" /></div>
          <div><label htmlFor="body" className="label">Written review</label>
            <textarea id="body" name="body" rows={18} className="field font-mono text-sm leading-relaxed" defaultValue={review?.body ?? ""} {...err("body")} />
            <details className="hint mt-2"><summary className="cursor-pointer font-semibold">Formatting help</summary>
              <pre className="mt-2 whitespace-pre-wrap bg-paper-2 p-3 text-xs">{`## Heading     ### Smaller heading
**bold**  *italic*  [link text](https://…)
- bullet point        1. numbered
> a pull quote
---  (divider)

Label facts, tests and opinions (Honesty Policy):
> [!fact]
> The manufacturer claims 8 hours of battery.

> [!test]
> We got 5 hours 40 minutes at 50% volume.

> [!opinion]
> For £149, that's not good enough.`}</pre></details>
            <F k="body" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="pros" className="label">Pros <span className="font-normal text-muted">(one per line)</span></label><textarea id="pros" name="pros" rows={5} className="field" defaultValue={(review?.pros ?? []).join("\n")} /></div>
            <div><label htmlFor="cons" className="label">Cons <span className="font-normal text-muted">(one per line)</span></label><textarea id="cons" name="cons" rows={5} className="field" defaultValue={(review?.cons ?? []).join("\n")} /></div>
          </div>
          <SpecsEditor name="specs" initial={review?.specs ?? []} />
          <div><label htmlFor="final_verdict" className="label">Final verdict</label><textarea id="final_verdict" name="final_verdict" rows={3} className="field" defaultValue={review?.final_verdict ?? ""} /></div>
          <LinksEditor name="retailer_links" initial={review?.retailer_links ?? []} />
        </Section>

        <Section title="SEO" note="Optional. Sensible defaults are used if left blank.">
          <div><label htmlFor="seo_title" className="label">SEO title</label><input id="seo_title" name="seo_title" maxLength={70} className="field" defaultValue={review?.seo_title ?? ""} placeholder={title} /></div>
          <div><label htmlFor="seo_description" className="label">Meta description</label><textarea id="seo_description" name="seo_description" maxLength={160} rows={2} className="field" defaultValue={review?.seo_description ?? ""} placeholder={shortVerdict} /></div>
          <ImageField name="og_image_url" label="Social share image (optional)" defaultValue={review?.og_image_url} hint="Leave blank to auto-generate a share card with the score." />
        </Section>
      </div>

      {/* ── Sidebar ─────────────────────────────── */}
      <div className="space-y-6 xl:sticky xl:top-6 h-fit">
        <Section title="Publish">
          <p className="flex items-center gap-2 text-sm">Status: <StatusBadge status={status} publishedAt={review?.published_at} /></p>
          {review && <Link href={`/admin/reviews/${review.id}/preview`} target="_blank" className="btn btn-ghost btn-sm w-full">Preview ↗</Link>}
          <Btn pending={pending} name="intent" value="save" className="btn btn-ink w-full">{isLive ? "Save changes (stays live)" : "Save draft"}</Btn>
          {canPublish ? (
            <>
              {status !== "published" && <Btn pending={pending} name="intent" value="publish" className="btn btn-primary w-full" pendingText="Publishing…">Publish now</Btn>}
              <div className="border-t border-rule pt-3">
                <label htmlFor="schedule" className="label">Schedule for</label>
                <input id="schedule" type="datetime-local" className="field text-sm" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} {...err("publish_at")} />
                <F k="publish_at" />
                <Btn pending={pending} name="intent" value="schedule" className="btn btn-ghost btn-sm w-full mt-2" disabled={!scheduleAt}>Schedule</Btn>
              </div>
              {isLive && <Btn pending={pending} name="intent" value="unpublish" className="btn btn-ghost btn-sm w-full" >Unpublish</Btn>}
            </>
          ) : <p className="hint">Contributors can save drafts. An editor will review, approve the score and publish.</p>}
          <p className="hint">Nothing goes live until a human approves the score and presses publish.</p>
        </Section>

        <Section title="Score">
          <div className="flex items-end gap-3">
            <div className="flex-1"><label htmlFor="overall_rating" className="label">Overall (0–10)</label>
              <input id="overall_rating" name="overall_rating" type="number" step="0.1" min="0" max="10" inputMode="decimal" className="field font-mono text-2xl font-bold" value={overall} onChange={(e) => setOverall(e.target.value)} {...err("overall_rating")} /></div>
            <div className="pb-2 text-sm font-bold min-w-24">{band ? <>{formatScore(Number(overall))} · {band.label}</> : <span className="text-muted">No score</span>}</div>
          </div>
          <F k="overall_rating" />
          {(["performance_rating", "value_rating", "build_rating"] as const).map((k) => (
            <div key={k}><label htmlFor={k} className="label">{k === "performance_rating" ? "Performance" : k === "value_rating" ? "Value for money" : "Build quality (optional)"}</label>
              <input id={k} name={k} type="number" step="0.1" min="0" max="10" className="field font-mono" defaultValue={review?.[k]?.toString() ?? ""} {...err(k)} /><F k={k} /></div>
          ))}
          <label className={`flex items-start gap-2 border-2 p-3 ${fe.rating_approved ? "border-ugly" : "border-ink"} ${!canPublish ? "opacity-60" : ""}`}>
            <input type="checkbox" name="rating_approved" defaultChecked={review?.rating_approved} disabled={!canPublish} className="mt-1" aria-describedby="rating_approved-err" />
            <span className="text-sm"><strong>I approve this score.</strong> It reflects our genuine testing, judged against the product’s price and purpose.</span>
          </label>
          {!canPublish && review?.rating_approved && <input type="hidden" name="rating_approved" value="on" />}
          <F k="rating_approved" />
          <div><label htmlFor="verdict_label" className="label">Verdict label</label>
            <input id="verdict_label" name="verdict_label" list="verdicts" maxLength={40} className="field" defaultValue={review?.verdict_label ?? ""} placeholder="Pick or write your own" />
            <datalist id="verdicts">{VERDICT_PRESETS.map((v) => <option key={v} value={v} />)}</datalist></div>
        </Section>

        <Section title="Placement">
          <div><label htmlFor="collection" className="label">Good / Bad / Ugly</label>
            <select id="collection" name="collection" className="field" defaultValue={review?.collection ?? ""}>
              <option value="">None</option><option value="good">The Good</option><option value="bad">The Bad</option><option value="ugly">The Ugly</option>
            </select></div>
          <label className="flex items-center gap-2"><input type="checkbox" name="worth_your_money" defaultChecked={review?.worth_your_money} /> Worth Your Money pick</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={review?.featured} /> Featured</label>
        </Section>
      </div>
    </form>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-2 border-ink bg-card p-5 space-y-4">
      <div><h2 className="display text-2xl">{title}</h2>{note && <p className="hint !mt-0">{note}</p>}</div>
      {children}
    </section>
  );
}
