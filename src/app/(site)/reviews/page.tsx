import type { Metadata } from "next";
import { getBrands, getCategories, searchReviews } from "@/lib/data";
import { parseFilters, type SP } from "@/lib/params";
import { ReviewGrid } from "@/components/ReviewCard";
import { FilterBar } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).some((k) => k !== "page");
  return {
    title: sp.q ? `Search: ${String(sp.q).slice(0, 60)}` : "All reviews",
    description: "Every Due A Review verdict in one place. Filter by category, brand, score and price.",
    alternates: { canonical: "/reviews" },
    // Filtered/search result pages shouldn't be indexed as separate pages.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { filters, raw } = parseFilters(await searchParams);
  const [result, categories, brands] = await Promise.all([searchReviews(filters), getCategories(), getBrands()]);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">The full archive</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">{filters.q ? <>Results for “{filters.q}”</> : "All reviews"}</h1>
      <div className="mt-8"><FilterBar categories={categories} brands={brands} params={raw} /></div>
      <p className="mt-6 mb-6 font-mono text-sm text-muted" role="status" aria-live="polite">
        {result.total} {result.total === 1 ? "review" : "reviews"}
      </p>
      {result.items.length ? (
        <ReviewGrid reviews={result.items} headingLevel={2} />
      ) : (
        <div className="border-2 border-dashed border-rule p-12 text-center">
          <p className="display text-4xl">Nothing found.</p>
          <p className="mt-2 text-muted">Try fewer filters, or <a href="/contact?type=review_request" className="underline">ask us to review it</a>.</p>
        </div>
      )}
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} basePath="/reviews" params={raw} />
    </div>
  );
}
