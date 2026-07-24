import type { Metadata, Viewport } from "next";
import { archivoBlack, plexSans, plexMono, plexSerif } from "@/lib/fonts";
import { HfSymbolDefs } from "@/components/Wordmark";
import { ConsoleSignature } from "@/components/ConsoleSignature";
import "./globals.css";

const SITE_URL = "https://foundry.thehorizonfoundry.com";
const TITLE = "Foundry: skills that keep an AI-built codebase honest";
const DESCRIPTION =
  "Software delivery integrity, as Claude Code skills: declared product intent, execution context that survives every session, an instrumented outcome, docs that match reality, and a pre-launch audit that ends in a scope-honest verdict. By Horizon Foundry.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Foundry",
  },
  description: DESCRIPTION,
  applicationName: "Foundry",
  authors: [{ name: "Horizon Foundry" }],
  // Favicon (app/icon.svg) and apple-icon.png are wired by the App Router
  // file conventions; no manual icons entry needed.
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Foundry",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
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
    images: ["/og.png"],
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
