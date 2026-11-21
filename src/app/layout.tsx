import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_NAME, SITE_URL, TAGLINE, isDemoMode } from "@/lib/env";
import { themeInitScript } from "@/components/ThemeToggle";

const display = localFont({ src: "./fonts/Archivo.woff2", variable: "--font-display-face", display: "swap", weight: "100 900" });
const body = localFont({
  src: [{ path: "./fonts/InstrumentSans.woff2", style: "normal" }, { path: "./fonts/InstrumentSans-Italic.woff2", style: "italic" }],
  variable: "--font-body", display: "swap", weight: "400 700",
});
const mono = localFont({ src: "./fonts/JetBrainsMono.woff2", variable: "--font-mono-face", display: "swap", weight: "100 800" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: "Independent UK product reviews. If it’s brilliant, we’ll tell you. If it’s shite, we’ll tell you that too.",
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_GB", url: SITE_URL },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  // Never let search engines index demo content.
  robots: isDemoMode ? { index: false, follow: false } : { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4f0e6" }, { media: "(prefers-color-scheme: dark)", color: "#121211" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
