export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dueareview.com").replace(/\/$/, "");
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Demo mode: no Supabase configured → built-in, clearly-labelled sample content. */
export const isDemoMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const SITE_NAME = "Due A Review";
export const TAGLINE = "Honest Reviews. No Bullshit.";
