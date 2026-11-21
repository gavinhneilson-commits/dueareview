"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * UK GDPR / PECR consent: non-essential cookies (analytics) are OFF until the visitor opts in.
 * "Reject" is as prominent as "Accept". Choice is stored for 6 months and can be changed any time.
 */
type Consent = { analytics: boolean; v: 1; ts: number };
const KEY = "dar-consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;

function read(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null") as Consent | null;
    if (!c || Date.now() - c.ts > MAX_AGE_MS) return null;
    return c;
  } catch { return null; }
}
function write(analytics: boolean) {
  const c: Consent = { analytics, v: 1, ts: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  window.dispatchEvent(new CustomEvent("dar-consent", { detail: c }));
  return c;
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="hover:text-signal hover:underline underline-offset-4" onClick={() => window.dispatchEvent(new Event("dar-open-consent"))}>
      Cookie settings
    </button>
  );
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const c = read();
    setConsent(c);
    // Only ask if there is something non-essential to consent to.
    if (!c && gaId) setOpen(true);
    const reopen = () => { setManage(true); setAnalytics(read()?.analytics ?? false); setOpen(true); };
    window.addEventListener("dar-open-consent", reopen);
    return () => window.removeEventListener("dar-open-consent", reopen);
  }, [gaId]);

  const decide = (a: boolean) => {
    const prev = consent?.analytics;
    setConsent(write(a)); setOpen(false); setManage(false);
    if (prev && !a) window.location.reload(); // unload analytics that was already running
  };

  return (
    <>
      {gaId && consent?.analytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{anonymize_ip:true});`}</Script>
        </>
      )}
      {open && (
        <div role="dialog" aria-modal="false" aria-labelledby="cc-title" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border-2 border-ink bg-card p-5 shadow-[6px_6px_0_var(--ink)]">
          <h2 id="cc-title" className="display text-2xl">Cookies. The boring bit.</h2>
          <p className="mt-2 text-sm text-ink-2">
            We use essential cookies to make the site work. With your permission we’d also like to use analytics cookies to see which reviews people actually read. No advertising cookies. Your call. <Link href="/legal/cookies" className="underline">Cookie policy</Link>.
          </p>
          {manage && (
            <fieldset className="mt-4 space-y-3 border-t border-rule pt-4">
              <legend className="sr-only">Cookie preferences</legend>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked disabled className="mt-1" /> <span><strong>Essential</strong> — always on. Login sessions and remembering this choice.</span></label>
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 accent-[var(--signal)]" /> <span><strong>Analytics</strong> — anonymous usage stats (Google Analytics).</span></label>
            </fieldset>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {manage ? (
              <button type="button" className="btn btn-ink btn-sm" onClick={() => decide(analytics)}>Save choices</button>
            ) : (
              <>
                <button type="button" className="btn btn-ink btn-sm" onClick={() => decide(true)}>Accept analytics</button>
                <button type="button" className="btn btn-ink btn-sm" onClick={() => decide(false)}>Reject analytics</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setManage(true); setAnalytics(false); }}>Manage</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
