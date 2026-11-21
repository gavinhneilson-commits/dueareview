"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { uploadMedia } from "@/app/admin/actions";

/** Upload to Supabase Storage (or paste a URL). Writes the final URL into a hidden input called `name`. */
export function ImageField({ name, label, defaultValue, hint, onChange }: { name: string; label: string; defaultValue?: string | null; hint?: string; onChange?: (url: string) => void }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => { cb.current?.(url); }, [url]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = `img-${name}`;

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true); setErr(null);
    const fd = new FormData(); fd.set("file", f);
    const res = await uploadMedia(fd);
    setBusy(false);
    if (res.ok && res.url) setUrl(res.url); else setErr(res.message ?? "Upload failed");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex gap-3 items-start">
        <div className="w-28 h-20 shrink-0 border-2 border-ink bg-paper-2 overflow-hidden grid place-items-center text-xs text-muted">
          {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : "No image"}
        </div>
        <div className="flex-1 space-y-2">
          <input id={id} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or upload" className="field text-sm" />
          <input type="hidden" name={name} value={url} />
          <div className="flex gap-2 items-center">
            <label className="btn btn-ghost btn-sm cursor-pointer">
              {busy ? "Uploading…" : "Upload image"}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
            </label>
            {url && <button type="button" className="text-sm underline" onClick={() => setUrl("")}>Remove</button>}
          </div>
          {err && <p role="alert" className="text-sm text-ugly font-semibold">{err}</p>}
          {hint && <p className="hint">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
