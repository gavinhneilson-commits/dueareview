"use client";
import { useActionState } from "react";
import Link from "next/link";
import { subscribeNewsletter, type FormState } from "@/app/actions/public";

export function NewsletterForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, null);
  if (state?.ok) return <p role="status" className="border-2 border-ink bg-good-bg text-good p-4 font-semibold">{state.message}</p>;
  return (
    <form action={action} className="space-y-3" noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input id="nl-email" name="email" type="email" autoComplete="email" required placeholder="you@example.co.uk"
          className="field flex-1" disabled={!enabled || pending} aria-describedby="nl-msg" />
        <button className="btn btn-primary" disabled={!enabled || pending}>{!enabled ? "Coming soon" : pending ? "Signing up…" : "Sign me up"}</button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {enabled && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consent" className="mt-1 accent-[var(--signal)]" required />
          <span>Yes, email me the newsletter. Unsubscribe any time. See our <Link href="/legal/privacy" className="underline">privacy policy</Link>.</span>
        </label>
      )}
      <p id="nl-msg" role={state && !state.ok ? "alert" : undefined} className={`text-sm ${state && !state.ok ? "text-ugly font-semibold" : "text-muted"}`}>
        {state && !state.ok ? state.message : enabled ? "No spam. No selling your email. Just reviews." : "The newsletter isn’t live yet — sign-ups open soon."}
      </p>
    </form>
  );
}
