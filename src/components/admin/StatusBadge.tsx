const S: Record<string, string> = {
  draft: "bg-paper-2 text-ink border-rule",
  scheduled: "bg-bad-bg text-bad border-bad",
  published: "bg-good-bg text-good border-good",
  unpublished: "bg-ugly-bg text-ugly border-ugly",
};
export function StatusBadge({ status, publishedAt }: { status: string; publishedAt?: string | null }) {
  const live = (status === "published" || status === "scheduled") && publishedAt && new Date(publishedAt) <= new Date();
  const label = status === "scheduled" && live ? "live (scheduled)" : status;
  return <span className={`kicker inline-block border px-1.5 py-0.5 ${S[live ? "published" : status] ?? S.draft}`}>{label}</span>;
}
