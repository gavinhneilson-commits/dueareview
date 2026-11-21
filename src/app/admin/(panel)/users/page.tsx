import { adminProfiles } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { setRole } from "@/app/admin/actions";

export const metadata = { title: "Users" };

export default async function Users() {
  const me = await requireStaff("admin");
  const users = await adminProfiles();
  return (
    <div className="max-w-4xl">
      <h1 className="display text-5xl">Users & roles</h1>
      <div className="mt-4 border-2 border-ink bg-card p-4 text-sm space-y-1">
        <p><strong>Admin</strong> — everything, including settings, users and deleting. <strong>Editor</strong> — write, approve scores, publish, manage comparisons/videos/categories. <strong>Contributor</strong> — write and save drafts only.</p>
        <p>To add someone: Supabase dashboard → Authentication → Users → <em>Invite user</em>. They’ll appear here with no access until you give them a role.</p>
      </div>
      <ul className="mt-6 border-2 border-ink bg-card divide-y divide-rule">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <span><span className="font-semibold">{u.display_name || u.email}</span>{u.display_name && <span className="block text-sm text-muted">{u.email}</span>}</span>
            {u.id === me.id ? <span className="kicker">{u.role} (you)</span> : (
              <form action={setRole} className="flex gap-2">
                <input type="hidden" name="id" value={u.id} />
                <label className="sr-only" htmlFor={`r-${u.id}`}>Role for {u.email}</label>
                <select id={`r-${u.id}`} name="role" defaultValue={u.role ?? "none"} className="field !py-1 text-sm">
                  <option value="none">No access</option><option value="contributor">Contributor</option><option value="editor">Editor</option><option value="admin">Admin</option>
                </select>
                <button className="btn btn-ink btn-sm">Update</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
