import { formatScore, ratingBand } from "@/lib/rating";

const toneClass: Record<string, string> = {
  outstanding: "bg-good text-paper",
  excellent: "bg-good text-paper",
  verygood: "bg-ink text-paper",
  good: "bg-ink text-paper",
  average: "bg-bad-bg text-bad",
  poor: "bg-ugly-bg text-ugly",
  avoid: "bg-ugly text-paper",
};

/** Compact score chip for cards. */
export function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="kicker text-muted">Unscored</span>;
  const band = ratingBand(score);
  return (
    <span className={`inline-flex items-baseline gap-1 px-2 py-1 font-mono font-bold ${toneClass[band.tone]}`}
      aria-label={`Rated ${formatScore(score)} out of 10, ${band.label}`}>
      <span className="text-lg leading-none">{formatScore(score)}</span>
      <span className="text-[0.65rem]">/10</span>
    </span>
  );
}

/** Big "verdict stamp" used on review pages. */
export function ScoreStamp({ score, verdict, size = "lg" }: { score: number; verdict?: string | null; size?: "md" | "lg" }) {
  const band = ratingBand(score);
  const big = size === "lg";
  return (
    <div className={`relative inline-flex flex-col items-center justify-center border-[3px] border-ink bg-card shadow-[6px_6px_0_var(--ink)] ${big ? "w-44 min-h-44 py-4" : "w-36 min-h-36 py-3"}`}
      role="img" aria-label={`Score: ${formatScore(score)} out of 10. ${band.label}.${verdict ? ` Verdict: ${verdict}.` : ""}`}>
      <span className="kicker text-muted" aria-hidden="true">Score</span>
      <span aria-hidden="true" className={`font-mono font-extrabold tracking-tight leading-none ${big ? "text-6xl" : "text-5xl"}`}>{formatScore(score)}</span>
      <span aria-hidden="true" className={`mt-2 mx-2 px-2 py-0.5 text-center leading-tight text-[0.7rem] font-bold uppercase tracking-wide ${toneClass[band.tone]}`}>{band.label}</span>
    </div>
  );
}

/** 0–10 meter with ticks; used for sub-scores. */
export function ScoreMeter({ label, score }: { label: string; score: number | null }) {
  if (score === null) return null;
  const pct = Math.max(0, Math.min(100, score * 10));
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span className="font-mono font-bold">{formatScore(score)}</span>
      </div>
      <div className="relative h-3 bg-paper-2 border-2 border-ink" role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={score} aria-label={label}>
        <div className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${pct}%` }} />
        <div className="absolute inset-0 grid grid-cols-10" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => <span key={i} className="border-r border-ink/25 last:border-0" />)}
        </div>
      </div>
    </div>
  );
}
