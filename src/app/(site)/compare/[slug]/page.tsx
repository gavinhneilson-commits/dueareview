import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getComparisonBySlug } from "@/lib/data";
import { SITE_URL, isDemoMode } from "@/lib/env";
import { formatDate, formatPrice } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScoreChip } from "@/components/ScoreBadge";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;
// Render on first visit, then cache (ISR) — new reviews appear without a rebuild.
export const dynamicParams = true;
export async function generateStaticParams() { return []; }
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getComparisonBySlug((await params).slug);
  if (!c) return { title: "Comparison not found" };
  return { title: c.seo_title || c.title, description: c.seo_description || c.intro || undefined, alternates: { canonical: `/compare/${c.slug}` }, openGraph: { type: "article", title: c.title } };
}

export default async function ComparisonPage({ params }: Props) {
  const c = await getComparisonBySlug((await params).slug);
  if (!c) notFound();
  const items = c.items ?? [];
  const specLabels = [...new Set(items.flatMap((i) => i.specs.map((s) => s.label)))];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {!isDemoMode && <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: c.title, datePublished: c.published_at, dateModified: c.updated_at, url: `${SITE_URL}/compare/${c.slug}`, author: { "@type": "Organization", name: "Due A Review" }, publisher: { "@type": "Organization", name: "Due A Review" } }} />}
      <Breadcrumbs items={[{ href: "/compare", label: "Comparisons" }, { href: `/compare/${c.slug}`, label: c.title }]} />
      <h1 className="display text-5xl sm:text-7xl mt-6 max-w-5xl">{c.title}</h1>
      <p className="mt-3 kicker text-muted">Published {formatDate(c.published_at)}</p>
      {c.intro && <p className="mt-5 text-xl text-ink-2 max-w-3xl">{c.intro}</p>}

      {items.length > 0 && (
        <section aria-labelledby="sbs" className="mt-10">
          <h2 id="sbs" className="sr-only">Side-by-side comparison</h2>
          <div className="overflow-x-auto border-2 border-ink" tabIndex={0} role="region" aria-label="Comparison table, scroll horizontally on small screens">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-night text-night-text">
                <tr><th scope="col" className="p-4 w-44"><span className="sr-only">Attribute</span></th>
                  {items.map((i) => <th key={i.id} scope="col" className="p-4 display text-2xl align-bottom">{i.product_name}</th>)}</tr>
              </thead>
              <tbody className="[&_tr]:border-b [&_tr]:border-rule [&_th]:p-4 [&_td]:p-4 [&_td]:align-top">
                <tr className="bg-card"><th scope="row" className="font-semibold">Our score</th>{items.map((i) => <td key={i.id}><ScoreChip score={i.rating} /></td>)}</tr>
                <tr><th scope="row" className="font-semibold">Price</th>{items.map((i) => <td key={i.id} className="font-mono">{formatPrice(i.price_pence) || "—"}</td>)}</tr>
                <tr className="bg-card"><th scope="row" className="font-semibold">Best for</th>{items.map((i) => <td key={i.id} className="font-semibold">{i.best_for || "—"}</td>)}</tr>
                {specLabels.map((l, n) => (
                  <tr key={l} className={n % 2 ? "bg-card" : ""}><th scope="row" className="font-semibold">{l}</th>{items.map((i) => <td key={i.id} className="font-mono text-sm">{i.specs.find((s) => s.label === l)?.value || "—"}</td>)}</tr>
                ))}
                <tr><th scope="row" className="font-semibold">Pros</th>{items.map((i) => <td key={i.id}><ul className="space-y-1 text-sm">{i.pros.map((p) => <li key={p}><span className="text-good font-bold" aria-hidden="true">+ </span>{p}</li>)}</ul></td>)}</tr>
                <tr className="bg-card"><th scope="row" className="font-semibold">Cons</th>{items.map((i) => <td key={i.id}><ul className="space-y-1 text-sm">{i.cons.map((p) => <li key={p}><span className="text-ugly font-bold" aria-hidden="true">– </span>{p}</li>)}</ul></td>)}</tr>
                <tr><th scope="row" className="font-semibold">What we saw in testing</th>{items.map((i) => <td key={i.id} className="text-sm">{i.observations || "—"}</td>)}</tr>
                <tr className="bg-card"><th scope="row" className="font-semibold">Full review</th>{items.map((i) => <td key={i.id}>{i.review ? <Link className="underline font-semibold" href={`/reviews/${i.review.slug}`}>Read it →</Link> : "—"}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="prose-dar mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.body) }} />

      {c.recommendation && (
        <section aria-labelledby="rec" className="mt-12 border-[3px] border-ink bg-signal text-signal-ink p-6 sm:p-8 shadow-[8px_8px_0_var(--ink)] max-w-4xl">
          <p className="kicker">Our recommendation</p>
          <h2 id="rec" className="sr-only">Our recommendation</h2>
          <p className="mt-2 text-xl sm:text-2xl font-semibold">{c.recommendation}</p>
        </section>
      )}
    </div>
  );
}
