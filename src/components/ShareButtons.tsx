"use client";
import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ url, title }); return; } catch { return; } }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const cls = "btn btn-ghost btn-sm";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="kicker text-muted mr-1">Share</span>
      <button type="button" onClick={share} className={cls}>{copied ? "Link copied" : "Copy / share"}</button>
      <a className={cls} href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener">WhatsApp</a>
      <a className={cls} href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener">X</a>
      <a className={cls} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener">Facebook</a>
      <span className="sr-only" aria-live="polite">{copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}
