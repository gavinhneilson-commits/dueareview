const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const gbpWhole = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

export function formatPrice(pence: number | null | undefined): string {
  if (pence === null || pence === undefined) return "";
  return pence % 100 === 0 ? gbpWhole.format(pence / 100) : gbp.format(pence / 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const OBTAINED_LABELS: Record<string, string> = {
  purchased: "Bought with our own money",
  loaned: "Loaned by the brand (returned after testing)",
  gifted: "Sent free by the brand (no strings attached)",
  sponsored: "Sponsored — see disclosure",
  other: "Other — see note",
};

/** "Brand Product", without doubling up when the product name already starts with the brand. */
export function displayName(r: { brand: string | null; product_name: string }): string {
  if (!r.brand) return r.product_name;
  return r.product_name.toLowerCase().startsWith(r.brand.toLowerCase()) ? r.product_name : `${r.brand} ${r.product_name}`;
}
