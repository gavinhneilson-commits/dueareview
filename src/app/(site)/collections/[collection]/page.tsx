import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { searchReviews } from "@/lib/data";
import { ReviewGrid } from "@/components/ReviewCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const revalidate = 60;

const C = {
  good: { title: "The Good", lede: "Products that genuinely impressed us. Not perfect, but properly good at what they’re for.", cls: "bg-good text-paper" },
  bad: { title: "The Bad", lede: "Products that disappointed or failed to deliver on their promises.", cls: "bg-bad-bg text-bad" },
  ugly: { title: "The Ugly", lede: "Particularly poor value, questionable claims or significant shortcomings. Read before you buy.", cls: "bg-ugly text-paper" },
} as const;
type Key = keyof typeof C;
type Props = { params: Promise<{ collection: string }> };

export function generateStaticParams() { return Object.keys(C).map((collection) => ({ collection })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = (await params).collection as Key;
  if (!C[k]) return {};
  return { title: `${C[k].title} — reviews`, description: C[k].lede, alternates: { canonical: `/collections/${k}` } };
}

export default async function CollectionPage({ params }: Props) {
  const k = (await params).collection as Key;
  if (!C[k]) notFound();
  const { items } = await searchReviews({ collection: k, pageSize: 48, sort: k === "good" ? "highest" : k === "ugly" ? "lowest" : "newest" });
  return (
    <>
      <section className={`border-b-2 border-ink ${C[k].cls}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <h1 className="display text-7xl sm:text-9xl">{C[k].title}</h1>
          <p className="mt-4 text-xl max-w-2xl font-semibold">{C[k].lede}</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Breadcrumbs items={[{ href: `/collections/${k}`, label: C[k].title }]} />
        <div className="mt-8">{items.length ? <ReviewGrid reviews={items} headingLevel={2} /> : <p className="border-2 border-dashed border-rule p-12 text-center text-muted">Nothing in {C[k].title.toLowerCase()} yet.</p>}</div>
      </div>
    </>
  );
}
