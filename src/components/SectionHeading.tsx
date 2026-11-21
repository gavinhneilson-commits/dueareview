import Link from "next/link";

export function SectionHeading({ kicker, title, href, linkLabel, id }: { kicker?: string; title: React.ReactNode; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
      <div>
        {kicker && <p className="kicker text-signal-text">{kicker}</p>}
        <h2 id={id} className="display text-5xl sm:text-6xl mt-1">{title}</h2>
      </div>
      {href && <Link href={href} className="font-bold underline underline-offset-4 decoration-2 decoration-signal hover:decoration-ink">{linkLabel ?? "See all"} →</Link>}
    </div>
  );
}
