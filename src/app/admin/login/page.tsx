import { isDemoMode } from "@/lib/env";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md border-2 border-ink bg-card p-8 shadow-[8px_8px_0_var(--ink)]">
        <Logo />
        <h1 className="display text-4xl mt-6">Staff sign in</h1>
        {isDemoMode ? (
          <p className="mt-4 text-ink-2">The admin needs a Supabase project. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment, then restart. See the README.</p>
        ) : (
          <>
            {sp.error === "not-authorised" && <p role="alert" className="mt-4 border-2 border-ugly bg-ugly-bg text-ugly p-3 text-sm font-semibold">You’re signed in but don’t have a staff role yet. Ask an admin to grant access.</p>}
            <LoginForm next={sp.next} />
          </>
        )}
      </div>
    </main>
  );
}
