"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="p-2 overflow-x-auto lg:overflow-visible">
      <ul className="flex lg:flex-col gap-1">
        {items.map((i) => {
          const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap px-3 py-2 font-semibold ${active ? "bg-signal text-signal-ink" : "hover:bg-night-text/10"}`}>{i.label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
