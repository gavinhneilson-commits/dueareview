import { adminReviewOptions } from "@/lib/admin-data";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function Settings() {
  await requireStaff("admin");
  const [settings, reviews] = await Promise.all([getSettings(), adminReviewOptions()]);
  return (
    <div className="max-w-4xl">
      <h1 className="display text-5xl mb-6">Settings</h1>
      <SettingsForm settings={settings} reviews={reviews} />
      <section className="mt-10 border-2 border-ink bg-card p-5">
        <h2 className="display text-2xl">Integrations (set in environment variables)</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>Newsletter (Buttondown): <strong>{process.env.BUTTONDOWN_API_KEY ? "connected" : "not configured — signup shown as ‘coming soon’"}</strong></li>
          <li>Analytics (GA4, consent-gated): <strong>{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? "configured" : "not configured"}</strong></li>
          <li>Search Console verification: <strong>{process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? "configured" : "not configured"}</strong></li>
        </ul>
      </section>
    </div>
  );
}
