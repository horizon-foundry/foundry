"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The full SKILL.md, closed by default: the page sells the skill, and the spec
// is one click away for whoever wants it. A native <details>, so it opens and
// closes with no script and search engines still read the text. Script adds
// two things only: a link to a heading inside it (/skills/frame#steps) opens
// it and scrolls there, and printing opens it so a printout is complete.
export function SkillSpecDisclosure({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const openForHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target || (target !== el && !el.contains(target))) return;
      el.open = true;
      requestAnimationFrame(() => target.scrollIntoView());
    };
    const openForPrint = () => {
      el.open = true;
    };

    openForHash();
    window.addEventListener("hashchange", openForHash);
    window.addEventListener("beforeprint", openForPrint);
    return () => {
      window.removeEventListener("hashchange", openForHash);
      window.removeEventListener("beforeprint", openForPrint);
    };
  }, []);

  return (
    <details ref={ref} id="skill-md" className="group scroll-mt-28 border-y border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-mono text-sm text-bone transition-colors hover:text-signal [&::-webkit-details-marker]:hidden">
        {summary}
        <span
          aria-hidden="true"
          className="text-bone-faint transition-transform duration-quick group-open:rotate-90"
        >
          →
        </span>
      </summary>
      <div className="pb-10 pt-6">{children}</div>
    </details>
  );
}
