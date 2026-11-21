import Link from "next/link";
import { SITE_URL, isDemoMode } from "@/lib/env";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const all = [{ href: "/", label: "Home" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="kicker text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((it, i) => (
            <li key={it.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? <span aria-current="page" className="text-ink">{it.label}</span> : <Link href={it.href} className="hover:text-ink hover:underline">{it.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      {!isDemoMode && (
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${SITE_URL}${it.href === "/" ? "" : it.href}` })),
        }} />
      )}
    </>
  );
}
