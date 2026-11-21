import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from "@/lib/env";

/**
 * Per-request Supabase client bound to the visitor's auth cookies.
 * Uses ONLY the public anon key: every query is constrained by Row Level Security.
 */
export async function getSupabase() {
  if (isDemoMode) throw new Error("Supabase is not configured");
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component — middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Cookie-less anonymous client for public reads (cacheable, never sees drafts). */
let anon: ReturnType<typeof createClient> | null = null;
export function getPublicSupabase() {
  if (isDemoMode) throw new Error("Supabase is not configured");
  anon ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  return anon;
}
