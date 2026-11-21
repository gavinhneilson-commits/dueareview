# Architecture

## Stack, and why I kept yours

Your preferred stack is the right one, so it stays: **Next.js 15 + TypeScript + Tailwind + Supabase**, deployed to **Cloudflare Workers** via OpenNext.

- **Next.js App Router:** server-rendered pages (good for SEO), incremental static regeneration so pages are cached but new reviews appear within about 60 seconds, and server actions for the admin, so there's no separate API to secure.
- **Supabase:** Postgres with **Row Level Security** means draft protection lives in the database itself. Even a bug in the website can't leak a draft. Auth and image storage are included.
- **Cloudflare Workers:** fast in the UK, cheap, and your domain is likely there already. The trade-off is no built-in Next image optimiser, so images are served as uploaded (upload sensibly sized WebP/JPEG). If you'd rather not deal with that, Vercel runs the same code with zero changes.

## Request flow

```
Visitor ─► Cloudflare Worker (Next.js) ─► Supabase REST (anon key) ─► Postgres + RLS (live content only)
Staff   ─► /admin (middleware checks session) ─► server action ─► requireStaff(role) ─► Supabase as that user ─► RLS + triggers
```

There are three layers of protection for admin actions: the middleware redirect, a role check in every page and action (`requireStaff`), and the database (RLS policies plus triggers). The site never uses the service-role key.

## Data model

| Table | Purpose |
| --- | --- |
| `profiles` | One per auth user. `role` = admin / editor / contributor / NULL (no access). |
| `categories` | Editable list (slug, name, description, order). |
| `reviews` | Everything in a review. `status` + `published_at` drive visibility. Generated `search` tsvector for full-text search. |
| `review_updates` | Public, dated update/correction log per review. |
| `comparisons`, `comparison_items` | Comparison articles and their products (optionally linked to reviews). |
| `videos` | YouTube / Shorts / Instagram links, optionally linked to a review. |
| `site_settings` | Key/value JSON: social links, homepage picks, disclosure text, contact email, legal page overrides (`page:<slug>`). |
| `submissions` | Contact, review requests, reader questions, corrections, brand responses. Anyone can insert; only staff can read. |
| `storage.media` | Public image bucket. Staff upload; editors delete. 8 MB limit, image types only. |

### Publishing rules (enforced in Postgres)
- Public visibility = `status in (published, scheduled) AND published_at <= now()`. Scheduling needs no cron job.
- `publish_requires_approved_rating`: a live review must have an overall score **and** `rating_approved = true`.
- `sponsored_requires_disclosure`: sponsored reviews must include disclosure text.
- Trigger `guard_review_publish`: only editors/admins can publish, schedule or approve scores.
- Trigger `guard_role_change`: only admins can change roles.

## Key files

- `src/lib/data.ts`: all public reads (cached per request, ISR per page). It falls back to `sample-data.ts` in demo mode.
- `src/lib/admin-data.ts`: staff reads, using the signed-in user's session.
- `src/app/admin/actions.ts`: every write, validated (zod and custom checks) and role-checked.
- `src/lib/markdown.ts`: a small, deliberately strict Markdown renderer. It escapes all HTML and only allows http(s), mailto, relative and anchor links.
- `src/components/ReviewArticle.tsx`: the review layout, shared by the public page and the admin preview.

## Adding things later
- **Price tracking:** add a `price_points (review_id, retailer, price_pence, seen_at)` table and a scheduled Worker (Cron Trigger) that records prices. Show a sparkline on the review.
- **Comments/community:** use Supabase Auth for readers (separate from staff roles), a `comments` table with RLS, and moderation in the admin inbox.
- **Brand responses as threads:** add a `brand_responses` table linked to `submissions`, with an "approved response" shown under the review.
