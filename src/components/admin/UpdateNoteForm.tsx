"use client";
import { useActionState } from "react";
import { addReviewUpdate, type ActionState } from "@/app/admin/actions";
import { FormMessage, SubmitButton } from "./ui";

export function UpdateNoteForm({ reviewId }: { reviewId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(addReviewUpdate, null);
  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="review_id" value={reviewId} />
      <label htmlFor="note" className="sr-only">Update note</label>
      <textarea id="note" name="note" rows={2} className="field text-sm" placeholder="e.g. Re-tested after firmware 2.1 — battery now lasts 7 hours. Score raised from 6.1 to 6.8." />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_correction" /> This is a correction of a mistake</label>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-ink btn-sm">Add note</SubmitButton>
    </form>
  );
}
