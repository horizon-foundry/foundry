import type { SkillFigure as FigureData } from "@/lib/skills";

// A highlight's small proof: a real number pair, or the strip of real states a
// skill reports. Monochrome and static; it carries proof, so it never moves.
export type Verification = {
  confirmed: number;
  downgraded: number;
  refuted: number;
  date: string;
};

export function Figure({
  figure,
  verification,
}: {
  figure: FigureData;
  verification?: Verification;
}) {
  if (figure.kind === "verification") {
    if (!verification) return null;
    const { confirmed, downgraded, refuted, date } = verification;
    return (
      <p className="mt-auto pt-5 font-mono">
        <span className="block text-2xl text-bone">
          {downgraded + refuted} of {confirmed + downgraded + refuted}
        </span>
        <span className="mt-1 block text-[0.6875rem] leading-snug text-bone-faint">
          checked findings the skeptics downgraded or refuted, in the {date} self-audit
        </span>
      </p>
    );
  }
  if (figure.kind === "stat") {
    return (
      <p className="mt-auto pt-5 font-mono">
        <span className="block text-2xl text-bone">{figure.value}</span>
        <span className="mt-1 block text-[0.6875rem] leading-snug text-bone-faint">
          {figure.label}
        </span>
      </p>
    );
  }
  return (
    <ul
      aria-label="States it reports"
      className="mt-auto flex flex-wrap gap-1.5 pt-5 font-mono text-[0.6875rem] text-bone-dim"
    >
      {figure.items.map((s) => (
        <li key={s} className="border border-line px-1.5 py-0.5">
          {s}
        </li>
      ))}
    </ul>
  );
}
