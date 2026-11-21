/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SAMPLE DATA — FOR DEMO MODE ONLY
 *  Every product and brand below is FICTIONAL. None of these are real reviews.
 *  This file is only used when Supabase is not configured, and every page shows
 *  a "Demo mode — sample content" banner while it is in use. Search engines are
 *  told not to index the site in demo mode, and no review structured data is emitted.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Category, Comparison, Review, ReviewUpdate, SiteSettings, Video } from "./types";

export const SAMPLE_CATEGORIES: Category[] = [
  ["technology-gadgets", "Technology & Gadgets", "Phones, audio, smart home and anything with a charging cable."],
  ["home-kitchen", "Home & Kitchen", "Appliances, cookware and the stuff that lives on your worktop."],
  ["fitness-sports", "Fitness & Sports", "Kit that promises to make you fitter. We check whether it does."],
  ["tools-diy", "Tools & DIY", "Drills, gadgets and garage gear."],
  ["cars-accessories", "Cars & Accessories", "Dash cams, chargers, cleaning kit and car tech."],
  ["health-lifestyle", "Health & Lifestyle", "Everyday products for looking after yourself. Not medical advice."],
  ["outdoor-travel", "Outdoor & Travel", "Bags, camping kit and travel gear."],
  ["budget-finds", "Budget Finds", "Cheap stuff that is actually good. Rare, but it happens."],
  ["premium-products", "Premium Products", "Expensive stuff. Is it worth it? Let's find out."],
  ["weird-wonderful", "Weird & Wonderful", "Gadgets nobody asked for. We tested them anyway."],
].map(([slug, name, description], i) => ({ id: `cat-${slug}`, slug, name, description, sort_order: (i + 1) * 10 }));

const cat = (slug: string) => SAMPLE_CATEGORIES.find((c) => c.slug === slug)!;

const base = {
  status: "published" as const,
  gallery: [],
  hero_image_url: null,
  hero_image_alt: null,
  rating_approved: true,
  is_sponsored: false,
  sponsor_disclosure: null,
  seo_title: null,
  seo_description: null,
  og_image_url: null,
  featured: false,
  worth_your_money: false,
  collection: null,
  video_url: null,
  is_sample: true,
};

function r(p: Partial<Review> & Pick<Review, "slug" | "title" | "product_name">, catSlug: string, daysAgo: number): Review {
  const d = new Date(Date.UTC(2026, 10, 18) - daysAgo * 86400000).toISOString();
  const c = cat(catSlug);
  return {
    id: `sample-${p.slug}`,
    published_at: d,
    reviewed_at: d.slice(0, 10),
    updated_at: d,
    created_at: d,
    brand: null,
    model: null,
    category_id: c.id,
    category: c,
    price_pence: null,
    price_note: null,
    obtained_method: "purchased",
    obtained_note: null,
    testing_duration: null,
    testing_notes: null,
    short_verdict: null,
    verdict_label: null,
    body: "",
    pros: [],
    cons: [],
    overall_rating: null,
    performance_rating: null,
    value_rating: null,
    build_rating: null,
    specs: [],
    final_verdict: null,
    retailer_links: [],
    has_affiliate_links: false,
    ...base,
    ...p,
  } as Review;
}

const DEMO_NOTE =
  "> [!opinion]\n> This is **sample content** for demo mode. The product and brand are fictional and nothing here was tested.\n\n";

