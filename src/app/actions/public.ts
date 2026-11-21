"use server";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { getPublicSupabase } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string } | null;

const email = z.string().trim().toLowerCase().email("Please enter a valid email address").max(254);

export async function subscribeNewsletter(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "Thanks!" }; // honeypot: silently drop bots
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return { ok: false, message: "The newsletter isn’t switched on yet. Check back soon." };
  const parsed = email.safeParse(fd.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (fd.get("consent") !== "on") return { ok: false, message: "Please tick the box to confirm you want the newsletter." };
  try {
    const res = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: parsed.data, tags: ["website"] }),
    });
    if (res.ok) return { ok: true, message: "Nearly there — check your inbox to confirm your subscription." };
    if (res.status === 400 || res.status === 409) {
      const txt = await res.text();
      if (/already/i.test(txt)) return { ok: true, message: "You’re already on the list. Good taste." };
    }
    console.error("Buttondown error", res.status);
    return { ok: false, message: "Something went wrong on our end and you have NOT been subscribed. Please try again later." };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "We couldn’t reach our newsletter provider, so you have NOT been subscribed. Please try again later." };
  }
}

const submissionSchema = z.object({
  kind: z.enum(["contact", "review_request", "reader_question", "brand_response", "correction"]),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.union([email, z.literal("")]).optional(),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Your message is a bit short").max(5000, "Please keep it under 5,000 characters"),
  related_url: z.union([z.string().trim().url("That link doesn’t look valid").max(500), z.literal("")]).optional(),
});

export async function submitMessage(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "Thanks — message received." };
  // Very basic timing check: real people take more than 3 seconds to fill in a form.
  const started = Number(fd.get("t") || 0);
  if (started && Date.now() - started < 3000) return { ok: false, message: "That was quick! Please try again." };
  if (isDemoMode) return { ok: false, message: "This form isn’t connected yet (demo mode). Your message has NOT been sent." };

  const parsed = submissionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  if ((d.kind === "brand_response" || d.kind === "correction" || d.kind === "contact") && !d.email)
    return { ok: false, message: "Please include an email so we can reply." };

  const { error } = await getPublicSupabase().from("submissions").insert({
    kind: d.kind, name: d.name || null, email: d.email || null, subject: d.subject || null,
    message: d.message, related_url: d.related_url || null,
  } as never);
  if (error) {
    console.error(error);
    return { ok: false, message: "Something went wrong and your message has NOT been sent. Please try again." };
  }
  return { ok: true, message: "Message received. We read everything, even the angry ones." };
}
