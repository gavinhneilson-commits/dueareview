import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { LEGAL_PAGES } from "@/content/legal";

export const metadata = { title: "Pages & legal" };

export default async function Pages() {
  await requireStaff("admin");
  return (
    <div className="max-w-4xl">
      <h1 className="display text-5xl">Pages & legal</h1>
      <p className="mt-2 text-ink-2">These pages start as drafts. Edit them here, and get them checked by a solicitor before launch.</p>
      <ul className="mt-6 border-2 border-ink bg-card divide-y divide-rule">
        {LEGAL_PAGES.map((p) => (
          <li key={p.slug} className="flex items-center justify-between p-4">
            <span className="font-semibold">{p.title}</span>
            <span className="flex gap-4 text-sm"><Link href={`/legal/${p.slug}`} target="_blank" className="underline">View ↗</Link><Link href={`/admin/pages/${p.slug}`} className="underline font-semibold">Edit</Link></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
