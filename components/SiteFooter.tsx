import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { REPO_URL, REPO_LICENSE_URL } from "@/lib/site";
import { suiteVersion } from "@/lib/version";

// Secondary navigation lives here (issue 5): the design system and the
// private reports are for people who already care, not the first thing a new
// visitor needs. "Reports" is renamed "Private reports" so the gate is not a surprise.
const SECONDARY = [
  { href: "/design-system", label: "Design system", external: false },
  { href: "/reports", label: "Private reports", external: false },
  { href: REPO_URL, label: "GitHub", external: true },
  { href: REPO_LICENSE_URL, label: "License (MIT)", external: true },
];

// Ink on every page, like the header. The attribution is the parent's line
// for a suite, word for word (Horizon Foundry BRAND.md, Attribution).
export function SiteFooter() {
  return (
    <footer data-ground="ink">
      <div className="wrap ftr-row">
        <Wordmark size="footer" />
        <p className="label">A Horizon Foundry suite.</p>
        <p className="meta">v{suiteVersion()}</p>
        <nav aria-label="Secondary" className="ftr-nav">
          {SECONDARY.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
