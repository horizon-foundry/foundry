"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

// The skill page's two views: the sell ("Why it matters") and the full
// SKILL.md. Both panels are in the server HTML. With no script the tablist is
// hidden (CSS) and both panels render, the sell and then the spec below it.
// With script, the inline head script has set `.js` before first paint, and
// only then does the panel that is not selected collapse (data-panel without
// data-open, globals.css "Collapsible panels"). Print shows both panels.
//
// Script adds: the tablist, arrow-key movement between tabs (the ARIA tabs
// pattern), and the hash. A link to #skill-md, or to any heading inside the
// SKILL.md (/skills/frame#steps), selects that tab, scrolls to the target and
// moves focus there (the link that was clicked sits in a panel that has just
// collapsed), on load and on hashchange; a hash into the sell (#method)
// selects the sell, and so does an emptied hash (browser Back).
//
// The tablist is its own grid child of the hero. Wide, it sits under `lead` in
// the left column beside `figure`. Narrow, the order is lead, figure, tabs, so
// the tablist is the last thing before the panels and a tab change happens
// where the tabs are, not off screen below a figure (app/styles/skill.css).
// The tabpanel role and its label are added after mount: with no script the
// tablist is hidden, and a tabpanel with no tablist is a broken widget.
type Tab = "sell" | "md";

const subscribe = () => () => {};

const TABS: { id: Tab; label: string }[] = [
  { id: "sell", label: "Why it matters" },
  { id: "md", label: "Full SKILL.md" },
];

export function SkillTabs({
  lead,
  figure,
  sell,
  md,
}: {
  lead: ReactNode;
  figure: ReactNode;
  sell: ReactNode;
  md: ReactNode;
}) {
  // False in the server HTML and during hydration, true after.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [tab, setTab] = useState<Tab>("sell");
  const [printing, setPrinting] = useState(false);
  const [tick, setTick] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const sellRef = useRef<HTMLDivElement>(null);
  const mdRef = useRef<HTMLDivElement>(null);
  // What to scroll to once the selected panel is on screen.
  const scrollTo = useRef<HTMLElement | null>(null);

  // A hash that points into a panel selects that panel's tab. The tab is set
  // by the callback (an event), and the scroll waits for the commit below.
  const routeHash = useCallback(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) {
      // Back from #skill-md to the bare address: the sell is the default view.
      setTab("sell");
      return;
    }
    let id = raw;
    try {
      id = decodeURIComponent(raw);
    } catch {
      // A malformed escape: use the text as written.
    }
    const target = document.getElementById(id);
    const mdPanel = mdRef.current;
    const sellPanel = sellRef.current;
    if (!target || !mdPanel || !sellPanel) return;
    if (target === mdPanel || mdPanel.contains(target)) {
      // The panel itself scrolls to the tablist, so the way back is in view.
      scrollTo.current = target === mdPanel ? listRef.current : target;
      setTab("md");
      setTick((t) => t + 1);
    } else if (sellPanel.contains(target)) {
      scrollTo.current = target;
      setTab("sell");
      setTick((t) => t + 1);
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(routeHash, 0);
    const openForPrint = () => flushSync(() => setPrinting(true));
    const closeAfterPrint = () => setPrinting(false);
    window.addEventListener("hashchange", routeHash);
    window.addEventListener("beforeprint", openForPrint);
    window.addEventListener("afterprint", closeAfterPrint);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("hashchange", routeHash);
      window.removeEventListener("beforeprint", openForPrint);
      window.removeEventListener("afterprint", closeAfterPrint);
    };
  }, [routeHash]);

  // After the panel the hash named is on screen, scroll to the target. Keyed
  // on the tab and on a tick routeHash bumps, so it runs after the commit that
  // made the target visible, and also for a hash into the panel that was
  // already open (no tab change, so no other trigger).
  useEffect(() => {
    const el = scrollTo.current;
    if (!el) return;
    scrollTo.current = null;
    el.scrollIntoView();
    // Focus follows, without a second scroll. The tablist means the md tab
    // button; anything else is a heading or section, made focusable here.
    const focusEl =
      el === listRef.current ? document.getElementById("tab-md") : el;
    if (focusEl) {
      if (!focusEl.matches("button, a[href], [tabindex]")) {
        focusEl.setAttribute("tabindex", "-1");
      }
      focusEl.focus({ preventScroll: true });
    }
  }, [tab, tick]);

  const select = useCallback((next: Tab, focus = false) => {
    setTab(next);
    // The address names the SKILL.md view, so a link to it can be shared and
    // a second click on "Read the full SKILL.md" after switching back fires.
    try {
      window.history.replaceState(
        null,
        "",
        next === "md"
          ? "#skill-md"
          : window.location.pathname + window.location.search,
      );
    } catch {
      // History can be unavailable in a sandboxed frame; the tab still works.
    }
    if (focus) {
      window.requestAnimationFrame(() =>
        document.getElementById(`tab-${next}`)?.focus(),
      );
    }
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let to: number | null = null;
    if (e.key === "ArrowRight") to = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") to = (i + TABS.length - 1) % TABS.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = TABS.length - 1;
    if (to === null) return;
    e.preventDefault();
    select(TABS[to].id, true);
  };

  const open = (which: Tab) => (tab === which || printing ? "" : undefined);

  return (
    <>
      <section className="sk-hero" aria-labelledby="sk-h">
        <div className={`sk-wrap sk-hero-grid${figure ? "" : " sk-hero-solo"}`}>
          <div className="sk-hero-lead">{lead}</div>
          <div
            ref={listRef}
            role="tablist"
            aria-label="View"
            className="sk-tabs"
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={t.id === "sell" ? "skill-sell" : "skill-md"}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => select(t.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {figure && <div className="sk-hero-fig">{figure}</div>}
        </div>
      </section>

      <div
        ref={sellRef}
        id="skill-sell"
        role={mounted ? "tabpanel" : undefined}
        aria-labelledby={mounted ? "tab-sell" : undefined}
        data-panel=""
        data-open={open("sell")}
      >
        {sell}
      </div>
      <div
        ref={mdRef}
        id="skill-md"
        role={mounted ? "tabpanel" : undefined}
        aria-labelledby={mounted ? "tab-md" : undefined}
        data-panel=""
        data-open={open("md")}
      >
        {md}
      </div>
    </>
  );
}
