import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DemoBanner } from "@/components/DemoBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { getSettings } from "@/lib/data";
import { isDemoMode } from "@/lib/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {isDemoMode && <DemoBanner />}
      <SiteHeader youtube={settings.social.youtube || undefined} />
      <main id="main">{children}</main>
      <SiteFooter social={settings.social} />
      <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined} />
    </>
  );
}
