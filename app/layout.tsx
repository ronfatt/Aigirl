import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/src/components/layout/SiteShell";
import { settings } from "@/src/data/settings";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const metadata: Metadata = { metadataBase: new URL(settings.siteUrl), title: { default: "Batik NXT — Contemporary Malaysian Fashion", template: "%s | Batik NXT" }, description: "Batik NXT reimagines Malaysian batik through contemporary couture, sculptural silhouettes and modern craftsmanship.", keywords: ["Malaysian fashion", "modern batik", "couture", "Batik NXT"], alternates: { canonical: "/" }, openGraph: { type: "website", title: "Batik NXT — Contemporary Malaysian Fashion", description: "Heritage, cut forward.", images: ["/images/hero/home.svg"] }, twitter: { card: "summary_large_image" }, manifest: "/manifest.webmanifest", icons: { icon: "/icons/favicon.svg" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#090909" };
export default function RootLayout({ children }: { children: ReactNode }) { const schema = { "@context": "https://schema.org", "@type": "Organization", name: "Batik NXT", url: settings.siteUrl, founder: { "@type": "Person", name: "Ronnie" }, address: { "@type": "PostalAddress", addressCountry: "MY" } }; return <html lang="en" className={`${display.variable} ${sans.variable}`}><body><SiteShell>{children}</SiteShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/></body></html>; }
