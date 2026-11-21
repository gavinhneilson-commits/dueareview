"use client";
import { useState } from "react";
import type { GalleryImage, RetailerLink, Spec } from "@/lib/types";
import { ImageField } from "./ImageField";

function Row({ children, onRemove, onUp, onDown }: { children: React.ReactNode; onRemove: () => void; onUp?: () => void; onDown?: () => void }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid gap-2 sm:grid-cols-[1fr_1.5fr_auto] items-center">{children}</div>
      <div className="flex gap-1">
        {onUp && <button type="button" onClick={onUp} className="btn btn-ghost btn-sm" aria-label="Move up">↑</button>}
        {onDown && <button type="button" onClick={onDown} className="btn btn-ghost btn-sm" aria-label="Move down">↓</button>}
        <button type="button" onClick={onRemove} className="btn btn-ghost btn-sm" aria-label="Remove">✕</button>
      </div>
    </div>
  );
}

function move<T>(arr: T[], i: number, d: number) { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; }

export function SpecsEditor({ name, initial }: { name: string; initial: Spec[] }) {
  const [rows, setRows] = useState<Spec[]>(initial.length ? initial : [{ label: "", value: "" }]);
  const set = (i: number, k: keyof Spec, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <fieldset>
      <legend className="label">Key specifications</legend>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="space-y-2">
        {rows.map((r, i) => (
          <Row key={i} onRemove={() => setRows(rows.filter((_, j) => j !== i))} onUp={i ? () => setRows(move(rows, i, -1)) : undefined}>
            <input aria-label={`Spec ${i + 1} label`} className="field text-sm" placeholder="e.g. Battery life" value={r.label} onChange={(e) => set(i, "label", e.target.value)} />
            <input aria-label={`Spec ${i + 1} value`} className="field text-sm sm:col-span-2" placeholder="e.g. 8 hours (claimed)" value={r.value} onChange={(e) => set(i, "value", e.target.value)} />
          </Row>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, { label: "", value: "" }])} className="btn btn-ghost btn-sm mt-2">+ Add spec</button>
      <p className="hint">Say “(claimed)” for manufacturer figures you haven’t verified.</p>
    </fieldset>
  );
}

export function LinksEditor({ name, initial }: { name: string; initial: RetailerLink[] }) {
  const [rows, setRows] = useState<RetailerLink[]>(initial);
  const set = (i: number, patch: Partial<RetailerLink>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset>
      <legend className="label">Retailer links</legend>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="space-y-2">
        {rows.map((r, i) => (
          <Row key={i} onRemove={() => setRows(rows.filter((_, j) => j !== i))} onUp={i ? () => setRows(move(rows, i, -1)) : undefined}>
            <input aria-label="Retailer name" className="field text-sm" placeholder="Retailer, e.g. Argos" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
            <input aria-label="Link URL" className="field text-sm" type="url" placeholder="https://…" value={r.url} onChange={(e) => set(i, { url: e.target.value })} />
            <label className="flex items-center gap-1 text-sm whitespace-nowrap"><input type="checkbox" checked={r.affiliate} onChange={(e) => set(i, { affiliate: e.target.checked })} /> Affiliate</label>
          </Row>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, { name: "", url: "", affiliate: false }])} className="btn btn-ghost btn-sm mt-2">+ Add link</button>
      <p className="hint">Ticking “Affiliate” automatically shows the affiliate disclosure on the review and marks the link rel=&quot;sponsored&quot;.</p>
    </fieldset>
  );
}

export function GalleryEditor({ name, initial }: { name: string; initial: GalleryImage[] }) {
  const [rows, setRows] = useState<GalleryImage[]>(initial);
  return (
    <fieldset>
      <legend className="label">Gallery images</legend>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={i} className="border border-rule p-3 space-y-2">
            <GalleryItem value={r} onChange={(v) => setRows(rows.map((x, j) => (j === i ? v : x)))} idx={i} />
            <button type="button" className="text-sm underline" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove image</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, { url: "", alt: "" }])} className="btn btn-ghost btn-sm mt-2">+ Add image</button>
    </fieldset>
  );
}

function GalleryItem({ value, onChange, idx }: { value: GalleryImage; onChange: (v: GalleryImage) => void; idx: number }) {
  return (
    <div>
      <ImageField name={`g-url-${idx}`} label={`Image ${idx + 1}`} defaultValue={value.url} onChange={(url) => url !== value.url && onChange({ ...value, url })} />
      <label className="label mt-2" htmlFor={`g-alt-${idx}`}>Alt text (describe the image)</label>
      <input id={`g-alt-${idx}`} className="field text-sm" value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
    </div>
  );
}
