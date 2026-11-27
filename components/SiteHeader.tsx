import { Wordmark } from "./Wordmark";
import { NavLink } from "./NavLink";
import { PhoneMenu } from "./PhoneMenu";
import { REPO_URL, REPORTS_HREF } from "@/lib/site";

// Top chrome: one Ink band, 64px, pinned on every ground (the parent's first
// rule: without a pinned header the body has to repeat itself). Nav is ordered
// for a new visitor: Skills, Readiness, Reports, then the source repo as the
// one button. The lockup is the way home, so there is no Overview item.
// Behind-the-Build and the private reports live in the footer.
//
// Under 48rem the links move into a Menu (components/PhoneMenu.tsx), a
// <details> element, so it opens with no script. Every target is 44px or
// taller. The 404 page lists the same three pages, so the list is exported.
export const NAV = [
  { href: "/skills", label: "Skills" },
  { href: "/readiness", label: "Readiness" },
  { href: REPORTS_HREF, label: "Reports", match: "/reports" },
];

export function SiteHeader() {
  return (
    <header className="hdr" data-ground="ink">
      <div className="wrap hdr-row">
        <Wordmark />
        <nav aria-label="Primary" className="hdr-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              match={item.match}
              className="hdr-link"
            />
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm"
          >
            GitHub
          </a>
        </nav>
        <PhoneMenu items={NAV} repoUrl={REPO_URL} />
      </div>
    </header>
  );
}
