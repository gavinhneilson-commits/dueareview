import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetComparison, adminReviewOptions } from "@/lib/admin-data";
import { can, requireStaff } from "@/lib/auth";
import { deleteComparison } from "@/app/admin/actions";
import { ComparisonForm } from "@/components/admin/ComparisonForm";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Edit comparison" };
export default async function EditComparison({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const staff = await requireStaff("editor");
  const { id } = await params;
  const [c, reviews] = await Promise.all([adminGetComparison(id), adminReviewOptions()]);
  if (!c) notFound();
  const saved = (await searchParams).saved;
  return (
    <div className="max-w-5xl">
      <Link href="/admin/comparisons" className="text-sm underline">← Comparisons</Link>
      <h1 className="display text-5xl mt-2 mb-6">{c.title}</h1>
      {saved && <p role="status" className="mb-6 border-2 border-good bg-good-bg text-good p-3 font-semibold">Saved.</p>}
      <ComparisonForm key={c.updated_at} comparison={c} reviews={reviews} />
      {can(staff, "admin") && (
        <form action={deleteComparison} className="mt-8"><input type="hidden" name="id" value={c.id} />
          <ConfirmButton message="Delete this comparison permanently?" className="btn btn-sm border-ugly text-ugly">Delete comparison</ConfirmButton></form>
      )}
    </div>
  );
}
