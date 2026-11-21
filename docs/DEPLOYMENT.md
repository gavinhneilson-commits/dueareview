# Deployment guide

About 30 minutes. You need: a Supabase account (free tier is fine to start), a Cloudflare account with **dueareview.com** added, and Node 20+ on your computer.

---

## 1. Create the Supabase project

1. supabase.com → **New project**. Name it `dueareview`, pick region **London (eu-west-2)** (keeps data in the UK, simpler for GDPR), set a strong database password and save it in a password manager.
2. **Project Settings → API**: copy the **Project URL** and the **anon public** key. You’ll need both.
   ⚠️ Never copy the `service_role` key anywhere. This app doesn’t use it.

## 2. Create the database

**Option A, SQL editor (easiest):** Supabase dashboard → **SQL Editor** → New query. Paste and run each file in order:

1. `supabase/migrations/20261120000001_initial_schema.sql`
2. `supabase/migrations/20261120000002_seed_reference_data.sql`

**Option B, Supabase CLI:**
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## 3. Lock down sign-ups and create your admin account

1. **Authentication → Sign In / Providers → Email**: keep Email enabled. **Turn OFF “Allow new users to sign up”.** Staff are invited, never self-registered.
2. **Authentication → Users → Add user → Create new user**: your email + a strong password, tick *Auto confirm*.
3. **SQL Editor**: open `supabase/bootstrap_admin.sql`, change the email to yours, run it. You’re now an admin.
4. **Authentication → URL Configuration**: Site URL `https://dueareview.com`. Add `http://localhost:3000` to Redirect URLs for local work.
5. Recommended: **Authentication → Multi-Factor** → enable TOTP for staff accounts.

To add team members later: Authentication → Users → **Invite user**, then give them a role in the site’s **Admin → Users**.

## 4. Run locally against Supabase

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```
Open http://localhost:3000/admin and sign in. The demo banner disappears once Supabase is connected.

## 5. Deploy to Cloudflare

```bash
npx wrangler login
```
Set the environment variables for production. Public `NEXT_PUBLIC_*` values are baked in at **build** time, so they must be in `.env.production` (or your CI environment) when you build:

```bash
cp .env.example .env.production   # fill in real values (this file is git-ignored)
```
Server-only secrets go into Cloudflare:
```bash
npx wrangler secret put BUTTONDOWN_API_KEY      # only if using the newsletter
```
Then deploy:
```bash
npm run cf:deploy
```

**Connect the domain:** Cloudflare dashboard → Workers & Pages → `dueareview` → Settings → **Domains & Routes** → Add → Custom domain → `dueareview.com` (and `www.dueareview.com`, then add a redirect rule from www to the bare domain).

**Automatic deploys (optional):** Workers & Pages → `dueareview` → Settings → Builds → connect your GitHub repo. Build command `npm run cf:build`, deploy command `npx wrangler deploy`, and add the `NEXT_PUBLIC_*` variables as **build** variables.

**Caching note:** the default setup caches pages in memory per Worker. For durable caching across deploys at scale, add an R2 incremental cache (opennext.js.org/cloudflare/caching). Not needed at launch.

*Alternative host:* the app also runs unchanged on Vercel or any Node host (`npm run build && npm start`). On Vercel, image optimisation could be switched back on in `next.config.ts`.

## 6. Smoke test (5 minutes, do this after the first deploy)

1. Visit `/admin`, sign in.
2. **Admin → Settings**: add your YouTube and Instagram URLs → Save. Check the icons appear in the footer.
3. **Reviews → New review**: fill in title, product, category, upload an image, write a few lines, set a score **without** ticking approval → **Publish now**. You should get “Tick to confirm you’ve approved this score.” ✔ Tick it → Publish → visit the live page.
4. Log out, open the site in a private window: the review is visible; a second draft review is not.
5. **Schedule** a review 5 minutes ahead; confirm it appears within about a minute of that time.
6. Send yourself a message via `/contact` and check **Admin → Inbox**.
7. If you set up the newsletter, sign up with your own email and confirm Buttondown received it.

## 7. Google Search Console

1. search.google.com/search-console → Add property → **Domain** `dueareview.com` → verify with the DNS TXT record (easiest on Cloudflare).
   (Or URL-prefix: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the meta-tag code and redeploy.)
2. Sitemaps → submit `https://dueareview.com/sitemap.xml`.
3. After your first few reviews, use the Rich Results Test on a review URL to confirm the Review markup is valid.

## 8. Optional integrations

| Feature | Set | Notes |
| --- | --- | --- |
| Newsletter | `BUTTONDOWN_API_KEY` (Cloudflare secret) | buttondown.com → Settings → API. Turn on double opt-in in Buttondown. |
| Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` (build var) | Loads only after the visitor accepts cookies. Update the Cookie Policy if you switch provider. |
| Analytics link in admin | `NEXT_PUBLIC_ANALYTICS_DASHBOARD_URL` | Shown on the admin dashboard. |

## Environment variables

| Variable | Where | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | yes (`https://dueareview.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | build | yes (blank = demo mode) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build | yes (safe to expose; RLS protects data) |
| `BUTTONDOWN_API_KEY` | runtime secret | optional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | build | optional |
| `NEXT_PUBLIC_ANALYTICS_DASHBOARD_URL` | build | optional |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | build | optional |

## Backups

Supabase free tier has no automatic backups you can restore yourself, and free projects **pause after a week of inactivity**. Before launch, either upgrade to Pro (daily backups) or schedule a weekly `npx supabase db dump`.
