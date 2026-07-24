import { SeverityChip, VerdictStamp } from "@/components/report-ui";
import type { Severity } from "@/lib/report-types";

export const metadata = { title: "Design system" };

// Hex labels mirror app/globals.css @theme; when the tokens change, change
// these in the same commit (the swatches use bg-* classes so they always
// render the truth, but a lying label is doc drift on a public surface).
const NEUTRALS = [
  ["ink", "#14191F", "bg-ink"],
  ["ink-raised", "#1E2530", "bg-ink-raised"],
  ["ink-raised-2", "#283340", "bg-ink-raised-2"],
  ["line", "#334455", "bg-line"],
  ["line-strong", "#45566A", "bg-line-strong"],
  ["bone-faint", "#8B94A4", "bg-bone-faint"],
  ["bone-dim", "#A2ABB8", "bg-bone-dim"],
  ["bone", "#E8ECF0", "bg-bone"],
] as const;

const SEVERITIES: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
        {label}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function DesignSystem() {
  return (
    <div className="max-w-4xl">
      <p className="max-w-2xl font-serif leading-relaxed text-bone-dim">
        Foundry, the design system for the suite, rendered from its own tokens.
        The brand layer is monochrome steel and white, the Horizon Foundry
        palette. Color is reserved: severity and verdict hues live in the
        reports (and in elements explicitly framed as report excerpts, nowhere
        else), and <span className="text-command">amber</span> is the forge
        glow, used only on the invoke and run layer (the commands you fire),
        never for decoration.
      </p>

      <div className="mt-8">
        <Section label="Neutral ramp: ink to bone">
          <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {NEUTRALS.map(([name, hex, bg]) => (
              <div key={name} className="bg-ink p-3">
                <div className={`h-12 border border-line ${bg}`} />
                <div className="mt-2 font-mono text-[0.65rem] text-bone">
                  {name}
                </div>
                <div className="font-mono text-[0.6rem] uppercase text-bone-faint">
                  {hex}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Severity ramp: the only saturated ink">
          <div className="flex flex-wrap items-center gap-3">
            {SEVERITIES.map((s) => (
              <SeverityChip key={s} severity={s} />
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
            Critical red, high orange, medium amber, low steel, informational
            gray. The three verdict colors reuse the same hues so a reader learns
            one language.
          </p>
        </Section>

        <Section label="Verdict stamps">
          <div className="grid gap-4 sm:grid-cols-3">
            <VerdictStamp level="safe-to-ship" />
            <VerdictStamp level="ship-with-known-risks" />
            <VerdictStamp level="do-not-ship" />
          </div>
        </Section>

        <Section label="Typography: the foundry and the instrument">
          <div className="space-y-5">
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-bone">
                Big Shoulders
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-bone-faint">
                The brand voice · wordmark · display headings
              </p>
            </div>
            <div>
              <p className="text-2xl text-bone">IBM Plex Sans</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-bone-faint">
                Body and UI voice
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tracking-tight text-bone">
                IBM Plex Mono
              </p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-bone-faint">
                The instrument voice · IDs · severities · verdicts · metadata
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl text-bone">IBM Plex Serif</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-bone-faint">
                Long-form rendered documentation only
              </p>
            </div>
          </div>
        </Section>

        <Section label="The command accent: amber">
          <div className="flex items-center gap-4">
            <span className="inline-block h-10 w-10 border border-line bg-command" />
            <div>
              <p className="font-mono text-sm text-bone">
                command <span className="text-bone-faint">#D99A2E</span>
              </p>
              <p className="mt-1 text-sm text-bone-dim">
                The forge glow. Reserved for the invoke and run layer, the
                commands you fire, like{" "}
                <code className="text-command">/production-audit</code> or{" "}
                <code className="text-command">make install</code>, and nothing
                else.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
