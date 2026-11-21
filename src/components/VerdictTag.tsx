export function VerdictTag({ label, className = "" }: { label: string | null; className?: string }) {
  if (!label) return null;
  return (
    <span className={`inline-block border-2 border-ink bg-paper px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide ${className}`}>
      “{label}”
    </span>
  );
}

const COLLECTION = {
  good: { label: "The Good", cls: "bg-good-bg text-good border-good" },
  bad: { label: "The Bad", cls: "bg-bad-bg text-bad border-bad" },
  ugly: { label: "The Ugly", cls: "bg-ugly-bg text-ugly border-ugly" },
} as const;

export function CollectionTag({ c }: { c: "good" | "bad" | "ugly" | null }) {
  if (!c) return null;
  const x = COLLECTION[c];
  return <span className={`kicker inline-block border px-1.5 py-0.5 ${x.cls}`}>{x.label}</span>;
}
