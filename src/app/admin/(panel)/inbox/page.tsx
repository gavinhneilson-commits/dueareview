import Link from "next/link";
import { adminSubmissions } from "@/lib/admin-data";
import { can, requireStaff } from "@/lib/auth";
import { deleteSubmission, toggleSubmission } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Inbox" };
const KIND: Record<string, string> = { contact: "Enquiry", review_request: "Review request", reader_question: "Reader question", brand_response: "Brand response", correction: "Correction" };

export default async function Inbox({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const staff = await requireStaff();
  const all = !!(await searchParams).all;
  const items = await adminSubmissions(all);
  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between"><h1 className="display text-5xl">Inbox</h1>
        <Link href={all ? "/admin/inbox" : "/admin/inbox?all=1"} className="text-sm underline">{all ? "Show unhandled only" : "Show handled too"}</Link></div>
      <ul className="mt-6 space-y-4">
        {items.map((s) => (
          <li key={s.id} className={`border-2 border-ink bg-card p-5 ${s.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap justify-between gap-2"><span className="kicker bg-ink text-paper px-2 py-0.5">{KIND[s.kind]}</span>
              <time className="text-sm text-muted">{new Date(s.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</time></div>
            {s.subject && <h2 className="font-bold text-lg mt-2">{s.subject}</h2>}
            <p className="mt-2 whitespace-pre-wrap">{s.message}</p>
            <p className="mt-3 text-sm text-muted">{s.name || "Anonymous"}{s.email && <> · <a href={`mailto:${s.email}`} className="underline">{s.email}</a></>}{s.related_url && <> · <a href={s.related_url} className="underline" target="_blank" rel="noopener nofollow">related link</a></>}</p>
            <div className="mt-3 flex gap-3">
              <form action={toggleSubmission}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="handled" value={s.handled ? "false" : "true"} /><button className="btn btn-ink btn-sm">{s.handled ? "Mark unhandled" : "Mark handled"}</button></form>
              {can(staff, "admin") && <form action={deleteSubmission}><input type="hidden" name="id" value={s.id} /><ConfirmButton message="Delete this message permanently?">Delete</ConfirmButton></form>}
            </div>
          </li>
        ))}
        {!items.length && <li className="border-2 border-dashed border-rule p-10 text-center text-muted">Inbox zero. Lovely.</li>}
      </ul>
    </div>
  );
}
