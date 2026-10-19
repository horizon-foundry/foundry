import type { SkillFigure as FigureData } from "@/lib/skills";

// A highlight's small proof: a real number pair, or the strip of real states a
// skill reports. Monochrome and static; it carries proof, so it never moves.
export function Figure({ figure }: { figure: FigureData }) {
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
