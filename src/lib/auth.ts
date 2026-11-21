import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSupabase } from "./supabase/server";
import type { StaffRole } from "./types";

export interface Staff { id: string; email: string | null; display_name: string | null; role: StaffRole }

const RANK: Record<StaffRole, number> = { contributor: 1, editor: 2, admin: 3 };

/** Current signed-in staff member, verified with Supabase Auth on every request (never trusts the cookie alone). */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("id,email,display_name,role").eq("id", user.id).maybeSingle();
  const p = data as Staff | null;
  return p && p.role ? p : null;
});

/** Use at the top of every admin page and server action. */
export async function requireStaff(min: StaffRole = "contributor"): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login?error=not-authorised");
  if (RANK[staff.role] < RANK[min]) redirect("/admin?denied=1");
  return staff;
}

export const can = (s: Staff, min: StaffRole) => RANK[s.role] >= RANK[min];
