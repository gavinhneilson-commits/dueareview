/** The DAR mark: a "grade A" stamp. Pure paths, so it renders identically everywhere (favicons, social). */
export function Mark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect x="8" y="8" width="52" height="52" fill="var(--ink, #121110)" />
      <rect x="4" y="4" width="52" height="52" fill="var(--signal, #ff5a1f)" stroke="var(--ink, #121110)" strokeWidth="3" />
      <path fillRule="evenodd" fill="var(--signal-ink, #121110)"
        d="M15 47 L26 13 H35 L46 47 H37.5 L35.6 40.5 H25.4 L23.5 47 Z M27.3 34 H33.7 L30.5 22.5 Z" />
    </svg>
  );
}

/** Wordmark: DUE [A] REVIEW — the A is the stamp, tilted like it's just been slapped on. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 select-none">
      <span className="sr-only">Due A Review</span>
      {compact ? (
        <Mark size={36} />
      ) : (
        <span aria-hidden="true" className="display text-[1.65rem] sm:text-[1.9rem] leading-none inline-flex items-center gap-1.5">
          <span>Due</span>
          <span className="stamp inline-grid place-items-center bg-signal text-signal-ink border-2 border-ink w-[1.1em] h-[1.1em] -rotate-6 shadow-[3px_3px_0_var(--ink)]">A</span>
          <span>Review</span>
        </span>
      )}
    </span>
  );
}
