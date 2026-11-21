import Link from "next/link";
import { adminListReviews, adminStats } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const [stats, recent] = await Promise.all([adminStats(), adminListReviews()]);
  const analytics = process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD_URL;
  const cards = [
    ["Drafts", stats.drafts, "/admin/reviews?status=draft"],
    ["Scheduled", stats.scheduled, "/admin/reviews?status=scheduled"],
    ["Published", stats.published, "/admin/reviews?status=published"],
    ["Unread inbox", stats.inbox, "/admin/inbox"],
    ["Comparisons", stats.comparisons, "/admin/comparisons"],
    ["Videos", stats.videos, "/admin/videos"],
  ] as const;
  return (
    <div className="max-w-6xl">
      {sp.denied && <p role="alert" className="mb-6 border-2 border-ugly bg-ugly-bg text-ugly p-3 font-semibold">Your role ({staff.role}) can’t access that page.</p>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Alright{staff.display_name ? `, ${staff.display_name}` : ""}.</h1>
        <Link href="/admin/reviews/new" className="btn btn-primary">+ New review</Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(([l, v, h]) => (
          <li key={l}><Link href={h} className="block border-2 border-ink bg-card p-5 lift"><span className="kicker text-muted">{l}</span><span className="block display text-6xl mt-2">{v}</span></Link></li>
        ))}
      </ul>
      <section className="mt-10 border-2 border-ink bg-card p-5">
        <h2 className="display text-3xl">Analytics</h2>
        {analytics ? (
          <p className="mt-2">Analytics is connected. <a href={analytics} target="_blank" rel="noopener" className="underline font-semibold">Open your analytics dashboard ↗</a></p>
        ) : (
          <p className="mt-2 text-ink-2">Not connected yet. Add <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> (loaded only after cookie consent) and <code>NEXT_PUBLIC_ANALYTICS_DASHBOARD_URL</code> to show a link here. In-dashboard charts are planned for a later phase.</p>
        )}
      </section>
      <section className="mt-10">
        <h2 className="display text-3xl mb-4">Recently edited</h2>
        <ul className="border-2 border-ink bg-card divide-y divide-rule">
          {recent.slice(0, 8).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <Link href={`/admin/reviews/${r.id}`} className="font-semibold hover:underline">{r.title}</Link>
              <span className="flex items-center gap-3 text-sm text-muted"><StatusBadge status={r.status} publishedAt={r.published_at} />{formatDate(r.updated_at)}</span>
            </li>
          ))}
          {!recent.length && <li className="p-6 text-muted">No reviews yet. <Link href="/admin/reviews/new" className="underline">Write the first one</Link>.</li>}
        </ul>
      </section>
    </div>
  );
}
