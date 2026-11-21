import type { Metadata } from "next";
import { getSettings, getVideos } from "@/lib/data";
import { VideoCard } from "@/components/VideoCard";
import { SocialLinks } from "@/components/SocialLinks";

export const revalidate = 60;
export const metadata: Metadata = { title: "Video reviews", description: "Watch Due A Review put products to the test on YouTube, Shorts and Instagram.", alternates: { canonical: "/videos" } };

export default async function VideosPage() {
  const [videos, settings] = await Promise.all([getVideos(60), getSettings()]);
  const long = videos.filter((v) => v.kind === "video");
  const shorts = videos.filter((v) => v.kind !== "video");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">Watch us test it</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">Videos</h1>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {settings.social.youtube && <a href={settings.social.youtube} target="_blank" rel="noopener" className="btn btn-primary">Subscribe on YouTube</a>}
        <SocialLinks social={settings.social} />
      </div>
      <p className="mt-4 text-sm text-muted">Videos don’t load anything from YouTube until you press play.</p>
      {long.length > 0 && (
        <section aria-labelledby="full" className="mt-12">
          <h2 id="full" className="display text-4xl mb-6">Full reviews</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{long.map((v) => <VideoCard key={v.id} video={v} />)}</div>
        </section>
      )}
      {shorts.length > 0 && (
        <section aria-labelledby="shorts" className="mt-16">
          <h2 id="shorts" className="display text-4xl mb-6">Shorts & reels</h2>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{shorts.map((v) => <VideoCard key={v.id} video={v} />)}</div>
        </section>
      )}
      {!videos.length && <p className="mt-12 border-2 border-dashed border-rule p-12 text-center text-muted">No videos added yet. {settings.social.youtube ? "Head to our YouTube channel in the meantime." : ""}</p>}
    </div>
  );
}
