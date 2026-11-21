import Link from "next/link";

export function Pagination({ page, total, pageSize, basePath, params }: { page: number; total: number; pageSize: number; basePath: string; params: Record<string, string | undefined> }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== "page" && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && <Link className="btn btn-ghost btn-sm" href={href(page - 1)} rel="prev">← Previous</Link>}
      <span className="font-mono text-sm px-3">Page {page} of {pages}</span>
      {page < pages && <Link className="btn btn-ghost btn-sm" href={href(page + 1)} rel="next">Next →</Link>}
    </nav>
  );
}
