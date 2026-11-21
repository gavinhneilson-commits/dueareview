import Link from "next/link";
import { getFeaturedReviews, getLatestReviews, getReviewsByIds, getSettings, getVideos, searchReviews } from "@/lib/data";
import { isDemoMode, SITE_URL } from "@/lib/env";
import { formatScore, RATING_RANGES } from "@/lib/rating";
import { displayName, formatPrice } from "@/lib/format";
import type { Review } from "@/lib/types";
import { ReviewGrid } from "@/components/ReviewCard";
import { ProductImage } from "@/components/ProductImage";
import { ScoreChip, ScoreStamp } from "@/components/ScoreBadge";
import { VerdictTag } from "@/components/VerdictTag";
import { SectionHeading } from "@/components/SectionHeading";
import { NewsletterForm } from "@/components/NewsletterForm";
import { VideoCard } from "@/components/VideoCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSettings();
  const [latest, featured, good, bad, ugly, worth, videos] = await Promise.all([
    getLatestReviews(6),
    settings.homepage.featured_review_ids.length ? getReviewsByIds(settings.homepage.featured_review_ids) : getFeaturedReviews(3),
    searchReviews({ collection: "good", pageSize: 3, sort: "highest" }).then((p) => p.items),
    searchReviews({ collection: "bad", pageSize: 3 }).then((p) => p.items),
    searchReviews({ collection: "ugly", pageSize: 3, sort: "lowest" }).then((p) => p.items),
    searchReviews({ worth: true, pageSize: 4, sort: "highest" }).then((p) => p.items),
    getVideos(3),
  ]);
  const hero =
    (settings.homepage.hero_review_id && (await getReviewsByIds([settings.homepage.hero_review_id]))[0]) || featured[0] || latest[0] || null;
  const yt = settings.social.youtube;

  return (
    <>
      {!isDemoMode && (
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "Organization", name: "Due A Review", url: SITE_URL, logo: `${SITE_URL}/brand/mark.svg`,
          sameAs: Object.values(settings.social).filter(Boolean),
        }} />
      )}

      {/* ── HERO ──────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 py-12 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="kicker text-signal-text">Independent UK reviews · Est. 2026</p>
            <h1 id="hero-title" className="display mt-4 text-[3.4rem] sm:text-[5rem] xl:text-[6.4rem]">
              If it’s <span className="text-good">brilliant</span>, we’ll tell you.{" "}
              <span className="block mt-2">
                If it’s{" "}
                <span className="inline-block -rotate-3 bg-signal text-signal-ink px-2 border-[3px] border-ink shadow-[5px_5px_0_var(--ink)]">shite</span>,
                we’ll tell you that too.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink-2">
              Welcome to Due A Review. Proper reviews, honest opinions and absolutely no sugar-coating. We put products to the test so you know what’s worth your hard-earned money — and what’s better left on the shelf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/reviews" className="btn btn-primary text-lg">Explore Reviews</Link>
              {yt ? (
                <a href={yt} target="_blank" rel="noopener" className="btn btn-ink text-lg">
                  <svg width="18" height="18" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg>Watch on YouTube
                </a>
              ) : (
                <Link href="/videos" className="btn btn-ink text-lg">Watch the videos</Link>
              )}
            </div>
          </div>
          {hero ? <HeroReview review={hero} /> : <ScaleCard />}
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <div className="overflow-hidden bg-night text-night-text py-3 border-b-2 border-ink" aria-hidden="true">
        <div className="marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0">
              {["No hype", "No favourites", "Just honest reviews", "You can’t buy a good review", "Real products", "Real testing", "Real opinions", "Because your money deserves better"].map((t) => (
                <span key={t} className="display text-2xl px-6 flex items-center gap-6">{t}<span className="text-signal">✕</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── LATEST ──────────────────────────────────────── */}
        <section aria-labelledby="latest" className="pt-20">
          <SectionHeading id="latest" kicker="Fresh off the test bench" title="Latest reviews" href="/reviews" linkLabel="All reviews" />
          {latest.length ? <ReviewGrid reviews={latest} priorityFirst={!hero} /> : <EmptyState text="No reviews published yet. The first verdicts are on their way." />}
        </section>

        {/* ── GOOD / BAD / UGLY ───────────────────────────── */}
        <section aria-labelledby="gbu" className="pt-24">
          <SectionHeading id="gbu" kicker="Our signature verdicts" title={<>The Good, The Bad <span className="text-signal-text">&</span> The Ugly</>} />
          <div className="grid gap-6 lg:grid-cols-3">
            <GbuColumn tone="good" title="The Good" blurb="Products that genuinely impressed us." items={good} />
            <GbuColumn tone="bad" title="The Bad" blurb="Disappointed us or failed to deliver." items={bad} />
            <GbuColumn tone="ugly" title="The Ugly" blurb="Poor value, questionable claims or serious shortcomings." items={ugly} />
          </div>
          <p className="mt-4 text-sm text-muted">Every product here was judged against its price and what it promised — not against things it was never meant to be.</p>
        </section>

        {/* ── WORTH YOUR MONEY ────────────────────────────── */}
        <section aria-labelledby="worth" className="pt-24">
          <SectionHeading id="worth" kicker="Value champions" title="Worth your money?" href="/worth-your-money" linkLabel="All value picks" />
          {worth.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {worth.map((r) => (
                <Link key={r.id} href={`/reviews/${r.slug}`} className="group lift relative flex flex-col border-2 border-ink bg-card p-5">
                  <span className="kicker text-muted">{r.category?.name}</span>
                  <span className="display-wide mt-2 text-xl leading-tight">{displayName(r)}</span>
                  <span className="mt-auto pt-6 flex items-end justify-between">
                    <span>
                      <span className="block kicker text-muted">Price</span>
                      <span className="display text-4xl">{formatPrice(r.price_pence) || "—"}</span>
                    </span>
                    <ScoreChip score={r.overall_rating} />
                  </span>
                  <span className="absolute -top-3 right-4 stamp bg-good text-paper kicker px-2 py-1 border-2 border-ink">Worth it</span>
                </Link>
              ))}
            </div>
          ) : <EmptyState text="Value picks will appear here once reviews are tagged as ‘Worth Your Money’." />}
        </section>

        {/* ── VIDEOS ──────────────────────────────────────── */}
        <section aria-labelledby="videos" className="pt-24">
          <SectionHeading id="videos" kicker="Watch us test it" title="Latest videos" href="/videos" linkLabel="All videos" />
          {videos.length ? (
            <div className="grid gap-6 md:grid-cols-3">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
          ) : (
            <div className="border-2 border-ink bg-card p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-lg">Video reviews live on our YouTube channel.</p>
              {yt ? <a href={yt} className="btn btn-primary" target="_blank" rel="noopener">Subscribe on YouTube</a> : <span className="text-muted text-sm">Channel link coming soon.</span>}
            </div>
          )}
        </section>

        {/* ── PROMISE ─────────────────────────────────────── */}
        <section aria-labelledby="promise" className="pt-24">
          <div className="border-2 border-ink bg-night text-night-text p-8 sm:p-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="kicker text-signal">Our promise</p>
              <h2 id="promise" className="display text-5xl sm:text-7xl mt-2">You can’t buy a good review.</h2>
              <p className="mt-4 text-xl text-night-text/80">You can only earn one.</p>
              <Link href="/our-promise" className="btn btn-primary mt-8">Read the full promise</Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2">
              {[
                ["Independent", "Brands can’t pay for scores. Free samples don’t buy favours. If a brand doesn’t like the verdict, tough."],
                ["Transparent", "Every review says how we got the product, what we paid and how we tested it — and only what actually happened."],
                ["Fair", "A £50 product isn’t marked down for not being a £500 one. We judge things on their price, purpose and promises."],
                ["Accountable", "We fix mistakes in the open and log every significant update on the review itself."],
              ].map(([t, d]) => (
                <li key={t} className="border-t-2 border-signal pt-4">
                  <h3 className="display text-3xl">{t}</h3>
                  <p className="mt-2 text-night-text/80">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted">Some links on this site are affiliate links. They pay us a small commission if you buy, at no cost to you, and they never influence our scores. <Link className="underline" href="/legal/affiliate-disclosure">How we make money</Link>.</p>
        </section>

        {/* ── NEWSLETTER ──────────────────────────────────── */}
        <section aria-labelledby="newsletter" className="pt-24">
          <div className="grid gap-8 border-2 border-ink bg-signal p-8 sm:p-12 lg:grid-cols-2 lg:items-center text-signal-ink shadow-[8px_8px_0_var(--ink)]">
            <h2 id="newsletter" className="display text-5xl sm:text-6xl">The Good, The Bad & The Downright Ridiculous — straight to your inbox.</h2>
            <div className="bg-card text-ink border-2 border-ink p-5"><NewsletterForm enabled={!!process.env.BUTTONDOWN_API_KEY} /></div>
          </div>
        </section>
      </div>
    </>
  );
}

function HeroReview({ review }: { review: Review }) {
  return (
    <Link href={`/reviews/${review.slug}`} className="group relative block">
      <div className="relative border-[3px] border-ink bg-card shadow-[10px_10px_0_var(--ink)] transition group-hover:shadow-[14px_14px_0_var(--ink)]">
        <div className="relative aspect-[4/3] border-b-[3px] border-ink overflow-hidden">
          <ProductImage src={review.hero_image_url} alt={review.hero_image_alt} name={review.product_name} brand={review.brand} priority />
          <span className="absolute top-3 left-3 kicker bg-ink text-paper px-2 py-1">{review.is_sample ? "Sample · " : ""}Featured review</span>
        </div>
        <div className="p-5 pr-40 sm:pr-44 min-h-36">
          <p className="kicker text-muted">{review.category?.name}</p>
          <p className="display-wide text-2xl leading-tight mt-1">{displayName(review)}</p>
          {review.short_verdict && <p className="mt-2 text-ink-2 text-[0.95rem] leading-snug line-clamp-3">{review.short_verdict}</p>}
        </div>
      </div>
      {review.overall_rating !== null && (
        <div className="absolute -bottom-6 right-4 sm:right-6 rotate-[5deg] stamp">
          <ScoreStamp score={review.overall_rating} verdict={review.verdict_label} size="md" />
        </div>
      )}
    </Link>
  );
}

function ScaleCard() {
  return (
    <div className="border-[3px] border-ink bg-card p-6 shadow-[10px_10px_0_var(--ink)]">
      <p className="kicker text-muted">How we score</p>
      <ul className="mt-4 space-y-2">
        {RATING_RANGES.map((r) => (
          <li key={r.range} className="flex items-center justify-between border-b border-rule pb-2">
            <span className="font-mono font-bold">{r.range}</span><span className="display text-2xl">{r.label}</span>
          </li>
        ))}
      </ul>
      <Link href="/how-we-score" className="mt-4 inline-block font-bold underline">What the numbers mean →</Link>
    </div>
  );
}

const TONE = {
  good: { head: "bg-good text-paper", ring: "border-good" },
  bad: { head: "bg-bad-bg text-bad", ring: "border-bad" },
  ugly: { head: "bg-ugly text-paper", ring: "border-ugly" },
};

function GbuColumn({ tone, title, blurb, items }: { tone: "good" | "bad" | "ugly"; title: string; blurb: string; items: Review[] }) {
  return (
    <div className="flex flex-col border-2 border-ink bg-card">
      <div className={`border-b-2 border-ink p-5 ${TONE[tone].head}`}>
        <h3 className="display text-5xl">{title}</h3>
        <p className="mt-1 font-semibold">{blurb}</p>
      </div>
      <ol className="flex-1 divide-y-2 divide-rule">
        {items.length ? items.map((r, i) => (
          <li key={r.id}>
            <Link href={`/reviews/${r.slug}`} className="group flex items-start gap-4 p-4 hover:bg-paper-2 transition-colors">
              <span className="display text-4xl text-muted w-6" aria-hidden="true">{i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold leading-tight group-hover:underline">{displayName(r)}</span>
                {r.verdict_label && <span className="mt-1 block"><VerdictTag label={r.verdict_label} /></span>}
              </span>
              <span className="font-mono font-extrabold text-2xl" aria-label={`${formatScore(r.overall_rating)} out of 10`}>{formatScore(r.overall_rating)}</span>
            </Link>
          </li>
        )) : <li className="p-5 text-muted">Nothing here yet.</li>}
      </ol>
      <Link href={`/collections/${tone}`} className="border-t-2 border-ink p-4 font-bold hover:bg-ink hover:text-paper transition-colors">See all of {title.toLowerCase()} →</Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="border-2 border-dashed border-rule p-10 text-center text-muted">{text}</p>;
}

