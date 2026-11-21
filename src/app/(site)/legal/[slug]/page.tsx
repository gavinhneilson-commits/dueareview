import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/data";
import { LEGAL_PAGES } from "@/content/legal";
import { renderMarkdown } from "@/lib/markdown";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return LEGAL_PAGES.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPage((await params).slug);
  return p ? { title: p.title, description: p.description, alternates: { canonical: `/legal/${p.slug}` } } : {};
}

export default async function LegalPageView({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Breadcrumbs items={[{ href: `/legal/${page.slug}`, label: page.title }]} />
      <h1 className="display text-5xl sm:text-7xl mt-6">{page.title}</h1>
      <div className="prose-dar mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
    </div>
  );
}
