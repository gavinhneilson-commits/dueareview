import { adminReviewOptions, adminVideos } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { deleteVideo } from "@/app/admin/actions";
import { VideoForm } from "@/components/admin/VideoForm";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Videos" };

export default async function Videos() {
  await requireStaff("editor");
  const [videos, reviews] = await Promise.all([adminVideos(), adminReviewOptions()]);
  return (
    <div className="max-w-5xl">
      <h1 className="display text-5xl">Videos</h1>
      <p className="mt-2 text-ink-2">Paste links to your YouTube videos, Shorts or Instagram posts. They appear on the Videos page and homepage. To show a video inside a written review, add the URL on the review itself.</p>
      <section className="mt-6 border-2 border-ink bg-card p-5"><h2 className="display text-2xl mb-3">Add a video</h2><VideoForm reviews={reviews} /></section>
      <ul className="mt-6 space-y-3">
        {videos.map((v) => (
          <li key={v.id} className="border-2 border-ink bg-card p-4">
            <VideoForm video={v} reviews={reviews} />
            <form action={deleteVideo} className="mt-2"><input type="hidden" name="id" value={v.id} /><ConfirmButton message="Remove this video from the site?" className="text-sm underline text-ugly">Remove</ConfirmButton></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
