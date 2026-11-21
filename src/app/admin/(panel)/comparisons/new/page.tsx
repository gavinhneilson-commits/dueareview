import Link from "next/link";
import { adminReviewOptions } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { ComparisonForm } from "@/components/admin/ComparisonForm";

export const metadata = { title: "New comparison" };
export default async function NewComparison() {
  await requireStaff("editor");
  const reviews = await adminReviewOptions();
  return (
    <div className="max-w-5xl">
      <Link href="/admin/comparisons" className="text-sm underline">← Comparisons</Link>
      <h1 className="display text-5xl mt-2 mb-6">New comparison</h1>
      <ComparisonForm comparison={null} reviews={reviews} />
    </div>
  );
}
