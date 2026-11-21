import { adminCategories } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { deleteCategory } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Categories" };

export default async function Categories() {
  await requireStaff("editor");
  const cats = await adminCategories();
  return (
    <div className="max-w-6xl">
      <h1 className="display text-5xl">Categories</h1>
      <p className="mt-2 text-ink-2">Add, rename, reorder or remove categories. Removing a category doesn’t delete its reviews — they just become uncategorised. Renaming a slug changes the category’s URL.</p>
      <section className="mt-6 border-2 border-ink bg-card p-5"><h2 className="display text-2xl mb-3">Add a category</h2><CategoryForm /></section>
      <ul className="mt-6 space-y-3">
        {cats.map((c) => (
          <li key={c.id} className="border-2 border-ink bg-card p-4">
            <CategoryForm category={c} />
            <form action={deleteCategory} className="mt-2"><input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`Remove “${c.name}”? Its reviews will become uncategorised.`} className="text-sm underline text-ugly">Remove</ConfirmButton></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
