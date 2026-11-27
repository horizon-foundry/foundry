import Link from "next/link";
import { CopyButton } from "./CopyButton";
import { CommandField } from "./CommandField";
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

// A text link, with the count beside it as a mono figure.
export function StarButton({ stars }: { stars: number | null }) {
  return (
    <a href={REPO_URL} target="_blank" rel="noreferrer" className="tl tl-figure">
      <span>Star on GitHub</span>
      {stars !== null && (
        <span className="tl-count tabular-nums">{stars.toLocaleString()}</span>
      )}
    </a>
  );
}

// A command a reader types, inside running prose: the command style (DESIGN.md,
// Colors), so every command on the page reads the same.
function Cmd({ children }: { children: React.ReactNode }) {
  return <span className="cmd">{children}</span>;
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
    <section id="install" data-ground="ink">
      <div className="wrap py-(--section-y)">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {heading ?? <h2 className="d-h2">Install Foundry</h2>}
          <StarButton stars={stars} />
        </div>

        <div className="mt-10 max-w-3xl">
          <CommandField command={NPX_CMD} surface="install-block" />
          <p className="mt-4 text-fg">
            Then open Claude Code in your project and run{" "}
            <span className="cmd">/production-audit</span>.
          </p>
        </div>

        <p className="mt-4 max-w-measure text-[0.96875rem] leading-relaxed text-fg-2">
          No account, no build step. At most once a day a skill asks this site
          for the current version, sending only its name and version.{" "}
          <span className="cmd">FOUNDRY_NO_VERSION_CHECK</span> turns it off.
        </p>

        <details className="group mt-10 max-w-3xl border-y-2 border-rule">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-fg [&::-webkit-details-marker]:hidden">
            From source, requirements, and what it installs
            <span aria-hidden="true" className="font-mono text-fg-2 group-open:hidden">
              +
            </span>
            <span aria-hidden="true" className="hidden font-mono text-fg-2 group-open:inline">
              -
            </span>
          </summary>
          <div className="pb-6">
            <div className="min-w-0 border-2 border-fg bg-field">
              <div className="flex items-center justify-between border-b border-ledger py-1 pl-4 pr-1">
                <span className="label">From source</span>
                <CopyButton
                  text={SOURCE_CMDS}
                  analytics={{ command_kind: "clone", surface: "install-block" }}
                />
              </div>
              <pre className="whitespace-pre-wrap break-all px-4 py-4 font-mono text-[0.9375rem] font-medium leading-relaxed text-fg sm:overflow-x-auto sm:whitespace-pre sm:break-normal">
                <code>
                  <span className="text-fg-2">$ </span>
                  git clone {REPO_URL}
                  {"\n"}
                  <span className="text-fg-2">$ </span>
                  cd foundry
                  {"\n"}
                  <span className="text-fg-2">$ </span>
                  make install
                </code>
              </pre>
            </div>
            <dl className="mt-4 divide-y divide-ledger border-t border-ledger">
              {DETAIL.map((item) => (
                <div key={item.k} className="grid gap-1 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="label pt-0.5">
                    {item.k}
                  </dt>
                  <dd className="max-w-measure text-[0.96875rem] leading-relaxed text-fg-2">
                    {item.d}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </details>

        <div className="meta mt-6 flex flex-wrap items-center gap-x-6">
          <span className="text-fg">v{suiteVersion()} · pre-1.0</span>
          {[
            [REPO_LICENSE_URL, "MIT license"],
            [REPO_URL, "Source"],
            [REPO_ISSUES_URL, "Report an issue"],
            [REPO_CONTRIBUTING_URL, "Contributing"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center text-fg underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              {label}
            </a>
          ))}
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
    <div className="home-hero-install">
      <CommandField command={NPX_CMD} surface="hero" />
      <div className="home-hero-links">
        <Link href="/skills" className="tl">
          See the skills
        </Link>
        <StarButton stars={stars} />
      </div>
    </div>
  );
}
