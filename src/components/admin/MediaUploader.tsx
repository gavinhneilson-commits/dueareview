"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadMedia } from "@/app/admin/actions";

export function MediaUploader() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onChange = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setMsg(null);
    let ok = 0; const errors: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.set("file", f);
      const r = await uploadMedia(fd);
      if (r.ok) ok++; else errors.push(`${f.name}: ${r.message}`);
    }
    setBusy(false);
    setMsg(`${ok} uploaded.${errors.length ? " " + errors.join(" ") : ""}`);
    router.refresh();
  };
  return (
    <div>
      <label className="btn btn-primary cursor-pointer">{busy ? "Uploading…" : "Upload images"}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={(e) => onChange(e.target.files)} disabled={busy} />
      </label>
      {msg && <p role="status" className="mt-2 text-sm font-semibold">{msg}</p>}
    </div>
  );
}

export function CopyUrl({ url }: { url: string }) {
  const [c, setC] = useState(false);
  return <button type="button" className="text-xs underline" onClick={async () => { await navigator.clipboard.writeText(url); setC(true); setTimeout(() => setC(false), 1500); }}>{c ? "Copied" : "Copy URL"}</button>;
}
