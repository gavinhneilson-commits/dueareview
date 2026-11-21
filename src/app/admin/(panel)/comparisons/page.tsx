import Link from "next/link";
import { adminComparisons } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Comparisons" };

export default async function Comparisons() {
  await requireStaff("editor");
  const list = await adminComparisons();
  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between"><h1 className="display text-5xl">Comparisons</h1><Link href="/admin/comparisons/new" className="btn btn-primary">+ New comparison</Link></div>
      <ul className="mt-6 border-2 border-ink bg-card divide-y divide-rule">
        {list.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <Link href={`/admin/comparisons/${c.id}`} className="font-semibold hover:underline">{c.title}</Link>
            <span className="flex items-center gap-3 text-sm text-muted"><StatusBadge status={c.status} publishedAt={c.published_at} />{formatDate(c.updated_at)}</span>
          </li>
        ))}
        {!list.length && <li className="p-8 text-center text-muted">No comparisons yet.</li>}
      </ul>
    </div>
  );
}
