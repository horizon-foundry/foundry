import {
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Serif,
  Big_Shoulders,
} from "next/font/google";

// Big Shoulders carries the Horizon Foundry brand layer (wordmark + display
// headings): an industrial condensed gothic that rhymes with the angular mark.
// Decision of record 2026-07-23 (BRAND.md); the studio site adopted the same
// face first, this is the companion PR. The IBM Plex trio stays for body,
// technical/report surfaces (mono), and long-form doc prose (serif).
// Big Shoulders has no true 400-adjacent look at display sizes, so display
// type moves to 500/700 (medium/bold), replacing Inter's 400/600. Every
// current font-display element renders bold (700); medium (500) is loaded to
// match the studio site's weight set for shared-brand consistency, ready for
// the first display element that wants the lighter cut.
//
// Variable is named --font-big-shoulders (not --font-display): next/font's
// generated class is unlayered CSS, and Tailwind's @theme block compiles into
// a @layer, which always loses to unlayered rules regardless of specificity
// or source order. Reusing --font-display for both would make next/font's
// single-name value (just the font, no fallback) permanently win over the
// theme's fallback chain, so the sans-serif fallback becomes unreachable.
// Two distinct names, with the theme token referencing this one, keeps the
// fallback chain intact. See app/globals.css.
export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-big-shoulders",
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
