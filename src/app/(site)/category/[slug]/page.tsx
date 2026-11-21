import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrands, getCategories, getCategory, searchReviews } from "@/lib/data";
import { parseFilters, type SP } from "@/lib/params";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FilterBar } from "@/components/FilterBar";
import { ReviewGrid } from "@/components/ReviewCard";
import { Pagination } from "@/components/Pagination";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  if (!c) return { title: "Category not found" };
  return { title: `${c.name} reviews`, description: c.description ?? `Honest ${c.name} reviews from Due A Review.`, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const { filters, raw } = parseFilters(await searchParams);
  const [result, categories, brands] = await Promise.all([searchReviews({ ...filters, category: slug }), getCategories(), getBrands()]);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ href: "/categories", label: "Categories" }, { href: `/category/${slug}`, label: cat.name }]} />
      <h1 className="display text-6xl sm:text-8xl mt-6">{cat.name}</h1>
      {cat.description && <p className="mt-3 text-xl text-ink-2 max-w-2xl">{cat.description}</p>}
      <div className="mt-8"><FilterBar categories={categories} brands={brands} params={{ ...raw, category: undefined }} action={`/category/${slug}`} hideCategory /></div>
      <p className="mt-6 mb-6 font-mono text-sm text-muted" role="status">{result.total} {result.total === 1 ? "review" : "reviews"}</p>
      {result.items.length ? <ReviewGrid reviews={result.items} headingLevel={2} /> : <p className="border-2 border-dashed border-rule p-12 text-center text-muted">No reviews in this category yet.</p>}
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} basePath={`/category/${slug}`} params={raw} />
    </div>
  );
}
