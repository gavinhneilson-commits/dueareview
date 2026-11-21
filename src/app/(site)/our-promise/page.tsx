import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Promise: No Bullshit, Just Honest Reviews",
  description: "Brands can’t buy scores. Free products don’t buy favours. Here’s exactly how Due A Review stays honest — and how we make money without selling out.",
  alternates: { canonical: "/our-promise" },
};

const POINTS: [string, string][] = [
  ["Brands can’t buy a good score.", "Not for money, not for free kit, not for “exposure”. Scores are decided by our team and approved by a human before anything goes live. Our publishing system literally won’t publish a review until someone signs off the score."],
  ["Free products don’t guarantee good coverage.", "Brands sometimes send us products for free or on loan. That gets them a review — not a nice one. Every review tells you exactly how we got the product."],
  ["Sponsorships are disclosed. Every time.", "If a brand has paid us, you’ll know before you read a word. Sponsored content is labelled at the top of the page and in videos."],
  ["Affiliate money never touches the score.", "Some links earn us a small commission if you buy. We decide the score first. We’ll link to things we’ve slated, and recommend things that earn us nothing."],
  ["Fair means judging things for what they are.", "A £50 product isn’t marked down for not being a £500 one. We judge products on their price, purpose, claims, performance, reliability and value."],
  ["Facts, test results and opinions are kept separate.", "In our reviews you’ll see what’s a verified fact, what we measured and what’s just our opinion — clearly labelled, so you can make up your own mind."],
  ["We fix our mistakes in the open.", "Got something wrong? We correct it and add a dated note to the review’s update history. If it changes the score, we say so."],
  ["Brands can respond. They can’t dictate.", "If a brand thinks we’ve got a fact wrong, they can tell us and we’ll look properly. They don’t get to change our opinion, our verdict or our score."],
  ["We never claim testing that didn’t happen.", "We tell you how we tested and for how long — and only what actually happened. Not every product gets months of use or lab equipment, and we won’t pretend otherwise."],
  ["Sponsored content stays separate from our verdicts.", "Paid partnerships are clearly identified and kept apart from our independent reviews. A sponsor can’t buy their way into The Good or out of The Ugly."],
];

export default function PromisePage() {
  return (
    <>
      <section className="border-b-2 border-ink bg-night text-night-text">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <p className="kicker text-signal">Our promise</p>
          <h1 className="display text-6xl sm:text-8xl lg:text-9xl mt-4 max-w-5xl">No bullshit. Just honest reviews.</h1>
          <p className="mt-8 text-xl sm:text-2xl max-w-2xl text-night-text/85">You can’t buy a good review. You can only earn one. Here are the ten rules we hold ourselves to — and how we pay the bills without breaking them.</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <ol className="space-y-0">
          {POINTS.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[4rem_1fr] sm:grid-cols-[7rem_1fr] gap-4 border-t-2 border-ink py-8">
              <span className="display text-6xl sm:text-8xl text-signal-text" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="display-wide text-2xl sm:text-3xl leading-tight"><span className="sr-only">{i + 1}. </span>{t}</h2>
                <p className="mt-3 text-lg text-ink-2">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <section aria-labelledby="money" className="mt-12 border-2 border-ink bg-card p-6 sm:p-10">
          <h2 id="money" className="display text-4xl sm:text-5xl">So how do we make money?</h2>
          <p className="mt-4 text-lg text-ink-2">Honestly: the same way most independent reviewers do. YouTube ads, affiliate links, and — occasionally — clearly labelled sponsorships and brand partnerships. We might add a newsletter sponsor or some tasteful advertising in future. What we won’t do is let any of that decide what we say. If it ever came to a choice between a pay cheque and your trust, we’d keep your trust. It’s worth more.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/legal/affiliate-disclosure" className="btn btn-ink">Affiliate & advertising disclosure</Link>
            <Link href="/legal/editorial-independence" className="btn btn-ghost">Editorial independence policy</Link>
            <Link href="/how-we-score" className="btn btn-ghost">How we score</Link>
          </div>
        </section>
        <p className="mt-8 text-muted">Think we’ve broken one of these rules? <Link href="/contact?type=correction" className="underline">Call us out</Link>.</p>
      </div>
    </>
  );
}
