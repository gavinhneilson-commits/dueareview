import type { MetadataRoute } from "next";
import { SITE_URL, isDemoMode } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (isDemoMode) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
