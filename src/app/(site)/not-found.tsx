import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="kicker text-signal-text">Error 404</p>
      <h1 className="display text-7xl sm:text-9xl mt-4">0.0 / 10</h1>
      <p className="mt-6 text-xl text-ink-2">This page doesn’t exist. Verdict: <strong>Complete Letdown</strong>. Sorry about that.</p>
      <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn btn-primary">Back home</Link><Link href="/reviews" className="btn btn-ghost">Browse reviews</Link></div>
    </div>
  );
}
