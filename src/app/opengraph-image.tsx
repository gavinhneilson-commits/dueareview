import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";

export const alt = "Due A Review — Honest reviews. No bullshit.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f0e6", padding: 64, fontFamily: "Archivo, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 84, height: 84, background: "#ff5a1f", border: "6px solid #121110", boxShadow: "8px 8px 0 #121110", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 800, color: "#121110" }}>A</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#121110", letterSpacing: -1 }}>DUE A REVIEW</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 800, lineHeight: 0.95, color: "#121110", letterSpacing: -2 }}>
          <span>HONEST REVIEWS.</span>
          <span style={{ color: "#ff5a1f" }}>NO BULLSHIT.</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 500, color: "#3d3a35" }}>dueareview.com · Independent UK product reviews</div>
      </div>
    ),
    { ...size, fonts },
  );
}
