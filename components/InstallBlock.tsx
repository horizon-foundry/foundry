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

// A text link with no count beside it. A small count undersells the suite
// (Craig, 2026-11-28), so the site shows none and makes no call to GitHub.
export function StarButton() {
  return (
    <a href={REPO_URL} target="_blank" rel="noreferrer" className="tl">
      Star on GitHub
    </a>
  );
}

// A command a reader types, or a path, inside running prose: the command style
// (DESIGN.md, Colors), so every command on the page reads the same.
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
        stamp at <Cmd>~/.claude/.foundry-version-checked</Cmd>.
      </>
    ),
  },
];

// `heading` replaces the default "Install Foundry" h2, so a page that titles
// the section itself (the homepage) keeps one heading on the #install anchor.
//
// Two columns from the split: the heading and the star link on the left, and
// on the right the instrument, top to bottom in the order a reader acts on it.
// The command in its Ink well behind the amber unit bar, the command to run
// next, the version-check disclosure, everything else folded, and the mono
// line of the release. The disclosure stays visible: it is part of the
// feature, not a footnote (instrumentation skill, "The gate demands a
// decision"). Styles: app/styles/home.css, "6. install".
export function InstallBlock({ heading }: { heading?: React.ReactNode } = {}) {
  return (
    <section id="install" className="install" data-ground="ink">
      <div className="wrap install-grid">
        <div className="install-head">
          {heading ?? <h2 className="d-h2">Install Foundry</h2>}
          <StarButton />
        </div>

        <div className="install-body">
          <CommandField command={NPX_CMD} surface="install-block" />
          <p className="install-next">
            Then open Claude Code in your project and run{" "}
            <span className="cmd">/production-audit</span>.
          </p>
          <p className="install-note">
            No account, no build step. At most once a day a skill asks this site
            for the current version, sending only its name and version.{" "}
            <span className="cmd">FOUNDRY_NO_VERSION_CHECK</span> turns it off.
          </p>

          <details className="install-more">
            <summary>
              From source, requirements, and what it installs
              <span aria-hidden="true" className="install-more-mark" />
            </summary>
            <div className="install-more-body">
              <p className="label">From source</p>
              <div className="cmd-field install-source">
                <pre className="cmd-field-line">
                  <code>
                    <span className="install-prompt">$ </span>
                    git clone {REPO_URL}
                    {"\n"}
                    <span className="install-prompt">$ </span>
                    cd foundry
                    {"\n"}
                    <span className="install-prompt">$ </span>
                    make install
                  </code>
                </pre>
                <CopyButton
                  joined
                  text={SOURCE_CMDS}
                  analytics={{ command_kind: "clone", surface: "install-block" }}
                />
              </div>
              <dl className="install-detail">
                {DETAIL.map((item) => (
                  <div key={item.k}>
                    <dt className="label">{item.k}</dt>
                    <dd>{item.d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>

          <div className="install-meta">
            <span className="meta">v{suiteVersion()} · pre-1.0</span>
            {[
              [REPO_LICENSE_URL, "MIT license"],
              [REPO_URL, "Source"],
              [REPO_ISSUES_URL, "Report an issue"],
              [REPO_CONTRIBUTING_URL, "Contributing"],
            ].map(([href, label]) => (
              <a key={href} href={href} target="_blank" rel="noreferrer">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// The install command where a visitor first lands, so installing never waits
// for the bottom of the page. Same command, same install_copied event; the
// surface property says it came from the hero.
export function HeroInstall() {
  return (
    <div className="home-hero-install">
      <CommandField command={NPX_CMD} surface="hero" />
      <div className="home-hero-links">
        <Link href="/skills" className="tl">
          See the skills
        </Link>
        <StarButton />
      </div>
    </div>
  );
}
