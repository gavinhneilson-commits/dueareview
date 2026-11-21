import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { getReviewBySlug } from "@/lib/data";
import { formatScore, ratingBand } from "@/lib/rating";
import { displayName } from "@/lib/format";

export const alt = "Due A Review verdict";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ReviewOG({ params }: { params: Promise<{ slug: string }> }) {
  const r = await getReviewBySlug((await params).slug);
  const title = r ? displayName(r) : "Review";
  const score = r?.overall_rating ?? null;
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f0e6", padding: 64, fontFamily: "Archivo, sans-serif", color: "#121110" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, background: "#ff5a1f", border: "5px solid #121110", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800 }}>A</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>DUE A REVIEW</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase" }}>{title.slice(0, 60)}</div>
            {r?.verdict_label && <div style={{ marginTop: 24, fontSize: 34, fontWeight: 800, border: "4px solid #121110", padding: "6px 14px", alignSelf: "flex-start", display: "flex" }}>{`“${r.verdict_label.toUpperCase()}”`}</div>}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: "#5f5a52" }}>dueareview.com</div>
        </div>
        {score !== null && (
          <div style={{ width: 340, height: 340, alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "8px solid #121110", background: "#fbf9f4", boxShadow: "16px 16px 0 #121110", transform: "rotate(4deg)" }}>
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 4 }}>SCORE</div>
            <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1 }}>{formatScore(score)}</div>
            <div style={{ fontSize: 26, fontWeight: 800, background: "#ff5a1f", padding: "4px 12px", marginTop: 8 }}>{ratingBand(score).label.toUpperCase()}</div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
