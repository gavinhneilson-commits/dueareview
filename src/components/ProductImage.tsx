/* eslint-disable @next/next/no-img-element */
/**
 * Shows the uploaded product photo; if none exists, a typographic placeholder
 * (never a stock photo pretending to be the product).
 */
export function ProductImage({ src, alt, name, brand, className = "", priority = false }: {
  src: string | null; alt?: string | null; name: string; brand?: string | null; className?: string; priority?: boolean;
}) {
  if (src) {
    return (
      <img src={src} alt={alt || `${brand ? brand + " " : ""}${name}`} className={`w-full h-full object-cover ${className}`}
        loading={priority ? "eager" : "lazy"} decoding="async" {...(priority ? { fetchPriority: "high" as const } : {})} />
    );
  }
  return (
    <div className={`w-full h-full bg-paper-2 relative overflow-hidden flex flex-col justify-end p-4 ${className}`} role="img"
      aria-label={`No photo yet for ${brand ? brand + " " : ""}${name}`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, var(--ink) 0 2px, transparent 2px 14px)" }} />
      <span aria-hidden="true" className="relative kicker text-muted">{brand || "Product"}</span>
      <span aria-hidden="true" className="relative display text-3xl text-ink/80 break-words">{name}</span>
    </div>
  );
}
