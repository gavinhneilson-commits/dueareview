import Link from "next/link";
import { isDemoMode } from "@/lib/env";
import { can, requireStaff } from "@/lib/auth";
import { signOut } from "@/app/admin/actions";
import { Mark } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24">
        <h1 className="display text-5xl">Admin is offline in demo mode</h1>
        <p className="mt-4 text-lg text-ink-2">Connect a Supabase project (see README → “Connect Supabase”) to manage reviews, categories, videos and settings.</p>
        <Link href="/" className="btn btn-primary mt-6">Back to the site</Link>
      </main>
    );
  }
  const staff = await requireStaff();
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/reviews", label: "Reviews" },
    { href: "/admin/comparisons", label: "Comparisons", min: "editor" },
    { href: "/admin/videos", label: "Videos", min: "editor" },
    { href: "/admin/media", label: "Media" },
    { href: "/admin/categories", label: "Categories", min: "editor" },
    { href: "/admin/inbox", label: "Inbox" },
    { href: "/admin/pages", label: "Pages & legal", min: "admin" },
    { href: "/admin/settings", label: "Settings", min: "admin" },
    { href: "/admin/users", label: "Users", min: "admin" },
  ].filter((i) => !i.min || can(staff, i.min as "editor" | "admin"));

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] min-h-screen">
      <aside className="bg-night text-night-text lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b border-night-text/15">
          <Mark size={32} /><span className="display text-2xl">Admin</span>
        </div>
        <AdminNav items={items} />
        <div className="mt-auto p-4 border-t border-night-text/15 text-sm space-y-2">
          <p className="truncate" title={staff.email ?? ""}>{staff.display_name || staff.email}</p>
          <p className="kicker text-signal">{staff.role}</p>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="underline">View site ↗</Link>
            <form action={signOut}><button className="underline">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main id="main" className="min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
