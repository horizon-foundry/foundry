import Link from "next/link";
import { CopyButton } from "./CopyButton";
import { VERDICT_LABEL } from "@/lib/report-types";
import {
  REPO_SLUG,
  REPO_URL,
  REPO_ISSUES_URL,
  REPO_LICENSE_URL,
  REPO_CONTRIBUTING_URL,
  VERSION,
} from "@/lib/site";

// The adoption path. This is the answer to "a visitor cannot actually adopt the
// product": exact install commands, requirements, what install does, and how to
// upgrade or remove it. npx is the front door; a from-source clone is the
// fully-specified fallback. Kept in the instrument register, not a marketing
// splash.

const NPX_CMD = `npx skills@latest add ${REPO_SLUG}`;
const SOURCE_CMDS = [`git clone ${REPO_URL}`, "cd foundry", "make install"].join("\n");

// Server-side star count. Returns null on any failure (private repo, rate limit,
// network), in which case the button shows with no count. Cached for an hour.
async function getStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

function StarButton({ stars }: { stars: number | null }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      className="lift inline-flex items-center gap-2 border border-line-strong px-3 py-2 font-mono text-xs uppercase tracking-wide text-bone transition-colors hover:border-bone-faint"
    >
      <svg viewBox="0 0 16 16" className="size-3.5 fill-current" aria-hidden="true">
        <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.8 4.2 13.3l.7-4.3-3.1-3 4.3-.6z" />
      </svg>
      Star on GitHub
      {stars !== null && (
        <span className="border-l border-line pl-2 tabular-nums text-bone-dim">
          {stars.toLocaleString()}
        </span>
      )}
    </a>
  );
}

const DETAIL = [
  {
    k: "Requirements",
    d: "For npx: Node and Claude Code. For the from-source path: git, make, and Claude Code. No account, no telemetry.",
  },
  {
    k: "What it installs",
    d: "The skills land in Claude Code's skills directory, invocable in any session as top-level commands (/foundry, /production-audit, and so on). npx lets you pick which skills; the from-source make install symlinks them all so they track the repo.",
  },
  {
    k: "Upgrade and uninstall",
    d: "npx: re-run the add command to update. From source: git pull && make install to update, make uninstall to remove the symlinks. Nothing else touches your system.",
  },
];

export async function InstallBlock() {
  const stars = await getStars();

  return (
    <section id="install" className="reveal border-b border-line bg-ink-raised">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
              Install Foundry
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone-dim">
              One command adds the skills to Claude Code. No build step, no
              account required, and the skills contain no telemetry: they run
              entirely in your environment.
            </p>
          </div>
          <StarButton stars={stars} />
        </div>

        {/* min-w-0 on both columns: without it the pre's intrinsic width
            propagates through the grid and widens the whole page on phones,
            clipping the install command (the conversion moment). */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 space-y-5">
            {/* Recommended: npx. */}
            <div className="border border-line bg-ink">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                {/* Emphasis by luminance, not hue: amber is reserved for
                    commands you fire (DESIGN.md report-excerpt exception). */}
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-signal">
                  recommended
                </span>
                <CopyButton
                  text={NPX_CMD}
                  analytics={{ command_kind: "npx", surface: "install-block" }}
                />
              </div>
              <pre className="whitespace-pre-wrap break-all px-4 py-4 font-mono text-sm leading-relaxed sm:overflow-x-auto sm:whitespace-pre sm:break-normal">
                <code>
                  <span className="text-bone-faint">$ </span>
                  <span className="text-command">{NPX_CMD}</span>
                </code>
              </pre>
              <p className="border-t border-line px-4 py-2.5 font-mono text-xs leading-relaxed text-bone-faint">
                Runs the open-source skills CLI: it copies the skills you pick
                into your Claude Code setup and nothing more. Then run{" "}
                <span className="text-command">claude</span> and{" "}
                <span className="text-command">/foundry check</span>.
              </p>
            </div>

            {/* Alternative: from source. */}
            <div className="border border-line bg-ink">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                  from source
                </span>
                <CopyButton
                  text={SOURCE_CMDS}
                  analytics={{ command_kind: "clone", surface: "install-block" }}
                />
              </div>
              <pre className="whitespace-pre-wrap break-all px-4 py-4 font-mono text-sm leading-relaxed sm:overflow-x-auto sm:whitespace-pre sm:break-normal">
                <code>
                  <span className="text-bone-faint">$ </span>
                  <span className="text-bone-dim">git clone {REPO_URL}</span>
                  {"\n"}
                  <span className="text-bone-faint">$ </span>
                  <span className="text-bone-dim">cd foundry</span>
                  {"\n"}
                  <span className="text-bone-faint">$ </span>
                  <span className="text-bone-dim">make install</span>
                </code>
              </pre>
              <p className="border-t border-line px-4 py-2.5 font-mono text-xs leading-relaxed text-bone-faint">
                Symlinks every skill so it tracks the repo. Update with{" "}
                <span className="text-bone-dim">git pull &amp;&amp; make install</span>,
                remove with <span className="text-bone-dim">make uninstall</span>.
              </p>
            </div>
          </div>

          {/* What happens when you invoke it. self-start keeps the card sized
              to its content instead of stretching to the taller command column
              (which left ~40% dead panel at lg). */}
          <div className="min-w-0 border border-line bg-ink p-5 lg:self-start">
            <p className="font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
              What happens when you invoke it
            </p>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">
              A skill is something Claude Code runs against your project.{" "}
              <span className="text-command">/production-audit</span> reads your
              code (never writes), traces the flows that cross file boundaries,
              refutes its own findings, and returns a verdict:
            </p>
            <div className="mt-3 border border-line bg-ink-raised px-3 py-2 font-mono text-xs">
              <div>
                <span className="text-bone-faint">verdict  </span>
                <span className="uppercase text-verdict-risk">
                  {VERDICT_LABEL["ship-with-known-risks"]}
                </span>
              </div>
              <div className="mt-1 text-bone-dim">
                0 critical, 0 high, 4 medium, every finding cited to file and line
              </div>
            </div>
          </div>
        </div>

        {/* Requirements, behavior, lifecycle. */}
        <dl className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
          {DETAIL.map((item) => (
            <div key={item.k} className="bg-ink p-5">
              <dt className="font-mono text-sm font-semibold uppercase tracking-wide text-bone">
                {item.k}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-bone-dim">
                {item.d}
              </dd>
            </div>
          ))}
        </dl>

        {/* Version, license, source, contribution. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-bone-faint">
          <span>
            <span className="text-bone-dim">v{VERSION}</span> · pre-1.0
          </span>
          <a href={REPO_LICENSE_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-bone-dim">
            MIT license
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-bone-dim">
            Source
          </a>
          <a href={REPO_ISSUES_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-bone-dim">
            Report an issue
          </a>
          <a href={REPO_CONTRIBUTING_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-bone-dim">
            Contributing
          </a>
          <Link href="/skills" className="transition-colors hover:text-bone-dim">
            Browse all skills →
          </Link>
        </div>
      </div>
    </section>
  );
}
