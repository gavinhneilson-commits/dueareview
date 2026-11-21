import Link from "next/link";
import { adminCategories } from "@/lib/admin-data";
import { can, requireStaff } from "@/lib/auth";
import { ReviewForm } from "@/components/admin/ReviewForm";

export const metadata = { title: "New review" };

export default async function NewReview() {
  const staff = await requireStaff();
  const categories = await adminCategories();
  return (
    <div className="max-w-7xl">
      <Link href="/admin/reviews" className="text-sm underline">← All reviews</Link>
      <h1 className="display text-5xl mt-2 mb-6">New review</h1>
      <ReviewForm review={null} categories={categories} canPublish={can(staff, "editor")} />
    </div>
  );
}
