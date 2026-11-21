import type { Metadata } from "next";
import { RATING_RANGES, VERDICT_PRESETS } from "@/lib/rating";

export const metadata: Metadata = { title: "How we score", description: "What a Due A Review score out of 10 actually means.", alternates: { canonical: "/how-we-score" } };

const TONE: Record<string, string> = {
  outstanding: "bg-good text-paper", excellent: "bg-good text-paper", verygood: "bg-ink text-paper", good: "bg-ink text-paper",
  average: "bg-bad-bg text-bad", poor: "bg-ugly-bg text-ugly", avoid: "bg-ugly text-paper",
};

export default function HowWeScorePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">The numbers explained</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">How we score</h1>
      <p className="mt-6 text-xl text-ink-2 max-w-3xl">Every product gets a score from 0 to 10, to one decimal place. The score reflects how well a product does its job <strong>relative to its intended purpose and its price</strong>. A brilliant £20 kettle can outscore a mediocre £200 one.</p>
      <ul className="mt-10 border-2 border-ink">
        {RATING_RANGES.map((r) => (
          <li key={r.range} className="grid sm:grid-cols-[10rem_14rem_1fr] gap-2 sm:gap-6 items-center border-b-2 border-ink last:border-0 p-5">
            <span className="font-mono font-extrabold text-2xl">{r.range}</span>
            <span className={`display text-2xl px-2 py-1 w-fit ${TONE[r.tone]}`}>{r.label}</span>
            <span className="text-ink-2">{r.blurb}</span>
          </li>
        ))}
      </ul>
      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="display text-4xl">What goes into it</h2>
          <ul className="mt-4 space-y-2 text-ink-2 list-disc pl-5">
            <li><strong>Performance</strong> — does it do what it says on the box?</li>
            <li><strong>Value for money</strong> — is it worth what it costs?</li>
            <li><strong>Build quality</strong> — will it last? (where relevant)</li>
            <li><strong>Claims vs reality</strong> — marketing promises get checked, not repeated.</li>
          </ul>
          <p className="mt-4 text-ink-2">The overall score isn’t an average of the sub-scores. It’s a judgement, made and approved by a person — never generated automatically.</p>
        </div>
        <div>
          <h2 className="display text-4xl">The verdicts</h2>
          <p className="mt-4 text-ink-2">Every review also gets a short verdict, so you can tell at a glance. Some favourites:</p>
          <ul className="mt-4 flex flex-wrap gap-2">{VERDICT_PRESETS.map((v) => <li key={v} className="border-2 border-ink px-2 py-1 font-extrabold uppercase text-sm">“{v}”</li>)}</ul>
        </div>
      </section>
    </div>
  );
}
