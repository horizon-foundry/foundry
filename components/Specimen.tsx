import type { CSSProperties } from "react";
import type { SpecimenData, SpecimenRow } from "@/lib/specimen-types";
import { SpecimenFill } from "./SpecimenFill";

// A specimen: a framed excerpt of what a skill actually produces, a few rows
// of its real output shape with exactly one row flagged. It is the one visual
// grammar the skill pages and the homepage share, so eleven skills get
// something that is not text without eleven illustrations. The frame is what
// licenses the flag's hue on a marketing surface (DESIGN.md, the report-excerpt
// exception), and the caption always says where the rows came from: a real
// file in this repo, or "illustrative".
//
// The rows are complete in the server HTML. SpecimenFill only arms the
// once-on-entry fill for a specimen that starts below the fold, so with no
// script, or a specimen already on screen, nothing is ever hidden.

// The data types live in lib/specimen-types.ts; re-exported for compatibility.
export type { SpecimenData, SpecimenRow };

// Tone: "plain" flags a row by luminance only, so a specimen adds no hue to a
// marketing page. "report" is for rows taken from a published audit report,
// which DESIGN.md's report-excerpt license lets carry the verdict hue.
export function Specimen({
  specimen,
  tone = "plain",
  className = "",
}: {
  specimen: SpecimenData;
  tone?: "plain" | "report";
  className?: string;
}) {
  const { title, provenance, columns, rows } = specimen;
  const flagAt = rows.findIndex((r) => r.flag);
  // Every column sizes to its content except the last, which takes the rest,
  // so cells sit left-aligned under their headers instead of spreading out.
  const template =
    columns.length > 1
      ? `repeat(${columns.length - 1}, minmax(0, max-content)) minmax(0, 1fr)`
      : "minmax(0, 1fr)";

  return (
    <SpecimenFill
      className={`border border-line bg-ink-raised/70 ${className}`}
      style={{ "--rows": rows.length } as CSSProperties}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-bone-faint">
        <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
        <span className="normal-case tracking-normal">{provenance}</span>
      </figcaption>

      <div
        role="table"
        aria-label={title}
        className="px-4 py-3 font-mono text-xs leading-5"
      >
        <div
          role="row"
          className="grid gap-x-5 border-b border-line pb-1.5 text-[0.6875rem] text-bone-faint"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c) => (
            <span role="columnheader" key={c} className="min-w-0">
              {c}
            </span>
          ))}
        </div>
        {rows.map((row, i) => (
          <div
            role="row"
            key={i}
            className={`specimen-row relative grid gap-x-5 py-1.5 ${
              i === flagAt ? "text-bone" : "text-bone-dim"
            }`}
            style={
              {
                gridTemplateColumns: template,
                "--i": i,
              } as CSSProperties
            }
          >
            {row.cells.map((cell, j) => (
              <span
                role="cell"
                key={j}
                className="min-w-0 [overflow-wrap:anywhere]"
              >
                {cell}
              </span>
            ))}
            {row.flag && (
              <span
                className={`specimen-flag col-span-full mt-1 inline-flex w-fit items-center border border-line border-l-2 px-1.5 text-[0.6875rem] uppercase tracking-wide ${
                  tone === "report"
                    ? "border-l-verdict-risk text-verdict-risk"
                    : "border-l-signal text-signal"
                }`}
              >
                {row.flag}
              </span>
            )}
          </div>
        ))}
      </div>
    </SpecimenFill>
  );
}
