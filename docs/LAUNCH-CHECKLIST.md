# Launch checklist

## Legal: get a UK solicitor to review these (I'm not a lawyer)
- [ ] **Privacy Policy:** fill in business name, address and contact; confirm each processor's data location and transfer mechanism; set retention periods.
- [ ] **ICO data protection fee:** check whether you need to register (most UK businesses processing personal data do).
- [ ] **Cookie Policy:** confirm the cookie list matches what's actually running (re-check after adding any analytics or ads).
- [ ] **Terms of Use:** governing law (Scotland vs England & Wales), liability wording.
- [ ] **Affiliate & sponsorship disclosure:** check against the current CAP Code and the ASA/CMA influencer guidance. Make sure YouTube "paid promotion" labels match.
- [ ] **Consumer law on reviews:** the Digital Markets, Competition and Consumers Act 2024 bans fake reviews and concealed incentivised reviews. The site's design supports compliance (disclosures, no fabricated ratings), but have your process checked.
- [ ] **Defamation:** strongly negative reviews should stick to facts you can evidence and opinions honestly held. Keep test notes, photos and receipts for every "Ugly" verdict.
- [ ] **Business structure:** decide sole trader vs limited company before taking brand money.

## Content
- [ ] Write and publish 6–10 real reviews before launch, so the homepage sections aren't empty.
- [ ] Your own product photos for each, about 2000px wide, WebP or JPEG.
- [ ] Add your YouTube / Instagram / TikTok links in Admin → Settings.
- [ ] Add videos in Admin → Videos.
- [ ] Re-read Our Promise. Every claim must be true for how you actually work, especially how products are obtained and tested.

## Technical
- [ ] Supabase sign-ups disabled; MFA on admin accounts.
- [ ] Supabase backups (Pro plan or a scheduled dump).
- [ ] Domain connected, `www` redirects to the bare domain, HTTPS working.
- [ ] Search Console verified, sitemap submitted.
- [ ] Rich Results Test passes on a review URL.
- [ ] Smoke test from DEPLOYMENT.md §6 done.
- [ ] Newsletter: one real test sign-up.

## Accessibility (WCAG 2.2 AA)
Automated checks pass. Before launch, also do a manual pass:
- [ ] Navigate the homepage, a review and the contact form with the keyboard only.
- [ ] Try VoiceOver (iPhone) on a review page.
- [ ] Check every uploaded image has meaningful alt text.
- [ ] Check video thumbnails/titles describe the content.
