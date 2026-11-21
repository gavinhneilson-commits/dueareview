export type ContentStatus = "draft" | "scheduled" | "published" | "unpublished";
export type ObtainedMethod = "purchased" | "loaned" | "gifted" | "sponsored" | "other";
export type Collection = "good" | "bad" | "ugly";
export type ComparisonKind = "versus" | "best_under" | "budget_vs_premium" | "guide";
export type VideoKind = "video" | "short" | "instagram";
export type StaffRole = "admin" | "editor" | "contributor";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Spec { label: string; value: string }
export interface RetailerLink { name: string; url: string; affiliate: boolean }
export interface GalleryImage { url: string; alt: string }

export interface Review {
  id: string;
  slug: string;
  status: ContentStatus;
  published_at: string | null;
  reviewed_at: string | null;
  updated_at: string;
  created_at: string;
  title: string;
  product_name: string;
  brand: string | null;
  model: string | null;
  category_id: string | null;
  category?: Category | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  gallery: GalleryImage[];
  price_pence: number | null;
  price_note: string | null;
  obtained_method: ObtainedMethod | null;
  obtained_note: string | null;
  testing_duration: string | null;
  testing_notes: string | null;
  video_url: string | null;
  short_verdict: string | null;
  verdict_label: string | null;
  body: string;
  pros: string[];
  cons: string[];
  overall_rating: number | null;
  performance_rating: number | null;
  value_rating: number | null;
  build_rating: number | null;
  rating_approved: boolean;
  specs: Spec[];
  final_verdict: string | null;
  retailer_links: RetailerLink[];
  has_affiliate_links: boolean;
  is_sponsored: boolean;
  sponsor_disclosure: string | null;
  collection: Collection | null;
  worth_your_money: boolean;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  /** true only for built-in demo content */
  is_sample?: boolean;
}

export interface ReviewUpdate { id: string; review_id: string; note: string; is_correction: boolean; created_at: string }

export interface ComparisonItem {
  id: string;
  comparison_id: string;
  review_id: string | null;
  position: number;
  product_name: string;
  price_pence: number | null;
  rating: number | null;
  pros: string[];
  cons: string[];
  specs: Spec[];
  observations: string | null;
  best_for: string | null;
  image_url: string | null;
  review?: Pick<Review, "slug" | "title"> | null;
}

export interface Comparison {
  id: string;
  slug: string;
  kind: ComparisonKind;
  status: ContentStatus;
  published_at: string | null;
  title: string;
  intro: string | null;
  body: string;
  recommendation: string | null;
  hero_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  items?: ComparisonItem[];
  is_sample?: boolean;
}

export interface Video {
  id: string;
  kind: VideoKind;
  title: string;
  url: string;
  youtube_id: string | null;
  review_id: string | null;
  status: ContentStatus;
  published_at: string | null;
  review?: Pick<Review, "slug" | "title"> | null;
  is_sample?: boolean;
}

export interface SocialLinks {
  youtube: string; instagram: string; tiktok: string; x: string; facebook: string; threads: string;
}
export interface HomepageSettings { hero_review_id: string | null; featured_review_ids: string[] }
export interface DisclosureSettings { affiliate_short: string; sponsored_short: string }
export interface SiteSettings {
  social: SocialLinks;
  homepage: HomepageSettings;
  disclosures: DisclosureSettings;
  contact: { email: string };
}

export interface Submission {
  id: string;
  kind: "contact" | "review_request" | "reader_question" | "brand_response" | "correction";
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  related_url: string | null;
  handled: boolean;
  created_at: string;
}

export type ReviewSort = "newest" | "highest" | "lowest";
export interface ReviewFilters {
  q?: string;
  category?: string; // slug
  brand?: string;
  minRating?: number;
  maxPrice?: number; // pounds
  collection?: Collection;
  worth?: boolean;
  sort?: ReviewSort;
  page?: number;
  pageSize?: number;
}
