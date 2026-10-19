"use client";

import { useEffect, useState } from "react";

// Filters the map by owner without making the page dynamic: every row is in
// the static HTML, and this hides the rows that do not match `?owner=`. With
// no script the links still carry the query and every row shows, so nothing
// is ever unreachable. Values: "all", "production-audit", "skills" (every
// other Foundry skill), "outside", or one skill's name.
export type FilterOption = { value: string; label: string; count: number };

function apply(value: string) {
  const sections = document.querySelectorAll<HTMLElement>("[data-area]");
  sections.forEach((section) => {
    let shown = 0;
    section.querySelectorAll<HTMLElement>("li[data-owner]").forEach((li) => {
      const owner = li.dataset.owner ?? "";
      const match =
        value === "all" ||
        owner === value ||
        (value === "skills" && owner !== "outside" && owner !== "production-audit");
      li.hidden = !match;
      if (match) shown += 1;
    });
    section.hidden = shown === 0;
  });
}

export function ReadinessFilter({ options }: { options: FilterOption[] }) {
  const [value, setValue] = useState("all");

  useEffect(() => {
    const read = () => {
      const v = new URLSearchParams(window.location.search).get("owner") ?? "all";
      setValue(v);
      apply(v);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // A skill linked from its own page (?owner=frame) gets a chip of its own.
  const known = options.some((o) => o.value === value);
  const shown = known
    ? options
    : [...options, { value, label: value, count: -1 }];

  return (
    <nav aria-label="Filter by owner" className="flex flex-wrap gap-2">
      {shown.map((o) => {
        const active = o.value === value;
        const href = o.value === "all" ? "/readiness" : `/readiness?owner=${o.value}`;
        return (
          <a
            key={o.value}
            href={href}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, "", href);
              setValue(o.value);
              apply(o.value);
            }}
            className={`inline-flex min-h-11 items-center gap-2 border px-3 font-mono text-xs transition-colors ${
              active
                ? "border-bone text-bone"
                : "border-line text-bone-dim hover:border-line-strong hover:text-bone"
            }`}
          >
            {o.label}
            {o.count >= 0 && <span className="text-bone-faint">{o.count}</span>}
          </a>
        );
      })}
    </nav>
  );
}
