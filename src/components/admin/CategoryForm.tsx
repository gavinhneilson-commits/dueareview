"use client";
import { saveCategory, type ActionState } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { Btn, FormMessage, useKeepForm } from "./ui";

export function CategoryForm({ category }: { category?: Category }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(saveCategory, null);
  const p = category?.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1.2fr_1fr_2fr_90px_auto] sm:items-end">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div><label htmlFor={`n-${p}`} className="label text-xs">Name</label><input id={`n-${p}`} name="name" defaultValue={category?.name} className="field text-sm" required /></div>
      <div><label htmlFor={`s-${p}`} className="label text-xs">Slug</label><input id={`s-${p}`} name="slug" defaultValue={category?.slug} className="field text-sm font-mono" placeholder="auto" /></div>
      <div><label htmlFor={`d-${p}`} className="label text-xs">Description</label><input id={`d-${p}`} name="description" defaultValue={category?.description ?? ""} className="field text-sm" /></div>
      <div><label htmlFor={`o-${p}`} className="label text-xs">Order</label><input id={`o-${p}`} name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className="field text-sm" /></div>
      <Btn pending={pending} className="btn btn-ink btn-sm">{category ? "Save" : "Add"}</Btn>
      {state && <div className="sm:col-span-5"><FormMessage state={state} /></div>}
    </form>
  );
}
