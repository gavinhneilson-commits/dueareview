"use client";
import { savePage, type ActionState } from "@/app/admin/actions";
import type { LegalPage } from "@/content/legal";
import { Btn, FormMessage, useKeepForm } from "./ui";

export function PageForm({ page }: { page: LegalPage }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(savePage, null);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="slug" value={page.slug} />
      <FormMessage state={state} />
      <div><label htmlFor="pt" className="label">Title</label><input id="pt" name="title" defaultValue={page.title} className="field" /></div>
      <div><label htmlFor="pb" className="label">Content (Markdown, tables supported)</label><textarea id="pb" name="body" rows={28} defaultValue={page.body} className="field font-mono text-sm" /></div>
      <div className="flex gap-2">
        <Btn pending={pending} className="btn btn-primary">Save page</Btn>
        <Btn pending={pending} name="reset" value="true" className="btn btn-ghost">Reset to default draft</Btn>
      </div>
    </form>
  );
}
