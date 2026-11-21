import Link from "next/link";
import type { Review, ReviewUpdate } from "@/lib/types";
import { formatDate, formatPrice, OBTAINED_LABELS } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { youtubeId, isShortUrl } from "@/lib/youtube";
import { ProductImage } from "./ProductImage";
import { ScoreMeter, ScoreStamp } from "./ScoreBadge";
import { CollectionTag, VerdictTag } from "./VerdictTag";
import { YouTubeEmbed } from "./YouTubeEmbed";

export function ReviewArticle({ review, updates, disclosure, sponsoredText, share }: {
  review: Review; updates: ReviewUpdate[]; disclosure: string; sponsoredText: string; share?: React.ReactNode;
}) {
  const vid = youtubeId(review.video_url);
  const lastUpdated = review.updated_at && review.published_at && new Date(review.updated_at).getTime() - new Date(review.published_at).getTime() > 86400000
    ? review.updated_at : null;

  return (
    <article>
      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          {review.category && <Link href={`/category/${review.category.slug}`} className="kicker bg-ink text-paper px-2 py-1 hover:bg-signal hover:text-signal-ink">{review.category.name}</Link>}
          <CollectionTag c={review.collection} />
          {review.is_sample && <span className="kicker border border-ink px-2 py-1">Sample content</span>}
        </div>
        <h1 className="display text-5xl sm:text-7xl mt-4">{review.title}</h1>
        {review.short_verdict && <p className="mt-5 text-xl sm:text-2xl text-ink-2 leading-snug max-w-3xl">{review.short_verdict}</p>}
        <p className="mt-5 kicker text-muted flex flex-wrap gap-x-4 gap-y-1">
          <span>By the Due A Review team</span>
          {review.published_at && <span>Published <time dateTime={review.published_at}>{formatDate(review.published_at)}</time></span>}
          {lastUpdated && <span>Updated <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time></span>}
        </p>
      </header>

      {/* Compact score up top on small screens (the full panel sits in the sidebar on desktop) */}
      {review.overall_rating !== null && (
        <div className="mt-6 flex items-center gap-4 border-2 border-ink bg-card p-4 lg:hidden">
          <ScoreStamp score={review.overall_rating} verdict={review.verdict_label} size="md" />
          <div className="min-w-0">
            {review.verdict_label && <VerdictTag label={review.verdict_label} />}
            {review.price_pence !== null && <p className="mt-2 font-mono text-sm">{formatPrice(review.price_pence)}</p>}
            <a href="#score-panel" className="mt-2 inline-block text-sm underline">Score breakdown ↓</a>
          </div>
        </div>
      )}

      {review.is_sponsored && (
        <div role="note" className="mt-6 border-2 border-ink bg-signal text-signal-ink p-4 font-semibold max-w-4xl">
          <span className="kicker block">Sponsored</span>
          {review.sponsor_disclosure || sponsoredText}
        </div>
      )}
      {review.has_affiliate_links && (
        <p role="note" className="mt-4 text-sm text-muted max-w-4xl border-l-4 border-signal pl-3">{disclosure} <Link href="/legal/affiliate-disclosure" className="underline">More info</Link>.</p>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="aspect-[16/10] border-2 border-ink overflow-hidden">
            <ProductImage src={review.hero_image_url} alt={review.hero_image_alt} name={review.product_name} brand={review.brand} priority />
          </div>
          {review.gallery.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {review.gallery.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <li key={g.url} className="aspect-square border-2 border-ink overflow-hidden"><img src={g.url} alt={g.alt} loading="lazy" className="h-full w-full object-cover" /></li>
              ))}
            </ul>
          )}

          {/* How we tested — always visible, never invented */}
          <section aria-labelledby="how-tested" className="mt-10 border-2 border-ink bg-card p-6">
            <h2 id="how-tested" className="display text-3xl">How we tested it</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
              <div><dt className="kicker text-muted">How we got it</dt><dd className="mt-1 font-semibold">{review.obtained_method ? OBTAINED_LABELS[review.obtained_method] : "Not stated"}</dd>{review.obtained_note && <dd className="text-muted mt-1">{review.obtained_note}</dd>}</div>
              <div><dt className="kicker text-muted">Testing</dt><dd className="mt-1 font-semibold">{review.testing_duration || "Not stated"}</dd></div>
              <div><dt className="kicker text-muted">{review.price_note || "Price"}</dt><dd className="mt-1 font-semibold">{formatPrice(review.price_pence) || "Not stated"}</dd></div>
            </dl>
            {review.testing_notes && <p className="mt-4 text-ink-2">{review.testing_notes}</p>}
          </section>

          {vid && (
            <section aria-labelledby="watch" className="mt-10">
              <h2 id="watch" className="display text-3xl mb-4">Watch the review</h2>
              <YouTubeEmbed id={vid} title={`${review.title} — video`} vertical={isShortUrl(review.video_url)} />
            </section>
          )}

          <div className="prose-dar mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(review.body) }} />

          {(review.pros.length > 0 || review.cons.length > 0) && (
            <section aria-label="Pros and cons" className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="border-2 border-ink bg-good-bg p-5">
                <h2 className="display text-3xl text-good">The good</h2>
                <ul className="mt-3 space-y-2">{review.pros.map((p) => <li key={p} className="flex gap-2"><span aria-hidden="true" className="font-bold text-good">+</span><span>{p}</span></li>)}</ul>
              </div>
              <div className="border-2 border-ink bg-ugly-bg p-5">
                <h2 className="display text-3xl text-ugly">The bad</h2>
                <ul className="mt-3 space-y-2">{review.cons.map((c) => <li key={c} className="flex gap-2"><span aria-hidden="true" className="font-bold text-ugly">–</span><span>{c}</span></li>)}</ul>
              </div>
            </section>
          )}

          {review.specs.length > 0 && (
            <section aria-labelledby="specs" className="mt-12">
              <h2 id="specs" className="display text-3xl">Key specs</h2>
              <table className="mt-4 w-full border-2 border-ink text-left">
                <caption className="sr-only">Key specifications for {review.product_name}</caption>
                <tbody>
                  {review.specs.map((s) => (
                    <tr key={s.label} className="border-b border-rule last:border-0 odd:bg-card">
                      <th scope="row" className="p-3 font-semibold w-2/5">{s.label}</th><td className="p-3 font-mono text-sm">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {review.final_verdict && (
            <section aria-labelledby="verdict" className="mt-12 border-[3px] border-ink bg-night text-night-text p-6 sm:p-8 relative">
              <p className="kicker text-signal">Final verdict</p>
              <h2 id="verdict" className="display text-4xl sm:text-5xl mt-2">{review.verdict_label || "The verdict"}</h2>
              <p className="mt-4 text-lg text-night-text/90 max-w-2xl">{review.final_verdict}</p>
            </section>
          )}

          {review.retailer_links.length > 0 && (
            <section aria-labelledby="where" className="mt-12">
              <h2 id="where" className="display text-3xl">Where to buy</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {review.retailer_links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel={`noopener ${l.affiliate ? "sponsored nofollow" : "nofollow"}`} className="btn btn-ghost w-full justify-between">
                      <span>{l.name}</span><span className="text-xs font-normal text-muted">{l.affiliate ? "Affiliate link ↗" : "↗"}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">Prices change. Check the retailer for the current price.</p>
            </section>
          )}

          {updates.length > 0 && (
            <section aria-labelledby="updates" className="mt-12">
              <h2 id="updates" className="display text-3xl">Update history</h2>
              <ol className="mt-4 border-l-2 border-ink pl-5 space-y-4">
                {updates.map((u) => (
                  <li key={u.id}>
                    <p className="kicker text-muted"><time dateTime={u.created_at}>{formatDate(u.created_at)}</time>{u.is_correction && <span className="ml-2 bg-ugly-bg text-ugly px-1">Correction</span>}</p>
                    <p className="mt-1">{u.note}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="mt-12 border-t-2 border-ink pt-6 space-y-4">
            {share}
            <p className="text-sm text-muted">Spotted a factual error, or are you the brand and want to respond? <Link href="/contact?type=brand_response" className="underline">Tell us</Link>. We correct genuine mistakes openly; we don’t change opinions on request.</p>
          </div>
        </div>

        {/* Sticky score panel */}
        <aside id="score-panel" aria-label="Score summary" className="lg:sticky lg:top-24 h-fit space-y-6">
          <div className="border-2 border-ink bg-card p-6">
            {review.overall_rating !== null ? (
              <div className="flex justify-center"><ScoreStamp score={review.overall_rating} verdict={review.verdict_label} /></div>
            ) : <p className="text-muted">Not yet scored.</p>}
            {review.verdict_label && <div className="mt-6 text-center"><VerdictTag label={review.verdict_label} className="text-sm" /></div>}
            <div className="mt-6 space-y-4">
              <ScoreMeter label="Performance" score={review.performance_rating} />
              <ScoreMeter label="Value for money" score={review.value_rating} />
              <ScoreMeter label="Build quality" score={review.build_rating} />
            </div>
            <p className="mt-6 text-xs text-muted">Scores reflect performance relative to the product’s intended purpose and price. <Link href="/how-we-score" className="underline">How we score</Link>.</p>
          </div>
          <dl className="border-2 border-ink bg-card p-6 grid grid-cols-2 gap-4 text-sm">
            {review.brand && <div><dt className="kicker text-muted">Brand</dt><dd className="font-semibold mt-1">{review.brand}</dd></div>}
            {review.model && <div><dt className="kicker text-muted">Model</dt><dd className="font-semibold mt-1">{review.model}</dd></div>}
            {review.price_pence !== null && <div><dt className="kicker text-muted">Price</dt><dd className="font-semibold mt-1">{formatPrice(review.price_pence)}</dd></div>}
            {review.reviewed_at && <div><dt className="kicker text-muted">Reviewed</dt><dd className="font-semibold mt-1">{formatDate(review.reviewed_at)}</dd></div>}
          </dl>
          {review.retailer_links[0] && (
            <a href={review.retailer_links[0].url} target="_blank" rel={`noopener ${review.retailer_links[0].affiliate ? "sponsored nofollow" : "nofollow"}`} className="btn btn-primary w-full">
              Check price at {review.retailer_links[0].name}
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}
