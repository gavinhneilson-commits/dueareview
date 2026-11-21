"use client";
import { useActionState, useEffect, useState } from "react";
import { submitMessage, type FormState } from "@/app/actions/public";

const KINDS = [
  ["contact", "General enquiry"],
  ["review_request", "Request a review"],
  ["reader_question", "Ask us a question"],
  ["correction", "Report a mistake"],
  ["brand_response", "Brand response to a review"],
] as const;

export function ContactForm({ initialKind = "contact" }: { initialKind?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitMessage, null);
  const [kind, setKind] = useState(initialKind);
  const [t, setT] = useState(0);
  useEffect(() => setT(Date.now()), []);
  if (state?.ok) return <p role="status" className="border-2 border-ink bg-good-bg text-good p-5 font-semibold">{state.message}</p>;
  const needsUrl = kind === "correction" || kind === "brand_response";
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="t" value={t} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label htmlFor="kind" className="label">What’s this about?</label>
        <select id="kind" name="kind" className="field" value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {kind === "brand_response" && <p className="hint">Brands can flag factual errors or add a response. We’ll consider it carefully and correct genuine mistakes — but we don’t change opinions or scores on request.</p>}
        {kind === "review_request" && <p className="hint">Tell us what you want reviewed and why. We can’t promise to cover everything.</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="name" className="label">Name <span className="text-muted font-normal">(optional)</span></label><input id="name" name="name" className="field" autoComplete="name" maxLength={120} /></div>
        <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" className="field" autoComplete="email" maxLength={254} /></div>
      </div>
      <div><label htmlFor="subject" className="label">{kind === "review_request" ? "Product" : "Subject"}</label><input id="subject" name="subject" className="field" maxLength={200} /></div>
      {needsUrl && <div><label htmlFor="related_url" className="label">Link to the review</label><input id="related_url" name="related_url" type="url" className="field" placeholder="https://dueareview.com/reviews/…" /></div>}
      <div><label htmlFor="message" className="label">Message</label><textarea id="message" name="message" rows={6} className="field" required minLength={5} maxLength={5000} /></div>
      {state && !state.ok && <p role="alert" className="text-ugly font-semibold">{state.message}</p>}
      <p className="hint">We store your message so we can reply. See our privacy policy for how long we keep it.</p>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send it"}</button>
    </form>
  );
}
