import type { Metadata, Viewport } from "next";
import { zalando, plexMono } from "@/lib/fonts";
import { ConsoleSignature } from "@/components/ConsoleSignature";
import "./globals.css";

const SITE_URL = "https://foundry.thehorizonfoundry.com";
const TITLE = "Foundry: skills that keep an AI-built codebase honest";
const DESCRIPTION =
  "Software delivery integrity, as Claude Code skills: declared product intent, a design checked against the code before it is built, execution context that survives every session, an instrumented outcome, docs that match reality, and a pre-launch audit that ends in a scope-honest verdict. By Horizon Foundry.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Foundry",
  },
  description: DESCRIPTION,
  applicationName: "Foundry",
  authors: [{ name: "Horizon Foundry" }],
  // The whole icon set is declared here, explicitly, and the App Router's
  // app/icon.* file conventions are deliberately NOT used alongside it:
  // `icons` is a single metadata key, so declaring any icon by hand replaces
  // every convention-generated tag. Mixing the two silently drops whichever
  // the convention was providing. The files are the company's own (an Ink
  // tile, the Bone HF mark, the amber bar), byte copies of the Horizon
  // Foundry handoff under public/, because the product shares the company's
  // icon. The 16 is pixel-fitted, so nothing here is scaled or generated.
  // No favicon.ico, no maskable tile and no mask-icon: the handoff supplies
  // none, and a one-color tint cannot keep the amber bar.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Foundry",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        // The ?v token is the first 8 of the render's sha256, recorded in
        // scripts/og/rendered.json and checked by both brand gates. X and
        // LinkedIn cache og:image by URL for weeks and ignore cache headers,
        // so a re-rendered card at an unchanged URL reaches nobody who has
        // already shared a link. `make og-card` prints the new token.
        url: "/og.png?v=9316f375",
        width: 1200,
        height: 630,
        alt: "Foundry: forge shippable software from AI-built code. Claude Code skills, audit, verdict.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png?v=9316f375"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#14191F",
};

// Structured data: the suite as a piece of software with a website. Kept to
// facts that hold on every page.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Foundry",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description: DESCRIPTION,
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: "Horizon Foundry" },
};

// Runs before first paint. The `js` class has ONE job: it lets the CSS collapse
// panels (tabs, accordions) that the server renders open, so with no script
// nothing is ever hidden. It is not a motion flag; figure reveals arm
// themselves (components/Reveal.tsx). The script is inline, which the CSP
// allows ('unsafe-inline' in script-src, next.config.ts).
const JS_CLASS = "document.documentElement.classList.add('js')";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the script above adds a class React did not
    // render, which is the one intended difference between server and client.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${zalando.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS }} />
      </head>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Keyboard users skip the repeated chrome (WCAG 2.4.1). Visible only
            on focus: a Bone box with Ink text over the Ink header, 44px. */}
        <a
          href="#main"
          className="absolute left-4 top-2.5 z-50 flex min-h-11 -translate-y-24 items-center bg-bone px-4 font-sans text-[0.9375rem] font-semibold text-ink focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <ConsoleSignature />
        {children}
      </body>
    </html>
  );
}
