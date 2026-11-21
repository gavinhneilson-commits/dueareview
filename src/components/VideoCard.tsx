import Link from "next/link";
import type { Video } from "@/lib/types";
import { youtubeId } from "@/lib/youtube";
import { YouTubeEmbed } from "./YouTubeEmbed";

export function VideoCard({ video }: { video: Video }) {
  const id = video.youtube_id || youtubeId(video.url);
  return (
    <article className="flex flex-col gap-3">
      {id ? (
        <YouTubeEmbed id={id} title={video.title} vertical={video.kind === "short"} />
      ) : (
        <a href={video.url} target="_blank" rel="noopener" className="grid aspect-square place-items-center border-2 border-ink bg-paper-2 font-bold hover:bg-signal transition-colors">
          View on {video.kind === "instagram" ? "Instagram" : "the platform"} ↗
        </a>
      )}
      <div>
        <p className="kicker text-muted">{video.kind === "short" ? "YouTube Short" : video.kind === "instagram" ? "Instagram" : "Video review"}</p>
        <h3 className="font-bold text-lg leading-tight mt-1">{video.title}</h3>
        {video.review && <Link href={`/reviews/${video.review.slug}`} className="text-sm underline underline-offset-4 decoration-signal decoration-2">Read the written review →</Link>}
      </div>
    </article>
  );
}
