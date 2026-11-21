/**
 * DEFAULT legal and policy page text (Markdown).
 * These are DRAFTS. They can be edited from Admin → Pages without touching code
 * (an admin edit is stored in the database and replaces the default below).
 *
 * ⚠️  Everything here needs review by a UK-qualified solicitor before launch.
 *     Square-bracketed placeholders like [BUSINESS NAME] must be filled in.
 */

export interface LegalPage { slug: string; title: string; description: string; body: string }

const REVIEW_NOTE = `> [!fact]
> **Draft — needs legal review before launch.** Fill in every [PLACEHOLDER] and have this checked by a UK solicitor.

`;

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How Due A Review collects, uses and protects your personal data.",
    body: REVIEW_NOTE + `Last updated: [DATE]

## Who we are
Due A Review ("we", "us") is operated by [BUSINESS NAME / SOLE TRADER NAME], [REGISTERED ADDRESS]. We are the data controller for personal data collected through dueareview.com. [ICO registration number: XXXXXXXX — check whether you need to pay the ICO data protection fee.]

Contact for privacy questions: [PRIVACY EMAIL].

## What we collect and why
- **Messages you send us** (contact, review requests, reader questions, brand responses): your name (optional), email and message. Lawful basis: legitimate interests — replying to you and running the site.
- **Newsletter sign-ups**: your email address, handled by our email provider [Buttondown]. Lawful basis: consent. You can unsubscribe at any time using the link in every email.
- **Analytics** (only if you accept analytics cookies): pages visited, approximate location (country/city), device and browser type, via [Google Analytics 4]. Lawful basis: consent.
- **Server and security logs**: IP address, browser and request details, kept by our hosting providers to keep the site secure and working. Lawful basis: legitimate interests.
- **Embedded videos**: nothing is loaded from YouTube until you press play. When you do, YouTube (Google) may collect data under its own privacy policy.

We do not sell your personal data, and we do not use advertising cookies.

## Who we share it with
We use these processors to run the site: [Cloudflare] (hosting and security), [Supabase] (database, hosted in [REGION]), [Buttondown] (newsletter), [Google] (analytics, only with consent). Some of these providers may process data outside the UK; where they do, we rely on appropriate safeguards such as the UK International Data Transfer Addendum or UK adequacy regulations. [CONFIRM EACH PROVIDER'S TRANSFER MECHANISM.]

## How long we keep it
- Messages: up to [24 months], then deleted.
- Newsletter: until you unsubscribe.
- Analytics: [14 months] (Google Analytics retention setting).
- Server logs: as set by our hosting providers, typically [30 days].

## Your rights
Under UK GDPR you have the right to access, correct, erase, restrict or object to the processing of your personal data, the right to data portability, and the right to withdraw consent at any time. Email [PRIVACY EMAIL] to use any of these rights. We'll reply within one month.

If you're unhappy with how we've handled your data, you can complain to the Information Commissioner's Office (ico.org.uk). We'd appreciate the chance to sort it out first.

## Children
This site is not aimed at children under 13 and we do not knowingly collect their data.

## Changes
We'll update this page if anything changes, and change the date at the top.`,
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    description: "The cookies Due A Review uses and how to control them.",
    body: REVIEW_NOTE + `Last updated: [DATE]

Cookies are small files stored on your device. Under the UK's PECR rules, we need your consent for any cookie that isn't strictly necessary. We don't set non-essential cookies until you say yes, and saying no is just as easy as saying yes.

## Strictly necessary (always on)
| Name | Purpose | Duration |
| --- | --- | --- |
| dar-consent (local storage) | Remembers your cookie choice | 6 months |
| dar-theme (local storage) | Remembers light/dark theme | Until cleared |
| sb-* | Admin login session (staff only) | Session / up to 1 week |

## Analytics (only with your consent)
| Name | Provider | Purpose | Duration |
| --- | --- | --- | --- |
| _ga, _ga_* | Google Analytics | Counts visits and shows which pages are read | Up to 2 years |

## Embedded content
YouTube videos use privacy-enhanced mode and load nothing until you press play. After that, YouTube may set its own cookies.

## Changing your mind
Use the **Cookie settings** link in the footer at any time. You can also clear cookies in your browser settings.`,
  },
  {
    slug: "terms",
    title: "Terms of Use",
    description: "The terms for using dueareview.com.",
    body: REVIEW_NOTE + `Last updated: [DATE]

These terms apply to your use of dueareview.com, operated by [BUSINESS NAME], [ADDRESS]. By using the site you agree to them.

## Our content
Reviews are our honest opinions, based on the testing described in each review. They're general information to help you decide, not professional, financial, medical or safety advice. Products change, prices change, and your experience may differ from ours. Check details with the retailer or manufacturer before you buy.

We try hard to be accurate. If we get something wrong, tell us and we'll correct it (see our Editorial Independence Policy).

## Using the site
You may read, share and link to our content for personal, non-commercial use. Don't copy or republish our reviews, photos or videos in full without permission. Short quotes with a credit and link are fine.

Don't try to break, overload or gain unauthorised access to the site.

## Messages you send us
If you send us a message, review request or brand response, you confirm it's accurate and lawful. We may quote short, non-personal parts of reader questions in our content [unless you ask us not to].

## Links to other sites
We link to retailers and other sites, some through affiliate links. We're not responsible for their content, prices or what they do with your data.

## Liability
Nothing in these terms limits liability that can't be limited by law, including for death or personal injury caused by negligence, or fraud. Otherwise, we're not liable for losses from relying on our content, or for anything you buy from a third-party retailer. [SOLICITOR TO REVIEW.]

## Law
These terms are governed by the law of [Scotland / England and Wales]. [SOLICITOR TO CONFIRM JURISDICTION.]`,
  },
  {
    slug: "affiliate-disclosure",
    title: "Affiliate & Advertising Disclosure",
    description: "How Due A Review makes money — and why it never affects our scores.",
    body: `Running a review site costs money: buying products, kit, hosting and a lot of time. Here's exactly how we pay for it.

## Affiliate links
Some links on our site are affiliate links. If you click one and buy something, the retailer may pay us a small commission, at **no extra cost to you**. These links are labelled "Affiliate link" in our "Where to buy" boxes, and every review with affiliate links has a notice at the top.

**Affiliate commissions never influence our scores or verdicts.** We write and score the review first. We'll happily link to products we've panned, and we'll recommend products that have no affiliate programme at all.

## YouTube and advertising
We earn money from YouTube advertising. If we ever run ads on this website, they'll be clearly separated from our reviews and we won't use intrusive formats.

## Sponsorships and brand partnerships
Sometimes a brand may pay us for sponsored content. When that happens:
- it is labelled **Sponsored** clearly at the top, before you read anything else,
- the sponsor gets no say over our verdict, score or wording,
- on video, we follow YouTube's paid-promotion rules and use the on-screen "Includes paid promotion" label.

We follow the UK advertising rules (the CAP Code) and the ASA/CMA guidance for influencers, which say that ads must be obviously identifiable as ads. [CHECK CURRENT ASA/CMA GUIDANCE BEFORE LAUNCH.]

## Free and loaned products
Brands sometimes send products for free or on loan. Every review says how we got the product. A free product buys a review — not a good one.`,
  },
  {
    slug: "editorial-independence",
    title: "Editorial Independence Policy",
    description: "How we keep commercial relationships away from our verdicts.",
    body: `## Who decides
Only the Due A Review editorial team decides what we review, what we say and what score a product gets. No brand, retailer, advertiser or affiliate network gets to see, approve or change a review before it's published.

## Scores are set by people
Every score is chosen and approved by a person on our team. Our publishing system will not let a review go live until a human has signed off its score.

## Facts, tests and opinions
We separate what's verified, what we measured, and what we think. In reviews you'll see labels for **verified facts**, **test results** and **our opinion**. We only describe testing that actually happened, and we say how long and how we tested.

## Brands that don't like the verdict
Brands can contact us about factual errors or to add a response. We'll look at every genuine factual concern, and correct mistakes. We won't change an opinion or a score because a brand asked us to, offered us something, or threatened to stop working with us.

## Corrections
If we get a fact wrong, we fix it and add a dated note to the review's update history. If a correction changes the verdict or score, we say so clearly. We don't quietly edit mistakes away.

## Re-reviews
Products change after firmware updates, price drops or new versions. If we re-test something, we note what changed and when.

## Conflicts of interest
If anyone on the team has a personal or financial connection to a brand we're reviewing, we'll disclose it on the review or have someone else review it.`,
  },
];

export const getDefaultLegal = (slug: string) => LEGAL_PAGES.find((p) => p.slug === slug) ?? null;