export const SAMPLE_REVIEWS: Review[] = [
  r({
    slug: "kettlecraft-rapidboil-2",
    title: "Kettlecraft RapidBoil 2 review: the kettle that finally shuts up",
    product_name: "RapidBoil 2", brand: "Kettlecraft", model: "RB-2",
    price_pence: 3499, price_note: "Price paid (sample)", testing_duration: "Six weeks of daily use (sample)",
    short_verdict: "Quiet, quick and properly well made. The best £35 you'll spend on your worktop.",
    verdict_label: "Worth Every Penny",
    overall_rating: 8.7, performance_rating: 9.0, value_rating: 9.2, build_rating: 8.0,
    pros: ["Genuinely quiet boil", "Accurate water window", "Lid doesn't spit at you"],
    cons: ["Cord is on the short side", "Limescale shows on the steel"],
    specs: [{ label: "Capacity", value: "1.7 litres" }, { label: "Power", value: "3 kW" }, { label: "Weight", value: "1.1 kg" }],
    collection: "good", worth_your_money: true, featured: true,
    final_verdict: "If your current kettle sounds like a jet engine taking off, this is your upgrade. Nothing fancy, everything done right.",
    body: DEMO_NOTE + "## First impressions\nIt's a kettle. It looks like a kettle. But pick it up and you notice the lid opens smoothly and the handle doesn't feel like it'll snap.\n\n> [!test]\n> Sample figure: 1 litre boiled in around two and a half minutes in our kitchen.\n\n## Living with it\nThe big win is noise. You can actually hear the telly while it boils.",
  }, "home-kitchen", 2),
  r({
    slug: "volta-airbuds-x",
    title: "Volta AirBuds X review: all bass, no brains",
    product_name: "AirBuds X", brand: "Volta",
    price_pence: 14900, price_note: "Price at time of review (sample)", obtained_method: "loaned",
    testing_duration: "Three weeks, commuting and gym (sample)",
    short_verdict: "Big sound, baffling app and a battery that gives up before you do.",
    verdict_label: "Good, But Overpriced",
    overall_rating: 6.1, performance_rating: 7.0, value_rating: 4.8, build_rating: 6.5,
    pros: ["Punchy, fun sound", "Comfortable fit"], cons: ["Battery well short of the claim", "App needs an account to change EQ", "£149 is a lot for this"],
    specs: [{ label: "Claimed battery", value: "8 hours" }, { label: "Water resistance", value: "IPX4" }],
    collection: "bad", video_url: null,
    final_verdict: "They sound good. That's the end of the good news. Wait for a sale.",
    body: DEMO_NOTE + "## The sound\nIf you like bass, you'll like these. A lot.\n\n## The rest\nWhy does a pair of earbuds need me to create an account?",
  }, "technology-gadgets", 5),
  r({
    slug: "glowmax-led-face-mask",
    title: "GlowMax Pro LED mask review: £300 of red lights and big promises",
    product_name: "GlowMax Pro", brand: "GlowMax",
    price_pence: 29900, obtained_method: "gifted", testing_duration: "Four weeks (sample)",
    short_verdict: "The marketing is doing far more work than the mask is.",
    verdict_label: "All Hype",
    overall_rating: 2.4, performance_rating: 2.0, value_rating: 1.5, build_rating: 4.0,
    pros: ["Comfortable strap"], cons: ["Claims we couldn't verify", "Flimsy controller", "Eye-watering price"],
    collection: "ugly",
    final_verdict: "Sent to us for free, and we still can't recommend it. Save your money.",
    body: DEMO_NOTE + "## The claims\nThe box promises a lot. We can only tell you what we actually saw, which wasn't much.\n\n> [!fact]\n> In a real review, this callout would cite the manufacturer's actual claim and source.",
  }, "health-lifestyle", 8),
  r({
    slug: "torqueline-18v-combi-drill",
    title: "Torqueline 18V combi drill review: the budget drill that punches up",
    product_name: "18V Combi Drill", brand: "Torqueline", model: "TL-18C",
    price_pence: 5999, testing_duration: "Two months of weekend DIY (sample)",
    short_verdict: "Not a pro tool, doesn't pretend to be. For shelves and flatpack, it's brilliant.",
    verdict_label: "Solid Purchase",
    overall_rating: 7.8, performance_rating: 7.5, value_rating: 9.0, build_rating: 7.0,
    pros: ["Two batteries included", "Decent torque for the money"], cons: ["Chuck wobbles under load", "Case is cheap plastic"],
    worth_your_money: true, collection: "good",
    body: DEMO_NOTE + "## Who it's for\nIf you put up a shelf twice a year, you don't need a £200 drill.",
  }, "tools-diy", 12),
  r({
    slug: "summitpack-35-daypack",
    title: "SummitPack 35 review: a rucksack that survived Scotland",
    product_name: "SummitPack 35", brand: "SummitPack",
    price_pence: 8500, testing_duration: "Five hill days (sample)",
    short_verdict: "Comfortable, tough and properly weatherproof. The hip belt pockets are a gift.",
    verdict_label: "Absolutely Brilliant",
    overall_rating: 9.1, performance_rating: 9.0, value_rating: 8.8, build_rating: 9.3,
    pros: ["Great back ventilation", "Stayed dry in sideways rain"], cons: ["Only one colour that isn't grey"],
    collection: "good", featured: true,
    body: DEMO_NOTE + "## On the hill\nIt rained. Then it rained harder. The contents stayed dry.",
  }, "outdoor-travel", 16),
  r({
    slug: "dashpro-4k-dash-cam",
    title: "DashPro 4K dash cam review: 4K on the box, potato on the screen",
    product_name: "DashPro 4K", brand: "DashPro",
    price_pence: 7999, obtained_method: "purchased", testing_duration: "One month, 900 miles (sample)",
    short_verdict: "The '4K' badge is generous. Night footage is mush.",
    verdict_label: "Save Your Money",
    overall_rating: 3.9, performance_rating: 3.5, value_rating: 3.8, build_rating: 5.0,
    pros: ["Easy to fit"], cons: ["Plates unreadable at night", "Suction mount drops in the cold"],
    collection: "bad",
    body: DEMO_NOTE + "## The footage\nIn daylight, fine. After dark, it might as well be a painting.",
  }, "cars-accessories", 20),
  r({
    slug: "flexfit-smart-skipping-rope",
    title: "FlexFit smart skipping rope review: counts your jumps, judges your life",
    product_name: "Smart Rope", brand: "FlexFit",
    price_pence: 2499, testing_duration: "Two weeks (sample)",
    short_verdict: "The counter works. It's oddly motivating. It's also £25 for a rope.",
    verdict_label: "Solid Purchase",
    overall_rating: 6.8, performance_rating: 7.2, value_rating: 6.5, build_rating: 6.4,
    pros: ["Accurate jump count", "No app needed"], cons: ["Handles feel cheap"],
    worth_your_money: true,
    body: DEMO_NOTE + "## Does it work?\nIt counted jumps accurately in our (sample) testing.",
  }, "fitness-sports", 26),
  r({
    slug: "hoverbrella-self-drying-umbrella",
    title: "Hoverbrella review: a self-drying umbrella, for some reason",
    product_name: "Hoverbrella", brand: "Novelty Labs",
    price_pence: 4500, obtained_method: "gifted", testing_duration: "A wet fortnight in Glasgow (sample)",
    short_verdict: "It does dry itself. It also weighs as much as a small dog.",
    verdict_label: "Complete Letdown",
    overall_rating: 4.2, performance_rating: 5.0, value_rating: 3.0, build_rating: 4.5,
    pros: ["Novel idea", "Fun to show people"], cons: ["Heavy", "Battery-powered umbrella. Think about that."],
    collection: "ugly",
    body: DEMO_NOTE + "## Why?\nNobody asked. Here we are.",
  }, "weird-wonderful", 33),
  r({
    slug: "brewlux-barista-one",
    title: "Brewlux Barista One review: £650 coffee, but is it £650 good?",
    product_name: "Barista One", brand: "Brewlux",
    price_pence: 64900, obtained_method: "loaned", testing_duration: "Five weeks (sample)",
    short_verdict: "Gorgeous coffee, gorgeous machine. Whether it's worth it depends on how much you drink.",
    verdict_label: "Good, But Overpriced",
    overall_rating: 7.4, performance_rating: 8.8, value_rating: 5.9, build_rating: 8.9,
    pros: ["Excellent espresso", "Built like a tank"], cons: ["Steep learning curve", "Price"],
    body: DEMO_NOTE + "## The coffee\nOnce dialled in, superb.",
  }, "premium-products", 40),
];

