import { test } from "node:test";
import assert from "node:assert/strict";
import { formatScore, parseScore, ratingBand } from "../src/lib/rating.ts";
import { renderMarkdown } from "../src/lib/markdown.ts";
import { youtubeId, isShortUrl, isInstagramUrl } from "../src/lib/youtube.ts";
import { displayName, formatPrice, slugify } from "../src/lib/format.ts";
import { parseFilters } from "../src/lib/params.ts";

test("rating bands match the published scale", () => {
  assert.equal(ratingBand(10).label, "Outstanding");
  assert.equal(ratingBand(9).label, "Outstanding");
  assert.equal(ratingBand(8.9).label, "Excellent");
  assert.equal(ratingBand(7).label, "Very Good");
  assert.equal(ratingBand(6.9).label, "Good, with reservations");
  assert.equal(ratingBand(5).label, "Average");
  assert.equal(ratingBand(4.9).label, "Disappointing");
  assert.equal(ratingBand(3).label, "Disappointing");
  assert.equal(ratingBand(2.9).label, "Avoid");
  assert.equal(ratingBand(0).label, "Avoid");
});

test("scores: 0–10, one decimal place, blank allowed", () => {
  assert.equal(parseScore("7.5"), 7.5);
  assert.equal(parseScore(" 10 "), 10);
  assert.equal(parseScore(""), null);
  assert.throws(() => parseScore("10.1"));
  assert.throws(() => parseScore("-1"));
  assert.throws(() => parseScore("7.55"));
  assert.throws(() => parseScore("abc"));
  assert.equal(formatScore(8), "8.0");
  assert.equal(formatScore(null), "–");
});

test("markdown escapes HTML and blocks dangerous links", () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1)) [ok](https://example.com) <img src=x onerror=alert(1)>');
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes('href="https://example.com"'));
  assert.ok(html.includes('rel="noopener nofollow"'));
});

test("markdown supports headings, lists, callouts and tables", () => {
  const html = renderMarkdown("## Title\n\n- a\n- b\n\n> [!test]\n> 5 hours\n\n| A | B |\n| --- | --- |\n| 1 | 2 |");
  assert.ok(html.includes("<h2>Title</h2>"));
  assert.ok(html.includes("<ul><li>a</li><li>b</li></ul>"));
  assert.ok(html.includes("callout-test") && html.includes("Test result"));
  assert.ok(html.includes("<th scope=\"col\">A</th>") && html.includes("<td>2</td>"));
});

test("YouTube URL parsing", () => {
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://youtube.com/shorts/dQw4w9WgXcQ?feature=share"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://evil.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(youtubeId("not a url"), null);
  assert.ok(isShortUrl("https://youtube.com/shorts/dQw4w9WgXcQ"));
  assert.ok(isInstagramUrl("https://www.instagram.com/reel/abc/"));
  assert.ok(!isInstagramUrl("https://instagram.com.evil.io/x"));
});

test("formatting helpers", () => {
  assert.equal(slugify("Kettlecraft RapidBoil 2 — Review!"), "kettlecraft-rapidboil-2-review");
  assert.equal(slugify("Tools & DIY"), "tools-and-diy");
  assert.equal(formatPrice(3499), "£34.99");
  assert.equal(formatPrice(8500), "£85");
  assert.equal(displayName({ brand: "SummitPack", product_name: "SummitPack 35" }), "SummitPack 35");
  assert.equal(displayName({ brand: "Volta", product_name: "AirBuds X" }), "Volta AirBuds X");
});

test("search params are sanitised", () => {
  const { filters } = parseFilters({ q: "kettle", category: "../etc", min: "11", max: "-5", sort: "drop table", page: "99999" });
  assert.equal(filters.q, "kettle");
  assert.equal(filters.category, undefined);
  assert.equal(filters.minRating, undefined);
  assert.equal(filters.maxPrice, undefined);
  assert.equal(filters.sort, "newest");
  assert.equal(filters.page, 500);
  assert.equal(parseFilters({ min: "8" }).filters.minRating, 8);
});
