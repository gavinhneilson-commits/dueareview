# Due A Review — dueareview.com

> **You can’t buy a good review. You can only earn one.**

Independent UK review platform: Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · deploys to Cloudflare Workers.

---

## Run it in 2 minutes (demo mode)

```bash
npm install
npm run dev          # http://localhost:3000
```

With no Supabase keys set, the site runs in **demo mode**: it shows clearly-labelled *fictional* sample reviews, a “Demo mode” banner on every page, `noindex` everywhere, an empty sitemap and no review structured data. Nothing fake can leak to Google. The admin is offline in demo mode.

To go live, follow **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (about 30 minutes, start to finish).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve (Node) |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (scores, safe Markdown, YouTube parsing, filters) |
| `npm run cf:build` | Build for Cloudflare Workers |
| `npm run cf:deploy` | Build + deploy to Cloudflare |

## Where things are

```
src/
  app/
    (site)/            Public website (home, reviews, categories, compare, videos, promise, legal, contact)
    admin/             Admin: login + (panel)/ dashboard, reviews, comparisons, videos, media, categories, inbox, pages, settings, users
    admin/actions.ts   All admin server actions (validated, role-checked)
    actions/public.ts  Newsletter + contact form actions
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/          UI (ReviewCard, ReviewArticle, ScoreBadge, YouTubeEmbed, CookieConsent, …) and admin/ forms
  content/legal.ts     Default legal/policy drafts (editable in Admin → Pages & legal)
  lib/                 data.ts (public reads), admin-data.ts (staff reads), auth.ts (roles), rating.ts, markdown.ts, …
  middleware.ts        Session refresh + /admin gate
supabase/
  migrations/          Database schema, Row Level Security, storage bucket, reference data
  bootstrap_admin.sql  Make yourself admin (run once)
  tests/               SQL security tests for RLS (24 checks)
public/brand/          Logo, social avatars, YouTube banner, wordmarks
docs/                  Deployment, architecture, brand, launch checklist
```

## Feature status — what’s done, what’s a placeholder, what’s next

### ✅ Complete and tested
- **Brand & design**: “grade-A stamp” identity, condensed editorial type, paper/ink/Verdict-Orange palette, light + dark themes, responsive, subtle motion (respects reduced-motion).
- **Homepage**: hero with your headline, featured review stamp, marquee, Latest Reviews, The Good / The Bad / The Ugly, Worth Your Money?, Latest Videos, Our Promise, newsletter.
- **Reviews**: every field in the brief (brand/model, category, images + gallery, reviewed/updated dates, price + label, how obtained, testing duration/notes, YouTube embed, written review, pros/cons, performance/value/build scores, specs, final verdict, verdict label, retailer links, affiliate + sponsorship disclosure, update history).
- **0–10 scoring** with one decimal place and the seven bands. Scores are never automatic: a review **cannot go live** until an editor ticks “I approve this score” — enforced in the database, not just the UI.
- **Honesty tools**: fact / test result / opinion callouts in the editor; transparency fields required before publishing; affiliate disclosure appears automatically when any link is marked affiliate; sponsored reviews require a disclosure (DB-enforced).
- **Search & discovery**: Postgres full-text search, category, brand, min-score and max-price filters, newest / highest / lowest sort, pagination, related reviews, featured reviews, collections pages. Works without JavaScript.
- **Comparisons**: A vs B, Best under £X, Budget vs Premium, buying guides; side-by-side specs, scores, prices, pros/cons, testing observations, best-for, recommendation; can pull products from existing reviews.
- **Video**: Videos page, homepage videos, embeds inside reviews, Shorts (vertical), privacy-enhanced click-to-load (nothing loads from YouTube until play).
- **Admin**: secure login, roles (admin / editor / contributor), create / edit / preview / publish / schedule / unpublish / delete, drafts, image uploads + media library, categories, comparisons, videos, homepage hero + featured picks, social links, disclosure text, editable legal pages, inbox for reader submissions, user roles.
- **Security**: Row Level Security on every table (drafts invisible at database level), contributors can’t publish or approve scores (DB triggers), no service-role key anywhere, validated inputs, safe Markdown (HTML escaped), security headers, admin `noindex`.
- **SEO**: unique titles/descriptions, canonicals, Open Graph + auto-generated share images with the score, Review / Article / Breadcrumb / Organization JSON-LD (only for real, published content), XML sitemap, robots.txt, Search Console verification, ISR caching.
- **Legal/privacy**: drafts of Privacy, Cookies, Terms, Affiliate Disclosure and Editorial Independence; PECR-style consent banner (analytics off until opt-in, reject as easy as accept); contact page with review requests, reader questions, corrections and brand responses.
- **Accessibility**: 0 axe-core violations (WCAG 2.2 AA rule set) on 12 key pages in both light and dark themes; skip link, keyboard-operable menu, visible focus, labelled forms, semantic tables.

### 🟡 Placeholders (built, but need your setup or a decision)
- **Newsletter** — Buttondown integration is wired up; the form stays visibly disabled (“Coming soon”) until `BUTTONDOWN_API_KEY` is set. Never fakes a success. *Not tested against the live Buttondown API — check one sign-up after launch.*
- **Analytics** — GA4 loads only after consent when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; the admin dashboard shows a link to your analytics, not in-dashboard charts.
- **Instagram** — Instagram posts appear as link cards (official embeds load Meta tracking, which needs consent handling).
- **Legal pages** — drafts with `[PLACEHOLDERS]`; need a UK solicitor’s review (see docs/LAUNCH-CHECKLIST.md).
- **Product images** — until you upload photos, products show a typographic placeholder (never stock photos pretending to be the product).

### 🔜 Later phases (foundations in place, not built)
Product price tracking · deals & buying-guide hub · community features / comments · reader accounts · structured brand-response threads (today: brand responses arrive via the contact form and corrections go in the public update history) · in-admin analytics charts · newsletter sponsorship slots · ad slots.

## Testing done
- `npm test` — unit tests (7 groups).
- `supabase/tests/rls_security_tests.sql` — 24 database security checks (anon/no-role/contributor/editor/admin visibility and permissions, scheduling, score approval, sponsorship disclosure, storage uploads).
- Browser checks (Playwright): filters, search, sort, empty states, 404s, header search, mobile menu + Escape, theme persistence, skip link, contact form failure messages, newsletter disabled state, demo-mode `noindex`/robots/no JSON-LD, share images.
- Cloudflare: `opennextjs-cloudflare build` + local `wrangler dev` serving pages, search, 404s, sitemap and share images.

**Not tested end-to-end:** signing in and publishing through the app against a real Supabase project (couldn’t run Supabase’s auth server in the build sandbox). The database rules behind it are tested directly. Do the 5-minute smoke test in docs/DEPLOYMENT.md §6 once connected.
