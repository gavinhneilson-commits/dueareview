import type { SocialLinks as S } from "@/lib/types";

const ICONS: Record<keyof S, { label: string; path: string }> = {
  youtube: { label: "YouTube", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z" },
  instagram: { label: "Instagram", path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" },
  tiktok: { label: "TikTok", path: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" },
  x: { label: "X", path: "M17.8 3h3.2l-7 8 8.2 10h-6.4l-5-6.6L5 21H1.8l7.5-8.6L1.4 3H8l4.5 6 5.3-6zm-1.1 16.2h1.8L7.4 4.7H5.5l11.2 14.5z" },
  facebook: { label: "Facebook", path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" },
  threads: { label: "Threads", path: "M16.7 11.2c-.1 0-.2-.1-.3-.1-.2-3.1-1.9-4.9-4.7-4.9-1.7 0-3.1.7-4 2l1.6 1.1c.6-1 1.6-1.2 2.4-1.2 1 0 1.7.3 2.2.8.3.4.6 1 .7 1.7-.8-.1-1.6-.2-2.5-.1-2.5.1-4.1 1.6-4 3.6.1 1 .6 1.9 1.5 2.5.7.5 1.7.7 2.7.7 1.3-.1 2.4-.6 3.1-1.5.5-.7.9-1.6 1-2.7.6.4 1.1.9 1.3 1.5.5 1 .5 2.7-.9 4-1.2 1.2-2.6 1.7-4.8 1.7-2.4 0-4.2-.8-5.4-2.3-1.1-1.4-1.7-3.4-1.7-6s.6-4.6 1.7-6c1.2-1.5 3-2.3 5.4-2.3 2.4 0 4.2.8 5.5 2.3.6.7 1.1 1.7 1.4 2.8l1.9-.5c-.4-1.4-1-2.6-1.8-3.6C17 2.9 14.8 2 12 2c-2.8 0-5 .9-6.5 2.8C4.2 6.4 3.5 8.7 3.5 12s.7 5.6 2 7.2C7 21.1 9.2 22 12 22c2.5 0 4.2-.7 5.7-2.1 1.9-1.9 1.9-4.3 1.2-5.8-.4-1.1-1.3-2-2.2-2.9zm-4.4 4.2c-1 .1-2.1-.4-2.1-1.4 0-.8.5-1.6 2.3-1.7h.6c.6 0 1.2.1 1.8.2-.2 2.5-1.4 2.8-2.6 2.9z" },
};

export function SocialLinks({ social, className = "" }: { social: S; className?: string }) {
  const entries = (Object.keys(ICONS) as (keyof S)[]).filter((k) => social[k]);
  if (!entries.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {entries.map((k) => (
        <li key={k}>
          <a href={social[k]} target="_blank" rel="noopener me" className="grid h-10 w-10 place-items-center border-2 border-current hover:bg-signal hover:text-signal-ink hover:border-ink transition-colors" aria-label={`Due A Review on ${ICONS[k].label}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={ICONS[k].path} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
