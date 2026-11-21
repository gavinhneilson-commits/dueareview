import Link from "next/link";
import type { Review } from "@/lib/types";
import { displayName, formatDate, formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { ScoreChip } from "./ScoreBadge";
import { VerdictTag } from "./VerdictTag";

export function ReviewCard({ review, priority = false, headingLevel = 3 }: { review: Review; priority?: boolean; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <article className="group relative flex flex-col border-2 border-ink bg-card lift">
      <div className="relative aspect-[4/3] border-b-2 border-ink overflow-hidden">
        <ProductImage src={review.hero_image_url} alt={review.hero_image_alt} name={review.product_name} brand={review.brand} priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {review.is_sample && <span className="kicker bg-ink text-paper px-1.5 py-0.5">Sample</span>}
          {review.video_url && (
            <span className="kicker bg-signal text-signal-ink px-1.5 py-0.5 inline-flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg>Video
            </span>
          )}
          {review.is_sponsored && <span className="kicker bg-paper text-ink border border-ink px-1.5 py-0.5">Sponsored</span>}
        </div>
        <div className="absolute bottom-3 right-3 stamp"><ScoreChip score={review.overall_rating} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 kicker text-muted">
          <span>{review.category?.name ?? "Review"}</span>
          {review.published_at && <time dateTime={review.published_at}>{formatDate(review.published_at)}</time>}
        </div>
        <H className="display-wide text-xl leading-tight">
          <Link href={`/reviews/${review.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {displayName(review)}
          </Link>
        </H>
        {review.short_verdict && <p className="text-[0.95rem] text-ink-2 leading-snug">{review.short_verdict}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <VerdictTag label={review.verdict_label} />
          {review.price_pence !== null && <span className="font-mono text-sm text-muted">{formatPrice(review.price_pence)}</span>}
        </div>
      </div>
    </article>
  );
}

export function ReviewGrid({ reviews, priorityFirst = false, headingLevel = 3 }: { reviews: Review[]; priorityFirst?: boolean; headingLevel?: 2 | 3 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((r, i) => <ReviewCard key={r.id} review={r} priority={priorityFirst && i < 2} headingLevel={headingLevel} />)}
    </div>
  );
}
