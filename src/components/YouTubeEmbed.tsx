"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ytEmbed, ytThumb, ytWatch } from "@/lib/youtube";

/**
 * Privacy-conscious embed: nothing loads from YouTube until the visitor clicks play,
 * then it uses youtube-nocookie.com. The thumbnail comes from i.ytimg.com (no cookies).
 */
export function YouTubeEmbed({ id, title, vertical = false }: { id: string; title: string; vertical?: boolean }) {
  const [play, setPlay] = useState(false);
  return (
    <div className={`relative w-full overflow-hidden border-2 border-ink bg-ink ${vertical ? "aspect-[9/16] max-w-sm mx-auto" : "aspect-video"}`}>
      {play ? (
        <iframe className="absolute inset-0 h-full w-full" src={ytEmbed(id)} title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 w-full cursor-pointer" aria-label={`Play video: ${title}`}>
          <img src={ytThumb(id)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100" loading="lazy" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center bg-signal border-2 border-ink shadow-[4px_4px_0_var(--ink)] transition group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="var(--signal-ink)" /></svg>
            </span>
          </span>
          <span className="absolute bottom-2 left-2 right-2 text-left text-[0.7rem] text-white/85 bg-black/50 px-2 py-1">
            Plays from YouTube (privacy-enhanced mode). <a href={ytWatch(id)} className="underline" onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener">Watch on YouTube</a>
          </span>
        </button>
      )}
    </div>
  );
}