export const SAMPLE_UPDATES: ReviewUpdate[] = [
  { id: "u1", review_id: "sample-volta-airbuds-x", note: "Sample update note: battery test re-run after a firmware update; score unchanged.", is_correction: false, created_at: "2026-11-16T10:00:00Z" },
];

export const SAMPLE_VIDEOS: Video[] = [];

export const SAMPLE_COMPARISONS: Comparison[] = [
  {
    id: "sample-cmp-1",
    slug: "kettlecraft-rapidboil-2-vs-brewlux-barista-one",
    kind: "budget_vs_premium",
    status: "published",
    published_at: "2026-11-10T09:00:00Z",
    title: "Budget vs Premium: does a £650 machine beat a £35 kettle and a cafetière?",
    intro: "Sample comparison built from two sample reviews. Every figure here is illustrative.",
    body: "> [!opinion]\n> **Sample content.** In a real comparison, only observations from actual testing appear here.",
    recommendation: "Drink one cup a day? Save the money. Drink four and care about crema? The premium machine earns its keep.",
    hero_image_url: null, seo_title: null, seo_description: null,
    created_at: "2026-11-10T09:00:00Z", updated_at: "2026-11-10T09:00:00Z",
    is_sample: true,
    items: [
      { id: "ci1", comparison_id: "sample-cmp-1", review_id: "sample-kettlecraft-rapidboil-2", position: 0, product_name: "Kettlecraft RapidBoil 2", price_pence: 3499, rating: 8.7, pros: ["Cheap", "Quiet"], cons: ["It's still just a kettle"], specs: [{ label: "Price", value: "£34.99" }, { label: "Setup time", value: "None" }], observations: "Sample observation.", best_for: "Most people", image_url: null, review: { slug: "kettlecraft-rapidboil-2", title: "Kettlecraft RapidBoil 2 review" } },
      { id: "ci2", comparison_id: "sample-cmp-1", review_id: "sample-brewlux-barista-one", position: 1, product_name: "Brewlux Barista One", price_pence: 64900, rating: 7.4, pros: ["Café-quality espresso"], cons: ["Costs 18 kettles"], specs: [{ label: "Price", value: "£649" }, { label: "Setup time", value: "An afternoon of swearing" }], observations: "Sample observation.", best_for: "Serious coffee drinkers", image_url: null, review: { slug: "brewlux-barista-one", title: "Brewlux Barista One review" } },
    ],
  },
];

export const SAMPLE_SETTINGS: SiteSettings = {
  social: { youtube: "https://www.youtube.com/@dueareview", instagram: "https://www.instagram.com/dueareview", tiktok: "https://www.tiktok.com/@dueareview", x: "", facebook: "", threads: "" },
  homepage: { hero_review_id: "sample-summitpack-35-daypack", featured_review_ids: [] },
  disclosures: {
    affiliate_short: "Some links on this page are affiliate links. If you buy through them we may earn a small commission, at no extra cost to you. It never affects our scores.",
    sponsored_short: "This content is sponsored. The sponsor had no control over our verdict or score.",
  },
  contact: { email: "" },
};
