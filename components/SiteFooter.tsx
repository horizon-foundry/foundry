import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { REPO_URL, REPO_LICENSE_URL, VERSION } from "@/lib/site";

// Secondary navigation lives here (issue 5): Behind the Build and the private
// reports are for people who already care, not the first thing a new visitor
// needs. "Reports" is renamed "Private reports" so the gate is not a surprise.
const SECONDARY = [
  { href: "/behind", label: "Behind the build", external: false },
  { href: "/reports", label: "Private reports", external: false },
  { href: REPO_URL, label: "GitHub", external: true },
  { href: REPO_LICENSE_URL, label: "License (MIT)", external: true },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex flex-col gap-2">
          <Wordmark className="text-xs" />
          <p className="font-mono text-[0.68rem] uppercase tracking-wide text-bone-faint">
            A Horizon Foundry project · v{VERSION}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.68rem] uppercase tracking-wide text-bone-faint">
          {SECONDARY.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="-my-2 py-2 transition-colors hover:text-bone-dim"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="-my-2 py-2 transition-colors hover:text-bone-dim"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
