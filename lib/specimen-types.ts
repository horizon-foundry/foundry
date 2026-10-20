// The shape of a specimen: a framed excerpt of what a skill produces. Lives in
// lib/ so data files (skills.ts, self-audit.ts) do not import from a component.
export type SpecimenRow = { cells: string[]; flag?: string };

export type SpecimenData = {
  title: string;
  provenance: string;
  columns: string[];
  rows: SpecimenRow[];
};
