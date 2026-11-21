import Link from "next/link";
import type { SocialLinks as S } from "@/lib/types";
import { Mark } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { CookieSettingsButton } from "./CookieConsent";

export function SiteFooter({ social }: { social: S }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-night text-night-text dark:border-t-2 dark:border-rule">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><Mark size={44} /><span className="display text-3xl">Due A Review</span></div>
          <p className="mt-4 max-w-sm text-night-text/80">You can’t buy a good review. You can only earn one. Independent UK reviews of the stuff you’re thinking of buying.</p>
          <SocialLinks social={social} className="mt-6" />
        </div>
        <FooterCol title="Reviews" links={[["/reviews", "All reviews"], ["/categories", "Categories"], ["/collections/good", "The Good"], ["/collections/bad", "The Bad"], ["/collections/ugly", "The Ugly"], ["/worth-your-money", "Worth Your Money?"]]} />
        <FooterCol title="About" links={[["/our-promise", "Our Promise"], ["/how-we-score", "How we score"], ["/legal/editorial-independence", "Editorial independence"], ["/legal/affiliate-disclosure", "Affiliate disclosure"], ["/contact", "Contact & review requests"]]} />
        <FooterCol title="Legal" links={[["/legal/privacy", "Privacy policy"], ["/legal/cookies", "Cookie policy"], ["/legal/terms", "Terms of use"]]}>
          <li><CookieSettingsButton /></li>
        </FooterCol>
      </div>
      <div className="border-t border-night-text/15">
        <p className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-sm text-night-text/75">
          © {year} Due A Review. Some links are affiliate links — they never affect our scores. <Link href="/legal/affiliate-disclosure" className="underline">How we make money</Link>.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, children }: { title: string; links: [string, string][]; children?: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="kicker text-signal">{title}</h2>
      <ul className="mt-4 space-y-2">
        {links.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-signal hover:underline underline-offset-4">{label}</Link></li>)}
        {children}
      </ul>
    </nav>
  );
}
