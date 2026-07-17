import { Wordmark } from "./Wordmark";
import { NavLink } from "./NavLink";
import { REPO_URL, REPORTS_HREF } from "@/lib/site";

// Top chrome. Nav is ordered for a new visitor, not for what was interesting to
// build: Overview, Skills, Reports, Method, then the source repo (issue 5
// from the product audit). Behind-the-Build and the private reports live in the
// footer now. Links are plain ink with a hover, no filled pills (DESIGN.md).
// Below sm the same links move to a second header row (they were previously
// hidden entirely, leaving phones with no site navigation). All targets are
// 44px tall (min-h-11), the number the site itself markets.
const NAV = [
  { href: "/", label: "Overview" },
  { href: "/skills", label: "Skills" },
  { href: REPORTS_HREF, label: "Reports", match: "/reports" },
  { href: "/#method", label: "Method" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex min-h-14 items-center justify-between gap-4">
          <Wordmark className="text-sm" />
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 font-mono text-xs uppercase tracking-wide text-bone-dim sm:flex"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                match={item.match}
                className="flex min-h-11 items-center rounded-sm px-2.5 transition-colors"
              />
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center rounded-sm border border-line px-2.5 text-bone transition-colors hover:border-line-strong"
            >
              GitHub
            </a>
          </nav>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center rounded-sm border border-line px-2.5 font-mono text-xs uppercase tracking-wide text-bone transition-colors hover:border-line-strong sm:hidden"
          >
            GitHub
          </a>
        </div>
        <nav
          aria-label="Primary"
          className="-mx-2 flex items-center overflow-x-auto pb-1 font-mono text-[0.7rem] uppercase tracking-wide text-bone-dim sm:hidden"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              match={item.match}
              className="flex min-h-11 shrink-0 items-center px-2 transition-colors"
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
