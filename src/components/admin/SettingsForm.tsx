"use client";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";
import { Btn, FormMessage, useKeepForm } from "./ui";

export function SettingsForm({ settings, reviews }: { settings: SiteSettings; reviews: { id: string; title: string; status: string }[] }) {
  const { state, pending, onSubmit } = useKeepForm<ActionState>(saveSettings, null);
  const live = reviews.filter((r) => r.status === "published" || r.status === "scheduled");
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FormMessage state={state} />
      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <h2 className="display text-2xl">Social accounts</h2>
        <p className="hint !mt-0">Paste your full profile URLs. Leave blank to hide an icon.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["youtube", "instagram", "tiktok", "x", "facebook", "threads"] as const).map((k) => (
            <div key={k}><label htmlFor={`s-${k}`} className="label capitalize">{k === "x" ? "X (Twitter)" : k}</label>
              <input id={`s-${k}`} name={`social_${k}`} type="url" defaultValue={settings.social[k]} className="field" placeholder={`https://…`} /></div>
          ))}
        </div>
      </section>
      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <h2 className="display text-2xl">Homepage</h2>
        <div><label htmlFor="hero" className="label">Hero review</label>
          <select id="hero" name="hero_review_id" defaultValue={settings.homepage.hero_review_id ?? ""} className="field">
            <option value="">Automatic (latest featured review)</option>
            {live.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select></div>
        <fieldset><legend className="label">Pinned featured reviews (up to 6)</legend>
          <p className="hint !mt-0 mb-2">Leave all unticked to use reviews marked “Featured”.</p>
          <div className="max-h-64 overflow-y-auto border border-rule p-2 space-y-1">
            {live.map((r) => <label key={r.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured_review_ids" value={r.id} defaultChecked={settings.homepage.featured_review_ids.includes(r.id)} />{r.title}</label>)}
            {!live.length && <p className="text-sm text-muted">No live reviews yet.</p>}
          </div>
        </fieldset>
      </section>
      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <h2 className="display text-2xl">Disclosures</h2>
        <div><label htmlFor="aff" className="label">Affiliate notice (shown on reviews with affiliate links)</label><textarea id="aff" name="affiliate_short" rows={3} defaultValue={settings.disclosures.affiliate_short} className="field" /></div>
        <div><label htmlFor="spon" className="label">Default sponsored notice</label><textarea id="spon" name="sponsored_short" rows={2} defaultValue={settings.disclosures.sponsored_short} className="field" /></div>
      </section>
      <section className="border-2 border-ink bg-card p-5 space-y-4">
        <h2 className="display text-2xl">Contact</h2>
        <div><label htmlFor="ce" className="label">Public contact email (optional)</label><input id="ce" name="contact_email" type="email" defaultValue={settings.contact.email} className="field" /></div>
      </section>
      <Btn pending={pending} className="btn btn-primary">Save settings</Btn>
    </form>
  );
}
