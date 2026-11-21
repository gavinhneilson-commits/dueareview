/** Extract an 11-char YouTube video ID from any common URL shape. Returns null if not YouTube. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const raw = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = m ? m[1] : null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export function isShortUrl(url: string | null | undefined): boolean {
  return !!url && /youtube\.com\/shorts\//.test(url);
}

export function isInstagramUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try { return /(^|\.)instagram\.com$/.test(new URL(url).hostname); } catch { return false; }
}

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const ytEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
export const ytWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
