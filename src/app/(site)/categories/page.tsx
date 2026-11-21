import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Review categories", description: "Browse Due A Review by category.", alternates: { canonical: "/categories" } };

export default async function CategoriesPage() {
  const cats = await getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">Browse</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">Categories</h1>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <li key={c.id}>
            <Link href={`/category/${c.slug}`} className="group lift flex h-full flex-col border-2 border-ink bg-card p-6">
              <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-4xl mt-3 group-hover:text-signal-text">{c.name}</span>
              {c.description && <span className="mt-2 text-ink-2">{c.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
