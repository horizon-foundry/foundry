import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

// Zalando Sans is the parent brand's one family (Horizon Foundry BRAND.md,
// Inheritance): display, the product lockup and running text. The file is the
// parent's weight-only instance (width pinned to 100, weight 200 to 900), a
// copy of its app/fonts/ZalandoSans-wght.woff2, so the width axis cannot be
// set even by accident. Four weights are used: 900 display, 800 mid headings,
// 600 labels and controls, 400 text.
//
// The variable is deliberately NOT --font-sans or --font-display: next/font's
// generated class is unlayered CSS, and Tailwind's @theme block compiles into
// a @layer, which always loses to unlayered rules. A shared name would make
// next/font's single-name value win over the theme's fallback chain. See
// app/globals.css.
export const zalando = localFont({
  src: "../app/fonts/ZalandoSans-wght.woff2",
  weight: "200 900",
  style: "normal",
  display: "swap",
  variable: "--font-zalando",
  adjustFontFallback: "Arial",
  preload: true,
});

// IBM Plex Mono is this product's own voice: commands, file paths, finding
// IDs and report metadata. It is what a Foundry Skills page has that the
// company site does not. next/font self-hosts it at build time, so the CSP
// stays `font-src 'self'`.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
