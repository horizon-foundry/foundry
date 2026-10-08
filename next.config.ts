import type { NextConfig } from "next";

// Security headers. We dogfood our own audit here: the first audit report
// (SEC/INF-01) flagged a live app that shipped with NO security headers, so the
// audit product itself must not. The enforcing set (clickjacking, MIME-sniff,
// referrer, powerful-feature lockdown, HSTS) is safe for every route. CSP ships
// enforcing; the ONLY third party is PostHog (site analytics), allowlisted by
// exact host below. Everything else is self-hosted (next/font self-hosts fonts).
// Lesson recorded the hard way: `connect-src 'self'` alone silently blocked
// every client analytics call in production. When adding an external service,
// add its hosts here in the same commit or the browser drops the traffic.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  // Next injects a small inline bootstrap; 'unsafe-inline' for styles covers
  // Tailwind's inlined critical CSS. No inline event handlers are used.
  "style-src 'self' 'unsafe-inline'",
  // us-assets serves PostHog's remote config/toolbar assets; us.i receives
  // event capture + flag checks from the browser SDK.
  "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com",
  "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com",
  "form-action 'self'",
].join("; ");

// The slug of the published self-audit (reports/foundry-<date>.json). Update it
// in the release that replaces the report.
const CURRENT_SELF_AUDIT = "foundry-2026-10-07";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      // The public self-audit is replaced each release, and its URL is the one
      // people share. Retired slugs land on the current one instead of a 404.
      ...["foundry-2026-07-16", "foundry-2026-08-14"].map((slug) => ({
        source: `/example/${slug}`,
        destination: `/example/${CURRENT_SELF_AUDIT}`,
        permanent: true,
      })),
      // Sign-in must start and finish on one host: the PKCE verifier cookie is
      // host-only, and SITE_ORIGIN mails every link to the canonical host. So
      // the fly.dev host sends its sign-in and report pages there. /auth/confirm
      // is deliberately absent so a link mailed to fly.dev before the cutover
      // still verifies; its session stays on fly.dev (cookies are host-only), so
      // that user signs in once more on the canonical host.
      ...["/unlock", "/reports/:path*"].map((source) => ({
        source,
        // `value` is a regex (Next anchors it), so the dots are escaped.
        has: [{ type: "host" as const, value: "foundry-skills\\.fly\\.dev" }],
        destination: `https://foundry.thehorizonfoundry.com${source}`,
        permanent: false,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
