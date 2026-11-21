import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/data";
import type { SP } from "@/lib/params";

export const metadata: Metadata = { title: "Contact, review requests & corrections", description: "Ask a question, request a review, report a mistake or respond to a review.", alternates: { canonical: "/contact" } };

const VALID = ["contact", "review_request", "reader_question", "brand_response", "correction"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" && VALID.includes(sp.type) ? sp.type : "contact";
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <p className="kicker text-signal-text">Get in touch</p>
        <h1 className="display text-6xl sm:text-7xl mt-2">Talk to us</h1>
        <p className="mt-6 text-lg text-ink-2">Want something reviewed? Got a question? Think we got something wrong? We want to hear it.</p>
        <div className="mt-8 border-2 border-ink bg-card p-5">
          <h2 className="font-bold">Are you a brand or PR?</h2>
          <p className="mt-2 text-ink-2 text-[0.95rem]">You’re welcome to send products, but read <a href="/our-promise" className="underline">our promise</a> first. Sending us something doesn’t buy coverage, and it definitely doesn’t buy a good score.</p>
        </div>
        {settings.contact.email && <p className="mt-6">Or email: <a href={`mailto:${settings.contact.email}`} className="underline font-semibold">{settings.contact.email}</a></p>}
      </div>
      <div className="border-2 border-ink bg-card p-6 sm:p-8"><ContactForm initialKind={type} /></div>
    </div>
  );
}
