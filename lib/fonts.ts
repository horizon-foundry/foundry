import {
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Serif,
  Inter,
} from "next/font/google";

// Inter carries the Horizon Foundry brand layer (wordmark + display headings),
// matching the brand lockup. The IBM Plex trio stays for body, technical/report
// surfaces (mono), and long-form doc prose (serif).
// Weights are only what the site sets: display type is 400/600 everywhere
// (300/500/700 shipped unused and cost three font files).
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

// One family, three cuts (DESIGN.md typography). next/font self-hosts these at
// build time, so no runtime request to a third-party host: the CSP stays
// `font-src 'self'` and nothing external loads.
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-serif",
  display: "swap",
});
