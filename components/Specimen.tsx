import type { CSSProperties } from "react";
import { Frame } from "@/components/Frame";
import type { SpecimenData, SpecimenRow } from "@/lib/specimen-types";

// A specimen: a framed excerpt of what a skill produces, a few rows of its
// output shape with exactly one row flagged. It is the hero figure of every
// skill page that has no figure of its own, in the site's frame grammar: a
// head with the title and where the rows came from, the rows, one of them in
// signal white. The provenance always says whether the rows are a real file
// in this repo or illustrative.
//
// The flag is told apart by luminance and a bar, never by hue: only a frame
// that excerpts the real report carries severity or verdict color (DESIGN.md,
// Colors), and no specimen here does. The rows are complete in the server
// HTML; Frame's Reveal arms a specimen that starts below the fold and nothing
// else.

// The data types live in lib/specimen-types.ts; re-exported for compatibility.
export type { SpecimenData, SpecimenRow };

export function Specimen({ specimen }: { specimen: SpecimenData }) {
  const { title, provenance, columns, rows } = specimen;
  // Every column sizes to its content except the last, which takes the rest,
  // so cells sit left-aligned under their headers instead of spreading out.
  const template =
    columns.length > 1
      ? `repeat(${columns.length - 1}, minmax(0, max-content)) minmax(0, 1fr)`
      : "minmax(0, 1fr)";

  return (
    <Frame reveal left={title} right={provenance} className="sk-spec">
      <div role="table" aria-label={title} className="sk-spec-table">
        <div
          role="row"
          className="sk-spec-row sk-spec-head"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c) => (
            <span role="columnheader" key={c}>
              {c}
            </span>
          ))}
        </div>
        {rows.map((row, i) => (
          <div
            role="row"
            key={i}
            data-rv
            className={`sk-spec-row${row.flag ? " sk-spec-flagged" : ""}`}
            style={
              {
                gridTemplateColumns: template,
                "--d": `${i * 80}ms`,
              } as CSSProperties
            }
          >
            {row.cells.map((cell, j) => (
              <span role="cell" key={j} data-label={columns[j]}>
                {cell}
              </span>
            ))}
            {row.flag && (
              <span role="cell" className="sk-spec-flag">
                {row.flag}
              </span>
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
}
