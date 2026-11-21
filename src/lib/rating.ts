export interface RatingBand { min: number; label: string; tone: "outstanding" | "excellent" | "verygood" | "good" | "average" | "poor" | "avoid" }

export const RATING_BANDS: RatingBand[] = [
  { min: 9, label: "Outstanding", tone: "outstanding" },
  { min: 8, label: "Excellent", tone: "excellent" },
  { min: 7, label: "Very Good", tone: "verygood" },
  { min: 6, label: "Good, with reservations", tone: "good" },
  { min: 5, label: "Average", tone: "average" },
  { min: 3, label: "Disappointing", tone: "poor" },
  { min: 0, label: "Avoid", tone: "avoid" },
];

export function ratingBand(score: number): RatingBand {
  return RATING_BANDS.find((b) => score >= b.min) ?? RATING_BANDS[RATING_BANDS.length - 1];
}

/** Ranges shown on the "How we score" page */
export const RATING_RANGES = [
  { range: "9.0 – 10", ...RATING_BANDS[0], blurb: "Best in class for what it is and what it costs. We'd buy it with our own money without hesitation." },
  { range: "8.0 – 8.9", ...RATING_BANDS[1], blurb: "Genuinely great. A couple of niggles, nothing that should stop you." },
  { range: "7.0 – 7.9", ...RATING_BANDS[2], blurb: "Does the job well. Worth a look, especially if the price is right." },
  { range: "6.0 – 6.9", ...RATING_BANDS[3], blurb: "Decent, but with compromises you should know about before buying." },
  { range: "5.0 – 5.9", ...RATING_BANDS[4], blurb: "Fine. Unremarkable. There's probably something better for the money." },
  { range: "3.0 – 4.9", ...RATING_BANDS[5], blurb: "Falls short of its claims or its price. Proceed with caution." },
  { range: "0 – 2.9", ...RATING_BANDS[6], blurb: "Don't. Just don't. Your money deserves better." },
];

export const VERDICT_PRESETS = [
  "Absolutely Brilliant",
  "Worth Every Penny",
  "Solid Purchase",
  "Good, But Overpriced",
  "All Hype",
  "Save Your Money",
  "Complete Letdown",
];

export function formatScore(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Parse a user-entered score: 0–10, one decimal place. Returns null if blank, throws message if invalid. */
export function parseScore(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > 10) throw new Error("Scores must be between 0 and 10");
  if (Math.round(n * 10) !== n * 10) throw new Error("Scores can have at most one decimal place");
  return n;
}
