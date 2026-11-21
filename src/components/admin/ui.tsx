"use client";
import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "btn btn-ink", name, value, pendingText, disabled, formNoValidate }: {
  children: React.ReactNode; className?: string; name?: string; value?: string; pendingText?: string; disabled?: boolean; formNoValidate?: boolean;
}) {
  const { pending } = useFormStatus();
  return <button className={className} name={name} value={value} disabled={pending || disabled} formNoValidate={formNoValidate}>{pending ? pendingText ?? "Saving…" : children}</button>;
}

export function FormMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`border-2 p-3 font-semibold ${state.ok ? "border-good bg-good-bg text-good" : "border-ugly bg-ugly-bg text-ugly"}`}>
      {state.message}
    </p>
  );
}

export function FieldError({ msg, id }: { msg?: string; id?: string }) {
  if (!msg) return null;
  return <p id={id} className="mt-1 text-sm font-semibold text-ugly">{msg}</p>;
}

export function ConfirmButton({ children, message, className = "btn btn-ghost btn-sm" }: { children: React.ReactNode; message: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}


/**
 * Like useActionState, but submits via onSubmit so React does NOT reset the form afterwards.
 * (React 19 resets uncontrolled forms after an action — terrible when validation fails on a long review.)
 * The clicked submit button's name/value (e.g. intent=publish) is included.
 */
type KS = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;
export function useKeepForm<S extends KS = KS>(action: (prev: S, fd: FormData) => Promise<S>, initial: S) {
  const [state, run, pending] = useActionState<S, FormData>(action as (prev: Awaited<S>, fd: FormData) => Promise<S>, initial as Awaited<S>);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => run(fd));
  };
  return { state, pending, onSubmit };
}

export function Btn({ children, className = "btn btn-ink", name, value, pending, pendingText, disabled }: {
  children: React.ReactNode; className?: string; name?: string; value?: string; pending: boolean; pendingText?: string; disabled?: boolean;
}) {
  return <button type="submit" className={className} name={name} value={value} disabled={pending || disabled}>{pending ? pendingText ?? "Saving…" : children}</button>;
}
