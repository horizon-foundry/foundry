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

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: import.meta.dirname,
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
