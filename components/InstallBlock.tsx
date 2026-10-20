import Link from "next/link";
import { CopyButton } from "./CopyButton";
import {
  REPO_SLUG,
  REPO_URL,
  REPO_ISSUES_URL,
  REPO_LICENSE_URL,
  REPO_CONTRIBUTING_URL,
} from "@/lib/site";
import { suiteVersion } from "@/lib/version";

// The adoption path. This is the answer to "a visitor cannot actually adopt the
// product": exact install commands, requirements, what install does, and how to
// upgrade or remove it. npx is the front door; a from-source clone is the
// fully-specified fallback. Kept in the instrument register, not a marketing
// splash.

const NPX_CMD = `npx skills@latest add ${REPO_SLUG}`;
const SOURCE_CMDS = [`git clone ${REPO_URL}`, "cd foundry", "make install"].join("\n");

// Server-side star count. Returns null on any failure (private repo, rate limit,
// network), in which case the button shows with no count. Cached for an hour.
export async function getStars(): Promise<number | null> {
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

export function StarButton({ stars }: { stars: number | null }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      className="lift inline-flex min-h-11 items-center gap-2 border border-line-strong px-3 py-2 font-mono text-xs uppercase tracking-wide text-bone transition-colors hover:border-bone-faint"
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

// A command a reader types, inside running prose: the command style (DESIGN.md,
// Colors), so every command on the page reads the same.
function Cmd({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-command">{children}</span>;
}

const DETAIL: { k: string; d: React.ReactNode }[] = [
  {
    k: "Requirements",
    d: "For npx: Node and Claude Code. For the from-source path: git, make, and Claude Code. No account; the skills' only network call is the disclosed daily version check.",
  },
  {
    k: "What it installs",
    d: (
      <>
        The skills land in Claude Code&apos;s skills directory, invocable in
        any session as top-level commands (<Cmd>/foundry</Cmd>,{" "}
        <Cmd>/production-audit</Cmd>, and so on). npx lets you pick which
        skills; the from-source <Cmd>make install</Cmd> symlinks them all so
        they track the repo.
      </>
    ),
  },
  {
    k: "Upgrade and uninstall",
    d: (
      <>
        npx: re-run the add command to update; a skill run tells you when a
        newer suite is out. From source: <Cmd>git pull &amp;&amp; make install</Cmd>{" "}
        to update, <Cmd>make uninstall</Cmd> to remove the symlinks. Beyond the
        skills directory, the one file the skills touch is the version-check
        stamp at ~/.claude/.foundry-version-checked.
      </>
    ),
  },
];

// `heading` replaces the default "Install Foundry" h2, so a page that titles
// the section itself (the homepage) keeps one heading on the #install anchor.
export async function InstallBlock({ heading }: { heading?: React.ReactNode } = {}) {
  const stars = await getStars();

  // One command and the first thing to run, then everything else folded. The
  // version-check disclosure stays visible: it is part of the feature, not a
  // footnote (instrumentation skill, "The gate demands a decision").
  return (
    <section id="install" className="scroll-mt-20 border-b border-line bg-ink-raised">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {heading ?? (
            <h2 className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
              Install Foundry
            </h2>
          )}
          <StarButton stars={stars} />
        </div>

        <div className="mt-6 max-w-3xl min-w-0 border border-line bg-ink">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-signal">
              one command
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
          <p className="border-t border-line px-4 py-2.5 font-mono text-xs leading-relaxed text-bone-dim">
            Then open Claude Code in your project and run{" "}
            <span className="text-command">/production-audit</span>.
          </p>
        </div>

        <p className="mt-4 max-w-measure text-sm leading-relaxed text-bone-faint">
          No account, no build step. At most once a day a skill asks this site
          for the current version, sending only its name and version.{" "}
          <span className="font-mono text-bone-dim">FOUNDRY_NO_VERSION_CHECK</span>{" "}
          turns it off.
        </p>

        <details className="group mt-8 max-w-3xl border-y border-line">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors hover:text-bone [&::-webkit-details-marker]:hidden">
            From source, requirements, and what it installs
            <span aria-hidden="true" className="transition-transform duration-quick group-open:rotate-90">
              →
            </span>
          </summary>
          <div className="pb-6">
            <div className="min-w-0 border border-line bg-ink">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-bone-faint">
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
                  <span className="text-command">git clone {REPO_URL}</span>
                  {"\n"}
                  <span className="text-bone-faint">$ </span>
                  <span className="text-command">cd foundry</span>
                  {"\n"}
                  <span className="text-bone-faint">$ </span>
                  <span className="text-command">make install</span>
                </code>
              </pre>
            </div>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {DETAIL.map((item) => (
                <div key={item.k} className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="font-mono text-xs font-semibold uppercase tracking-wide text-bone">
                    {item.k}
                  </dt>
                  <dd className="max-w-measure text-sm leading-relaxed text-bone-dim">
                    {item.d}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </details>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-bone-faint">
          <span>
            <span className="text-bone-dim">v{suiteVersion()}</span> · pre-1.0
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
        </div>
      </div>
    </section>
  );
}

// The install command where a visitor first lands, so installing never waits
// for the bottom of the page. Same command, same install_copied event; the
// surface property says it came from the hero.
export async function HeroInstall() {
  const stars = await getStars();
  return (
    <div className="mt-8 max-w-xl">
      <div className="flex min-w-0 items-stretch border border-line-strong bg-ink-raised">
        <pre className="min-w-0 flex-1 overflow-x-auto px-3 py-2.5 font-mono text-sm leading-relaxed">
          <code>
            <span className="text-bone-faint">$ </span>
            <span className="text-command">{NPX_CMD}</span>
          </code>
        </pre>
        <div className="flex items-center border-l border-line px-2">
          <CopyButton
            text={NPX_CMD}
            analytics={{ command_kind: "npx", surface: "hero" }}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href="/skills"
          className="inline-flex min-h-11 items-center border border-line px-3 py-2 font-mono text-sm text-bone-dim transition-colors hover:border-line-strong hover:text-bone"
        >
          See the skills →
        </Link>
        <StarButton stars={stars} />
      </div>
    </div>
  );
}
