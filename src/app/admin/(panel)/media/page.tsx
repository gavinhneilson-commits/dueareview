/* eslint-disable @next/next/no-img-element */
import { adminMedia } from "@/lib/admin-data";
import { can, requireStaff } from "@/lib/auth";
import { deleteMedia } from "@/app/admin/actions";
import { CopyUrl, MediaUploader } from "@/components/admin/MediaUploader";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Media" };

export default async function Media() {
  const staff = await requireStaff();
  const files = await adminMedia();
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl">Media</h1>
        <MediaUploader />
      </div>
      <p className="mt-2 text-ink-2 text-sm">JPEG, PNG, WebP, AVIF or GIF, up to 8 MB. For speed, export photos at around 2000px wide as WebP or JPEG before uploading. You can also upload straight from the review editor.</p>
      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {files.map((f) => (
          <li key={f.path} className="border-2 border-ink bg-card">
            <img src={f.url} alt="" loading="lazy" className="aspect-square w-full object-cover border-b-2 border-ink" />
            <div className="p-2 space-y-1">
              <p className="text-xs font-mono truncate" title={f.path}>{f.path.split("/").pop()}</p>
              <div className="flex justify-between items-center"><CopyUrl url={f.url} />
                {can(staff, "editor") && <form action={deleteMedia}><input type="hidden" name="path" value={f.path} /><ConfirmButton message="Delete this image? Any review using it will show a broken image." className="text-xs underline text-ugly">Delete</ConfirmButton></form>}
              </div>
            </div>
          </li>
        ))}
        {!files.length && <li className="col-span-full border-2 border-dashed border-rule p-10 text-center text-muted">No images uploaded yet.</li>}
      </ul>
    </div>
  );
}
