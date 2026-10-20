import Link from "next/link";
import type { CSSProperties } from "react";
import { Cells } from "@/components/Cells";
import { Reveal } from "@/components/Reveal";
import {
  areaCells,
  readinessOwnership,
  rowsOwnedBy,
} from "@/lib/readiness-owners";

// The share of the readiness map a skill owns: the count against the whole
// map, then the skill's own rows by name (each a link to its row), and a link
// to the map filtered to that skill. production-audit owns most of the map,
// too many rows to list, so it shows the map itself with its cells lit.
// Every number is read from the map; nothing here is typed.

const words = (id: string) => id.replace(/-/g, " ");

export function OwnedBand({ slug }: { slug: string }) {
  const rows = rowsOwnedBy(slug);
  if (rows.length === 0) return null;
  const { total } = readinessOwnership();
  const isAudit = slug === "production-audit";
  const areas = isAudit ? areaCells() : [];
  const lit = areas.reduce(
    (n, a) => n + a.groups.filter((g) => g === "pa").length,
    0,
  );

  return (
    <section className="sk-band sk-own" aria-labelledby="sk-own-h">
      <div className="sk-wrap sk-own-grid">
        <div>
          <h2 id="sk-own-h" className="sr-only">
            What this skill owns on the readiness map
          </h2>
          <p className="sk-own-n">
            <b>{rows.length}</b>
            <span aria-hidden="true">/{total}</span>
            <span className="sr-only"> of {total}</span>
          </p>
          <p className="sk-own-cap">
            {rows.length === 1
              ? "readiness concern is this skill's to show"
              : "readiness concerns are this skill's to show"}
          </p>
          <Link href={`/readiness?owner=${slug}`} className="sk-btn">
            See its rows in the map <span aria-hidden="true">→</span>
          </Link>
        </div>

        {isAudit ? (
          <Reveal
            as="div"
            className="sk-map"
            role="img"
            aria-label={`The readiness map: ${lit} of ${total} concerns are this skill's, across ${areas.length} areas`}
          >
            {areas.map((a, i) => (
              <Cells
                key={a.slug}
                className="sk-cluster"
                items={a.groups.map((g) => (g === "pa" ? "lit" : "off"))}
                style={{ "--d": `${i * 40}ms` } as CSSProperties}
              />
            ))}
          </Reveal>
        ) : (
          <Reveal as="div">
            <ol className="sk-own-rows">
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  data-rv
                  style={{ "--d": `${i * 70}ms` } as CSSProperties}
                >
                  <Link href={`/readiness#${r.id}`}>
                    <span className="sk-or-id">{words(r.id)}</span>
                    <span className="sk-or-when">{r.appliesWhen}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </div>
    </section>
  );
}
