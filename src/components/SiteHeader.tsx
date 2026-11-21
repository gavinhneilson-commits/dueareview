"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/reviews", label: "Reviews" },
  { href: "/categories", label: "Categories" },
  { href: "/compare", label: "Comparisons" },
  { href: "/videos", label: "Videos" },
  { href: "/our-promise", label: "Our Promise" },
];

export function SiteHeader({ youtube }: { youtube?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group shrink-0"><Logo /><span className="sr-only"> home</span></Link>
        <nav aria-label="Main" className="ml-6 hidden lg:block">
          <ul className="flex gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined}
                    className={`px-3 py-2 font-semibold text-[0.95rem] border-b-[3px] ${active ? "border-signal" : "border-transparent hover:border-ink"}`}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form action="/reviews" role="search" className="hidden md:block">
            <label htmlFor="hdr-q" className="sr-only">Search reviews</label>
            <input id="hdr-q" name="q" type="search" placeholder="Search reviews…" className="field !py-1.5 !w-52 text-sm" />
          </form>
          <ThemeToggle />
          {youtube && (
            <a href={youtube} target="_blank" rel="noopener" className="btn btn-primary btn-sm hidden sm:inline-flex">Subscribe</a>
          )}
          <button type="button" className="grid h-10 w-10 place-items-center border-2 border-ink lg:hidden" aria-expanded={open} aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"}>
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" aria-hidden="true">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t-2 border-ink bg-paper lg:hidden">
          <form action="/reviews" role="search" className="px-4 pt-4">
            <label htmlFor="m-q" className="sr-only">Search reviews</label>
            <input id="m-q" name="q" type="search" placeholder="Search reviews…" className="field" />
          </form>
          <nav aria-label="Mobile">
            <ul className="px-4 py-2">
              {NAV.map((n) => (
                <li key={n.href} className="border-b border-rule last:border-0">
                  <Link href={n.href} className="display block py-3 text-3xl">{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
