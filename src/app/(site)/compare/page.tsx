import type { Metadata } from "next";
import Link from "next/link";
import { getComparisons } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Comparisons & buying guides", description: "Head-to-heads, best-under-£X lists and budget vs premium showdowns — based only on products we’ve actually reviewed.", alternates: { canonical: "/compare" } };

const KIND: Record<string, string> = { versus: "Head to head", best_under: "Best under £…", budget_vs_premium: "Budget vs premium", guide: "Buying guide" };

export default async function ComparePage() {
  const list = await getComparisons();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">Head to head</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">Comparisons</h1>
      <p className="mt-4 text-xl text-ink-2 max-w-2xl">Which one should you actually buy? We only compare things we’ve tested, and we don’t make up results to fill a table.</p>
      {list.length ? (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/compare/${c.slug}`} className="group lift flex h-full flex-col border-2 border-ink bg-card p-6">
                <span className="flex justify-between kicker text-muted"><span>{c.is_sample ? "Sample · " : ""}{KIND[c.kind]}</span><span>{formatDate(c.published_at)}</span></span>
                <span className="display-wide mt-3 text-2xl leading-tight group-hover:underline">{c.title}</span>
                {c.intro && <span className="mt-2 text-ink-2">{c.intro}</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-10 border-2 border-dashed border-rule p-12 text-center text-muted">No comparisons published yet.</p>}
    </div>
  );
}
