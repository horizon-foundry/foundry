// The one place that answers "what files does this repo carry", shared by both
// brand gates. It exists because the answer was written three times across two
// files and every copy had the same defect, which is the shape a duplicated
// derivation always takes: one fix has to land in three places and nothing
// catches a partial one.
//
// Two rules the copies got wrong:
//
//   1. `git ls-files` QUOTES any path with a non-ASCII byte, returning
//      `"app/probe-caf\303\251.md"` rather than the path. Passed to readFileSync
//      that resolves to nothing, and the copies swallowed the failure in a
//      `catch { continue }`, so a file with an accent in its name was silently
//      outside every sweep. `-z` returns raw NUL-separated paths instead.
//   2. Untracked files count. Every file starts untracked, so a listing that
//      reads only the index is blind to the file its author just wrote, and the
//      green run they see is the one that could not check it.
//
// Consolidating three copies into one removed a triplicated defect and created
// a single point of failure in its place: a two-word edit here (dropping
// `--others`) re-opens the untracked hole in BOTH gates at once, silently,
// which is worse than the bug it replaced. So the contract is asserted rather
// than trusted, on every call: git's own view of untracked files has to be a
// subset of what this returns.
import { execSync } from "node:child_process";

const git = (args, root) =>
  execSync(`git ${args}`, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);

export function repoFiles(root) {
  const files = git("ls-files -z --cached --others --exclude-standard", root);
  const listed = new Set(files);
  // `status --porcelain -z` emits "XY path" records; untracked ones are "?? ".
  const untracked = git("status --porcelain -z --untracked-files=all", root)
    .filter((r) => r.startsWith("?? "))
    .map((r) => r.slice(3));
  const dropped = untracked.filter((f) => !listed.has(f));
  if (dropped.length) {
    throw new Error(
      `repoFiles() is not listing untracked files (${dropped.slice(0, 5).join(", ")}). Both brand gates derive their scope from this function, so a narrowed listing makes both blind at once.`,
    );
  }
  return files;
}
