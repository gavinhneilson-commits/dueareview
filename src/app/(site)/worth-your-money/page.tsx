import type { Metadata } from "next";
import { searchReviews } from "@/lib/data";
import { ReviewGrid } from "@/components/ReviewCard";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Worth your money? Our best-value picks",
  description: "Products that deliver exceptional value at their price — from cheap finds to premium kit that earns its price tag.",
  alternates: { canonical: "/worth-your-money" },
};

export default async function WorthPage() {
  const { items } = await searchReviews({ worth: true, pageSize: 48, sort: "highest" });
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <p className="kicker text-signal-text">Value champions</p>
      <h1 className="display text-6xl sm:text-8xl mt-2">Worth your money?</h1>
      <p className="mt-4 text-xl text-ink-2 max-w-2xl">Value isn’t the same as cheap. These are the products that deliver more than you’d expect for what they cost — whether that’s £15 or £1,500.</p>
      <div className="mt-10">{items.length ? <ReviewGrid reviews={items} headingLevel={2} /> : <p className="border-2 border-dashed border-rule p-12 text-center text-muted">No value picks yet.</p>}</div>
    </div>
  );
}
