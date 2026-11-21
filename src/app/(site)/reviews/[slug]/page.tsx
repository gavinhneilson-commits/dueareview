import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRelatedReviews, getReviewBySlug, getReviewUpdates, getSettings } from "@/lib/data";
import { SITE_URL, isDemoMode } from "@/lib/env";
import { plainText } from "@/lib/markdown";
import { displayName } from "@/lib/format";
import { ReviewArticle } from "@/components/ReviewArticle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReviewGrid } from "@/components/ReviewCard";
import { ShareButtons } from "@/components/ShareButtons";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";

export const revalidate = 60;
// Render on first visit, then cache (ISR) — new reviews appear without a rebuild.
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const review = await getReviewBySlug((await params).slug);
  if (!review) return { title: "Review not found" };
  const description = review.seo_description || review.short_verdict || plainText(review.body);
  const image = review.og_image_url || review.hero_image_url || undefined;
  return {
    title: review.seo_title || review.title,
    description,
    alternates: { canonical: `/reviews/${review.slug}` },
    openGraph: {
      type: "article", title: review.seo_title || review.title, description, url: `/reviews/${review.slug}`,
      publishedTime: review.published_at ?? undefined, modifiedTime: review.updated_at,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ReviewPage({ params }: Props) {
  const review = await getReviewBySlug((await params).slug);
  if (!review) notFound();
  const [updates, related, settings] = await Promise.all([getReviewUpdates(review.id), getRelatedReviews(review), getSettings()]);
  const url = `${SITE_URL}/reviews/${review.slug}`;

  // Structured data mirrors exactly what is published on the page. Never emitted for demo content.
  const jsonLd = !isDemoMode && review.overall_rating !== null ? {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    url,
    datePublished: review.published_at,
    dateModified: review.updated_at,
    reviewBody: review.short_verdict || undefined,
    author: { "@type": "Organization", name: "Due A Review", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Due A Review", url: SITE_URL },
    itemReviewed: {
      "@type": "Product",
      name: displayName(review),
      ...(review.brand ? { brand: { "@type": "Brand", name: review.brand } } : {}),
      ...(review.model ? { model: review.model } : {}),
      ...(review.hero_image_url ? { image: review.hero_image_url } : {}),
    },
    reviewRating: { "@type": "Rating", ratingValue: review.overall_rating, bestRating: 10, worstRating: 0 },
    ...(review.pros.length ? { positiveNotes: { "@type": "ItemList", itemListElement: review.pros.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p })) } } : {}),
    ...(review.cons.length ? { negativeNotes: { "@type": "ItemList", itemListElement: review.cons.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c })) } } : {}),
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumbs items={[
        { href: "/reviews", label: "Reviews" },
        ...(review.category ? [{ href: `/category/${review.category.slug}`, label: review.category.name }] : []),
        { href: `/reviews/${review.slug}`, label: review.product_name },
      ]} />
      <ReviewArticle review={review} updates={updates} disclosure={settings.disclosures.affiliate_short}
        sponsoredText={settings.disclosures.sponsored_short} share={<ShareButtons url={url} title={review.title} />} />
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-24">
          <SectionHeading id="related" kicker="Keep reading" title="Related reviews" />
          <ReviewGrid reviews={related} />
        </section>
      )}
    </div>
  );
}
