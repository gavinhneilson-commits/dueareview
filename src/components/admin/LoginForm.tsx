"use client";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/admin/actions";
import { FormMessage, SubmitButton } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signIn, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="username" required className="field" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="field" /></div>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-primary w-full" pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
