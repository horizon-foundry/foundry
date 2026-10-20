"use client";

import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { READINESS_COPY } from "@/lib/readiness-copy";
import { parseOwnerFilter } from "@/lib/readiness-types";
import type { OwnerFilter, OwnerGroup } from "@/lib/readiness-types";

// The side column's filters, and the behavior of the map beside it. The page
// stays static: every row is in the server HTML, and this component only hides
// rows and dims cells in the browser. The filters are real links that carry
// their query, so with no script they still navigate and every row shows.
//
//   ?owner=    production-audit | skills | team | outside | a skill name
//   ?evidence= code | record | config | runtime
//   ?area=     an area slug: opens it
//   #<row id>  opens the row's area and scrolls to it; wins over any filter
//
// An unknown value shows everything. The map and its panels are server markup
// that this component never re-renders, so it reaches them through the DOM:
// `hidden` on rows and areas, `data-dim` on cells, `data-open` on panels, and
// the click on an area's button.

export type EvidenceOption = { kind: string; count: number };
// One entry per concern: its owner group, its owner's skill and its evidence,
// so the count under a filter is computed, never read back from the DOM.
export type RowFacts = { g: OwnerGroup; s: string; e: string };

type Filters = { owner: OwnerFilter | null; evidence: string | null };
const NONE: Filters = { owner: null, evidence: null };

const GROUP_VALUE: Record<OwnerGroup, string> = {
  pa: "production-audit",
  sk: "skills",
  out: "team",
};

const ownerValue = (o: OwnerFilter | null) =>
  !o ? null : o.kind === "group" ? GROUP_VALUE[o.group] : o.skill;

function hrefFor(f: Filters) {
  const q = new URLSearchParams();
  const owner = ownerValue(f.owner);
  if (owner) q.set("owner", owner);
  if (f.evidence) q.set("evidence", f.evidence);
  const s = q.toString();
  return s ? `/readiness?${s}` : "/readiness";
}

function readFilters(
  search: string,
  skills: ReadonlySet<string>,
  kinds: ReadonlySet<string>,
): Filters {
  const q = new URLSearchParams(search);
  const evidence = q.get("evidence")?.trim().toLowerCase() ?? null;
  return {
    owner: parseOwnerFilter(q.get("owner"), skills),
    evidence: evidence && kinds.has(evidence) ? evidence : null,
  };
}

const hashId = (hash: string) => {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return "";
  }
};

const matchesFacts = (g: string, s: string, e: string, f: Filters) => {
  const o = f.owner;
  if (o?.kind === "group" && g !== o.group) return false;
  if (o?.kind === "skill" && s !== o.skill) return false;
  if (f.evidence && e !== f.evidence) return false;
  return true;
};
const matches = (el: HTMLElement, f: Filters) =>
  matchesFacts(el.dataset.g ?? "", el.dataset.s ?? "", el.dataset.e ?? "", f);

// The URL's query is the one source of the filters. pushState and replaceState
// raise no event, so every change goes through navigate(), which tells the
// subscribers; popstate covers back and forward.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
// Next patches history.pushState for its own soft navigations, so a link into
// /readiness?owner=... can change the URL without ever reaching navigate().
// The Navigation API's currententrychange sees every entry change where the
// browser has it; the effect in ReadinessFilter covers the rest.
type NavigationTarget = {
  addEventListener(type: string, l: () => void): void;
  removeEventListener(type: string, l: () => void): void;
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  const nav = (window as unknown as { navigation?: NavigationTarget }).navigation;
  window.addEventListener("popstate", notify);
  nav?.addEventListener("currententrychange", notify);
  return () => {
    listeners.delete(l);
    window.removeEventListener("popstate", notify);
    nav?.removeEventListener("currententrychange", notify);
  };
};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

function navigate(href: string, mode: "push" | "replace") {
  if (href !== window.location.pathname + window.location.search) {
    if (mode === "push") window.history.pushState(null, "", href);
    else window.history.replaceState(null, "", href);
  }
  notify();
}

// Hides the rows and areas that do not match and dims the cells that do not.
// Cells dim; text never does.
function applyFilters(f: Filters) {
  const root = document.querySelector<HTMLElement>("[data-areas]");
  if (!root) return;
  const active = f.owner !== null || f.evidence !== null;
  let shown = 0;
  root.querySelectorAll<HTMLElement>("[data-area]").forEach((area) => {
    let inArea = 0;
    area.querySelectorAll<HTMLElement>("li[data-g]").forEach((row) => {
      const ok = matches(row, f);
      row.hidden = !ok;
      if (ok) inArea += 1;
    });
    area.hidden = inArea === 0;
    shown += inArea;
    // The button's spoken count follows the filter: "3 of 8 concerns".
    const count = area.querySelector<HTMLElement>("[data-count]");
    if (count) {
      const n = Number(count.dataset.n);
      count.textContent = active
        ? READINESS_COPY.areaShown(inArea, n)
        : READINESS_COPY.areaConcerns(n);
    }
    area.querySelectorAll<HTMLElement>(".c").forEach((cell) => {
      if (active && !matches(cell, f)) cell.setAttribute("data-dim", "");
      else cell.removeAttribute("data-dim");
    });
  });
  if (active) root.setAttribute("data-filtered", "");
  else root.removeAttribute("data-filtered");
  const empty = document.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = !(active && shown === 0);
}

function setOpen(area: HTMLElement, open: boolean) {
  area.querySelector("[data-panel]")?.toggleAttribute("data-open", open);
  area
    .querySelector(".rd-area-btn")
    ?.setAttribute("aria-expanded", open ? "true" : "false");
}

