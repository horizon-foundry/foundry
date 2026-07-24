import {
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Serif,
  Archivo_Black,
} from "next/font/google";

// Archivo Black carries the Horizon Foundry brand layer (wordmark + display
// headings): a heavy grotesque whose blunt, machined letterforms rhyme with
// the angular mark. Decision of record 2026-07-24 (BRAND.md), replacing Big
// Shoulders, which was reversed on letterform grounds before any merge; the
// studio site switched first, this mirrors that change. The IBM Plex trio
// stays for body, technical/report surfaces (mono), and long-form doc prose
// (serif). Single weight by design: the face ships only at 400, so display
// elements never set font-bold or font-semibold (the browser would
// synthesize a faux weight).
//
// Variable is named --font-archivo-black (not --font-display): next/font's
// generated class is unlayered CSS, and Tailwind's @theme block compiles into
// a @layer, which always loses to unlayered rules regardless of specificity
// or source order. Reusing --font-display for both would make next/font's
// single-name value (just the font, no fallback) permanently win over the
// theme's fallback chain, so the sans-serif fallback becomes unreachable.
// Two distinct names, with the theme token referencing this one, keeps the
// fallback chain intact. See app/globals.css.
export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
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
