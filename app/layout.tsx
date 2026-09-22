import type { Metadata, Viewport } from "next";
import { archivoBlack, plexSans, plexMono, plexSerif } from "@/lib/fonts";
import { HfSymbolDefs } from "@/components/Wordmark";
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
  // the convention was providing. The files are the design kit's foundry set
  // (bone on ink), installed verbatim under public/; the studio set is the
  // inverse and belongs to the parent site, so the two stay apart in a row of
  // tabs. mask-icon takes the ink, not the tile: Safari tints a monochrome
  // mask against the tab bar, so it follows the mark.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#14191F" },
    ],
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
        url: "/og.png?v=84f096a3",
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
    images: ["/og.png?v=84f096a3"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${plexSans.variable} ${plexMono.variable} ${plexSerif.variable}`}
    >
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Keyboard users skip the repeated chrome (WCAG 2.4.1). Visible only
            on focus; styled as a command chip so it belongs to the system. */}
        <a
          href="#main"
          className="absolute left-4 top-4 z-50 -translate-y-24 border border-line-strong bg-ink-raised px-3 py-2 font-mono text-xs uppercase tracking-wide text-bone transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <HfSymbolDefs />
        <ConsoleSignature />
        {children}
      </body>
    </html>
  );
}
