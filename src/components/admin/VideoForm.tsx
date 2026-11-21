"use client";
import { saveVideo, type ActionState } from "@/app/admin/actions";
import type { Video } from "@/lib/types";
import { Btn, FormMessage, useKeepForm } from "./ui";

export function VideoForm({ video, reviews }: { video?: Video; reviews: { id: string; title: string }[] }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(saveVideo, null);
  const p = video?.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      {video && <input type="hidden" name="id" value={video.id} />}
      {video?.published_at && <input type="hidden" name="published_at" value={video.published_at} />}
      <div><label htmlFor={`vt-${p}`} className="label text-sm">Title</label><input id={`vt-${p}`} name="title" defaultValue={video?.title} className="field text-sm" required /></div>
      <div><label htmlFor={`vu-${p}`} className="label text-sm">YouTube / Shorts / Instagram URL</label><input id={`vu-${p}`} name="url" type="url" defaultValue={video?.url} className="field text-sm" required /></div>
      <div><label htmlFor={`vr-${p}`} className="label text-sm">Linked review (optional)</label>
        <select id={`vr-${p}`} name="review_id" defaultValue={video?.review_id ?? ""} className="field text-sm"><option value="">None</option>{reviews.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></div>
      <div className="flex items-end gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="kind" value="short" defaultChecked={video?.kind === "short"} /> It’s a Short</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={video ? video.status === "published" : true} /> Show on site</label>
        <Btn pending={pending} className="btn btn-ink btn-sm">{video ? "Save" : "Add video"}</Btn>
      </div>
      {state && <div className="md:col-span-2"><FormMessage state={state} /></div>}
    </form>
  );
}
