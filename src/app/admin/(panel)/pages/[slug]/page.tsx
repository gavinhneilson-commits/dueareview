import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getPage } from "@/lib/data";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaff("admin");
  const page = await getPage((await params).slug);
  if (!page) notFound();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/pages" className="text-sm underline">← Pages</Link>
      <h1 className="display text-5xl mt-2 mb-6">{page.title}</h1>
      <PageForm page={page} />
    </div>
  );
}