export function ReadinessFilter({
  skills,
  evidence,
  rows,
  counts,
}: {
  skills: string[];
  evidence: EvidenceOption[];
  rows: RowFacts[];
  counts: {
    audit: number;
    otherSkills: number;
    otherSkillCount: number;
    team: number;
  };
}) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const filters = useMemo(
    () =>
      readFilters(
        search,
        new Set(skills),
        new Set(evidence.map((e) => e.kind)),
      ),
    [search, skills, evidence],
  );
  const shown = useMemo(
    () => rows.filter((r) => matchesFacts(r.g, r.s, r.e, filters)).length,
    [rows, filters],
  );

  useEffect(() => {
    applyFilters(filters);
  }, [filters]);

  // A soft navigation can change the query without any event this module
  // hears. After every render, if the URL no longer matches what was rendered,
  // tell the store: it re-reads, and the next render matches, so this settles.
  useEffect(() => {
    if (window.location.search !== search) notify();
  });

  // Once, after hydration: sync the accordion, then act on the URL.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-areas]");
    if (!root) return;
    const areaOf = (el: Element | null) =>
      el?.closest<HTMLElement>("[data-area]") ?? null;

    // The server draws every panel open. Under .js a panel is collapsed unless
    // it carries data-open, so make the buttons say what is on screen.
    root.querySelectorAll<HTMLElement>("[data-area]").forEach((area) => {
      setOpen(area, !!area.querySelector("[data-panel]")?.hasAttribute("data-open"));
    });

    // A hash on a row or an area opens it and scrolls to it. A row hash wins
    // over a filter, so the row is never hidden by the thing that linked to it.
    const reveal = (hash: string, clearFilters: boolean) => {
      const target = document.getElementById(hashId(hash));
      const area = areaOf(target);
      if (!target || !area) return false;
      if (
        target.matches("li[data-g]") &&
        (clearFilters || target.hidden || area.hidden)
      ) {
        applyFilters(NONE);
        navigate(`${window.location.pathname}${hash}`, "replace");
      }
      setOpen(area, true);
      target.scrollIntoView({ block: "start" });
      return true;
    };

    const hash = window.location.hash;
    const isRow = !!hash && !!document.getElementById(hashId(hash))?.matches("li[data-g]");
    if (!isRow || !reveal(hash, true)) {
      if (hash) {
        reveal(hash, false);
      } else {
        const slug = new URLSearchParams(window.location.search).get("area");
        const wanted = slug ? document.getElementById(`area-${slug}`) : null;
        if (wanted?.matches("[data-area]")) {
          setOpen(wanted, true);
          wanted.scrollIntoView({ block: "start" });
        }
      }
    }

    const onHash = () => {
      reveal(window.location.hash, false);
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLElement>(".rd-area-btn");
      const area = btn ? areaOf(btn) : null;
      if (btn && area) setOpen(area, btn.getAttribute("aria-expanded") !== "true");
    };
    window.addEventListener("hashchange", onHash);
    root.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHash);
      root.removeEventListener("click", onClick);
    };
  }, []);

  const select = (next: Filters) => (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(hrefFor(next), "push");
  };

  const c = READINESS_COPY;
  const total = rows.length;
  const ownerLinks: { g: OwnerGroup; label: string; count: number }[] = [
    { g: "pa", label: c.owner.audit, count: counts.audit },
    { g: "sk", label: c.owner.skills(counts.otherSkillCount), count: counts.otherSkills },
    { g: "out", label: c.owner.team, count: counts.team },
  ];
  const active = filters.owner !== null || filters.evidence !== null;
  const skillOwner = filters.owner?.kind === "skill" ? filters.owner.skill : null;

  return (
    <>
      <nav aria-label="Filter by owner" className="rd-filters">
        {ownerLinks.map(({ g, label, count }) => {
          const on = filters.owner?.kind === "group" && filters.owner.group === g;
          const next: Filters = {
            ...filters,
            owner: on ? null : { kind: "group", group: g },
          };
          return (
            <a
              key={g}
              href={hrefFor(next)}
              aria-current={on ? "true" : undefined}
              onClick={select(next)}
              className="rd-f"
            >
              <i className={`c c-${g}`} aria-hidden="true" />
              <span>{label}</span>
              <b>{count}</b>
            </a>
          );
        })}
      </nav>

      <p className="rd-f-lab" aria-hidden="true">
        {c.evidenceHeading}
      </p>
      <nav aria-label="Filter by evidence" className="rd-filters-ev">
        {evidence.map(({ kind, count }) => {
          const on = filters.evidence === kind;
          const next: Filters = { ...filters, evidence: on ? null : kind };
          return (
            <a
              key={kind}
              href={hrefFor(next)}
              aria-current={on ? "true" : undefined}
              onClick={select(next)}
              className="rd-f rd-fe"
            >
              <span>{kind}</span>
              <b>{count}</b>
              <span className="sr-only">{c.evidence[kind]}</span>
            </a>
          );
        })}
      </nav>

      {/* One status container, always mounted: a live region announces a
          change to what it holds, not its own arrival. */}
      <div className="rd-status" role="status">
        {active && (
          <p className="rd-chip">
            <span>
              {skillOwner && <span className="rd-cmd-text">/{skillOwner} </span>}
              {c.shown(shown, total)}
            </span>{" "}
            <a href="/readiness" onClick={select(NONE)} className="rd-clear">
              {c.showAll}
            </a>
          </p>
        )}
      </div>
      {!active && <p className="rd-hint">{c.hint}</p>}
    </>
  );
}
