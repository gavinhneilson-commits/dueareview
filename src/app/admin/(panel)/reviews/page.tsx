import Link from "next/link";
import { adminListReviews } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { formatScore } from "@/lib/rating";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Reviews" };
const TABS = [["", "All"], ["draft", "Drafts"], ["scheduled", "Scheduled"], ["published", "Published"], ["unpublished", "Unpublished"]];

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const rows = await adminListReviews(sp.status, sp.q);
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Reviews</h1>
        <Link href="/admin/reviews/new" className="btn btn-primary">+ New review</Link>
      </div>
      {sp.deleted && <p role="status" className="mt-4 border-2 border-good bg-good-bg text-good p-3 font-semibold">Review deleted.</p>}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map(([v, l]) => (
          <Link key={v} href={v ? `/admin/reviews?status=${v}` : "/admin/reviews"} aria-current={(sp.status ?? "") === v ? "page" : undefined}
            className={`px-3 py-1.5 border-2 border-ink font-semibold text-sm ${(sp.status ?? "") === v ? "bg-ink text-paper" : ""}`}>{l}</Link>
        ))}
        <form className="ml-auto flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <label htmlFor="q" className="sr-only">Search titles</label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="Search titles…" className="field !py-1.5 text-sm" />
        </form>
      </div>
      <div className="mt-6 overflow-x-auto border-2 border-ink bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-paper"><tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Score</th><th className="p-3">Status</th><th className="p-3">Updated</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-rule last:border-0 hover:bg-paper-2">
                <td className="p-3"><Link href={`/admin/reviews/${r.id}`} className="font-semibold hover:underline">{r.title}</Link>{r.featured && <span className="ml-2 kicker text-signal-text">Featured</span>}</td>
                <td className="p-3">{r.category?.name ?? "—"}</td>
                <td className="p-3 font-mono">{formatScore(r.overall_rating)}{r.overall_rating !== null && !r.rating_approved && <span className="ml-1 kicker text-ugly" title="Score not yet approved">unapproved</span>}</td>
                <td className="p-3"><StatusBadge status={r.status} publishedAt={r.published_at} />{r.status === "scheduled" && r.published_at && <div className="text-xs text-muted mt-1">{new Date(r.published_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</div>}</td>
                <td className="p-3 text-muted whitespace-nowrap">{formatDate(r.updated_at)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-muted">No reviews here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
