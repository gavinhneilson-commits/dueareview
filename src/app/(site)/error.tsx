"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="kicker text-signal-text">Something broke</p>
      <h1 className="display text-6xl sm:text-8xl mt-4">Well, that’s embarrassing.</h1>
      <p className="mt-6 text-lg text-ink-2">Something went wrong loading this page. It’s us, not you.</p>
      <button onClick={reset} className="btn btn-primary mt-8">Try again</button>
    </div>
  );
}
