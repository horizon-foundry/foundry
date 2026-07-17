"use client";

import { useEffect, useRef, useState } from "react";

// A live terminal: the suite's skills are terminal commands, so the landing
// demonstrates them by running one. The default is /production-audit, the
// flagship the reports anchor on, so the first thing a visitor sees is a ship
// verdict with risks separated from improvements; the other chips drill into
// the conductor and the individual skills. This is
// also where the landing's color lives, all of it meaningful: the command is
// amber (the forge), the output carries the report's verdict and severity hues
// and a pass-green. Nothing decorative. Reduced-motion shows the run instantly;
// the command chips are 44px touch targets (the mobile discipline).

type Span = { t: string; c: string };

const C = {
  cmd: "text-command",
  faint: "text-bone-faint",
  dim: "text-bone-dim",
  bone: "text-bone",
  risk: "text-verdict-risk",
  safe: "text-verdict-safe",
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
} as const;

type Cmd = { id: string; cmd: string; out: Span[][] };

const COMMANDS: Cmd[] = [
  {
    id: "production-audit",
    cmd: "/production-audit",
    out: [
      [
        { t: "verdict  ", c: C.faint },
        { t: "SAFE TO SHIP", c: C.safe },
      ],
      [
        { t: "0", c: C.safe },
        { t: " risks   ", c: C.faint },
        { t: "6", c: C.dim },
        { t: " improvements", c: C.faint },
      ],
      [{ t: "improvements don't block the release", c: C.dim }],
    ],
  },
  {
    id: "foundry",
    cmd: "/foundry check",
    out: [
      [
        { t: "readiness  ", c: C.faint },
        { t: "SAFE TO SHIP", c: C.safe },
      ],
      [
        { t: "document ", c: C.dim },
        { t: "✓", c: C.safe },
        { t: "   mobile ", c: C.dim },
        { t: "✓", c: C.safe },
        { t: "   instrumentation ", c: C.dim },
        { t: "✓", c: C.safe },
        { t: "   audit ", c: C.dim },
        { t: "✓", c: C.safe },
      ],
      [{ t: "read-only release-gate scorecard", c: C.dim }],
    ],
  },
  {
    id: "scaffold",
    cmd: "/scaffold",
    out: [
      [{ t: "cloned template, doc set filled, deploy + license in place", c: C.dim }],
      [{ t: "production-ready from the first commit", c: C.safe }],
    ],
  },
  {
    id: "document",
    cmd: "/document",
    out: [
      [{ t: "Behind the Build hub live, overview deck authored", c: C.dim }],
      [{ t: "docs render from source, so they cannot drift", c: C.safe }],
    ],
  },
  {
    id: "mobile",
    cmd: "/mobile",
    out: [
      [{ t: "touch targets >= 44px, keyboard clears the controls", c: C.dim }],
      [{ t: "0 horizontal overflow at a real device width", c: C.safe }],
    ],
  },
  {
    id: "instrumentation",
    cmd: "/instrumentation",
    out: [
      [{ t: "funnel on one identity, client + server", c: C.dim }],
      [{ t: "activation instrumented, events flush server-side", c: C.safe }],
    ],
  },
];

// The screen is keyed by the active command, so selecting one remounts it with
// fresh state (no reset-in-effect). The effect only schedules state via timers,
// which the react-hooks rule allows.
function Screen({ cmd }: { cmd: Cmd }) {
  const [typed, setTyped] = useState("");
  const [showOut, setShowOut] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const full = cmd.cmd;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Not synchronous: scheduled, so the run appears at once without jank.
      timers.push(
        setTimeout(() => {
          setTyped(full);
          setShowOut(true);
        }, 0),
      );
    } else {
      for (let i = 1; i <= full.length; i++) {
        timers.push(setTimeout(() => setTyped(full.slice(0, i)), 45 * i));
      }
      timers.push(setTimeout(() => setShowOut(true), 45 * full.length + 260));
    }
    return () => timers.forEach(clearTimeout);
  }, [cmd.cmd]);

  return (
    <div className="min-h-[168px] px-4 py-4 font-mono text-sm">
      <div className="flex items-center">
        <span className="mr-2 text-bone-faint" aria-hidden="true">
          ▸
        </span>
        <span className="text-command">{typed}</span>
        {!showOut && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-command align-middle" />
        )}
      </div>
      <div
        className={`mt-3 space-y-1.5 transition-opacity duration-300 ${showOut ? "opacity-100" : "opacity-0"}`}
      >
        {cmd.out.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line.map((s, j) => (
              <span key={j} className={s.c}>
                {s.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Terminal() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full border border-line bg-ink-raised">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
        </span>
        <span className="ml-1 font-mono text-[0.68rem] uppercase tracking-wide text-bone-faint">
          foundry
        </span>
        {/* The honest boundary, applied to our own hero: this is a replay,
            not a live session. */}
        <span className="ml-auto font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
          simulated run
        </span>
      </div>

      <Screen key={active} cmd={COMMANDS[active]} />

      {/* Runnable commands. Each chip is a real button and a 44px touch target. */}
      <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-3">
        {COMMANDS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`min-h-11 border px-2.5 py-1 font-mono text-xs transition-colors ${
              i === active
                ? "border-command/60 text-command"
                : "border-line text-bone-faint hover:border-line-strong hover:text-bone-dim"
            }`}
          >
            {c.cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
