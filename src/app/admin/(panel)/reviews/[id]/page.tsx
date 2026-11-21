import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCategories, adminGetReview, adminReviewUpdates } from "@/lib/admin-data";
import { can, requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { deleteReview } from "@/app/admin/actions";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { UpdateNoteForm } from "@/components/admin/UpdateNoteForm";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Edit review" };

const SAVED: Record<string, string> = { save: "Saved.", publish: "Published — it’s live.", schedule: "Scheduled.", unpublish: "Unpublished — it’s no longer public.", draft: "Moved back to draft." };

export default async function EditReview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const staff = await requireStaff();
  const { id } = await params;
  const sp = await searchParams;
  const [review, categories, updates] = await Promise.all([adminGetReview(id), adminCategories(), adminReviewUpdates(id)]);
  if (!review) notFound();
  const live = (review.status === "published" || review.status === "scheduled") && review.published_at && new Date(review.published_at) <= new Date();
  return (
    <div className="max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/reviews" className="text-sm underline">← All reviews</Link>
        {live && <Link href={`/reviews/${review.slug}`} target="_blank" className="text-sm underline font-semibold">View live page ↗</Link>}
      </div>
      <h1 className="display text-4xl sm:text-5xl mt-2 mb-6">{review.title}</h1>
      {sp.saved && SAVED[sp.saved] && <p role="status" className="mb-6 border-2 border-good bg-good-bg text-good p-3 font-semibold">{SAVED[sp.saved]}</p>}
      <ReviewForm key={review.updated_at} review={review} categories={categories} canPublish={can(staff, "editor")} />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="border-2 border-ink bg-card p-5">
          <h2 className="display text-2xl">Update history</h2>
          <p className="hint">Public log shown on the review. Use it for corrections, re-tests and price changes.</p>
          {can(staff, "editor") && <UpdateNoteForm reviewId={review.id} />}
          <ol className="mt-4 space-y-3">
            {updates.map((u) => <li key={u.id} className="border-l-2 border-ink pl-3"><p className="kicker text-muted">{formatDate(u.created_at)}{u.is_correction && " · correction"}</p><p>{u.note}</p></li>)}
            {!updates.length && <li className="text-muted text-sm">No updates logged.</li>}
          </ol>
        </div>
        {can(staff, "admin") && (
          <div className="border-2 border-ugly bg-card p-5 h-fit">
            <h2 className="display text-2xl text-ugly">Danger zone</h2>
            <p className="hint">Deleting is permanent. To take a review down temporarily, use Unpublish instead.</p>
            <form action={deleteReview} className="mt-3"><input type="hidden" name="id" value={review.id} />
              <ConfirmButton message="Delete this review permanently? This can’t be undone." className="btn btn-sm border-ugly text-ugly">Delete review</ConfirmButton></form>
          </div>
        )}
      </section>
    </div>
  );
}
