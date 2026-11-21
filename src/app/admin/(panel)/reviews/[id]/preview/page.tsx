import { notFound } from "next/navigation";
import { adminGetReview, adminReviewUpdates } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { ReviewArticle } from "@/components/ReviewArticle";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [review, updates, settings] = await Promise.all([adminGetReview(id), adminReviewUpdates(id), getSettings()]);
  if (!review) notFound();
  return (
    <div>
      <p role="note" className="sticky top-0 z-10 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6 bg-signal text-signal-ink border-b-2 border-ink px-4 py-2 font-bold">
        PREVIEW — status: {review.status}. This page is only visible to signed-in staff.
      </p>
      <div className="max-w-7xl mx-auto">
        <ReviewArticle review={review} updates={updates} disclosure={settings.disclosures.affiliate_short} sponsoredText={settings.disclosures.sponsored_short} />
      </div>
    </div>
  );
}
