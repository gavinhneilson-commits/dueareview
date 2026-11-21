/** Helpers for reading FormData safely. */
export const str = (fd: FormData, k: string): string | null => {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
};
export const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
export const lines = (fd: FormData, k: string, max = 20) =>
  (str(fd, k) ?? "").split("\n").map((l) => l.replace(/^[-*•+]\s*/, "").trim()).filter(Boolean).slice(0, max).map((l) => l.slice(0, 300));
export function json<T>(fd: FormData, k: string, fallback: T): T {
  const v = str(fd, k);
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}
export const pounds = (fd: FormData, k: string): number | null => {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(/[£,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw new Error("Price must be a number in pounds, e.g. 49.99");
  return Math.round(n * 100);
};
export const safeUrl = (v: string | null): string | null => {
  if (!v) return null;
  try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null; } catch { return null; }
};

/** Map Postgres errors to human messages. */
export function dbMessage(err: { code?: string; message?: string } | null): string {
  if (!err) return "Unknown error";
  if (err.code === "23505") return "That URL slug is already used. Choose a different one.";
  if (err.code === "42501" || /row-level security/i.test(err.message ?? "")) return "You don’t have permission to do that.";
  if (/publish_requires_approved_rating/.test(err.message ?? "")) return "A review can’t go live until it has a score that’s been approved.";
  if (/sponsored_requires_disclosure/.test(err.message ?? "")) return "Sponsored reviews need a sponsor disclosure.";
  if (/Only editors or admins/.test(err.message ?? "")) return "Only editors or admins can publish, schedule or approve scores.";
  return err.message ?? "Something went wrong";
}
