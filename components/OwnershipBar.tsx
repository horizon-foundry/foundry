import type { Ownership } from "@/lib/readiness-owners";

// Who owns the readiness map's concerns, as one bar with the counts as text.
// Monochrome by luminance: the audit, the other skills, and owners outside
// Foundry. The bar is decoration for the numbers beside it, so it is hidden
// from assistive technology and the list carries the meaning.
export function OwnershipBar({ owned }: { owned: Ownership }) {
  const segments = [
    { label: "Production Audit", count: owned.auditRows, tone: "bg-bone" },
    { label: "Other Foundry skills", count: owned.otherSkillRows, tone: "bg-bone-dim" },
    { label: "Outside Foundry", count: owned.outsideRows, tone: "bg-line-strong" },
  ];
  return (
    <figure className="max-w-3xl">
      <figcaption className="sr-only">Who owns the {owned.total} concerns</figcaption>
      <div aria-hidden="true" className="flex h-3 gap-px bg-ink">
        {segments.map((s) => (
          <span
            key={s.label}
            className={s.tone}
            style={{ width: `${(s.count / owned.total) * 100}%` }}
          />
        ))}
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-3 font-mono text-xs sm:grid-cols-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-baseline gap-3">
            <span aria-hidden="true" className={`size-2 shrink-0 ${s.tone}`} />
            <dt className="text-bone-dim">{s.label}</dt>
            <dd className="ml-auto text-bone sm:ml-0">{s.count}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
