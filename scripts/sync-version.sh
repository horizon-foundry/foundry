#!/bin/sh
# Stamp the suite version from the repo-root VERSION file into every surface
# that carries it: each skill's SKILL.md frontmatter (`version:`), each
# skill's version-check URL (`&v=`), lib/site.ts VERSION, and SECURITY.md's
# supported-release line. VERSION is the single source of truth; run this
# after bumping it (the release roll-up commit). `make validate` fails on any
# drift, so a hand-edited copy cannot survive CI.
set -eu

cd "$(dirname "$0")/.."

# Whitespace-stripped read (kills CRLF); refuse an empty VERSION outright: an
# empty value would stamp blanks everywhere and then validate "" == "" green.
v=$(tr -d '[:space:]' < VERSION)
[ -n "$v" ] || { echo "ERROR: VERSION is empty; refusing to stamp." >&2; exit 1; }

for f in skills/*/SKILL.md; do
  # Frontmatter-only edits: operate strictly inside the first --- fence, so a
  # documentation example of `version:` or `name:` in a skill body is never
  # touched (a body example was once rewritten by an unanchored pass).
  if awk 'f==1 && /^---$/ {exit} NR==1 && /^---$/ {f=1; next} f==1 && /^version:/ {found=1} END {exit !found}' "$f"; then
    perl -pi -e 'BEGIN {$fm = 0} $fm++ if /^---$/; s/^version:.*/version: '"$v"'/ if $fm == 1' "$f"
  else
    perl -pi -e 'BEGIN {$fm = 0} $fm++ if /^---$/; s/^(name: .*)$/$1\nversion: '"$v"'/ if $fm == 1' "$f"
  fi
  # The version-check command carries the installed version as a query param;
  # keep it in lockstep. `*` not `+`: a blanked param must be repairable by
  # this script, or the validate error telling you to run it lies.
  perl -pi -e "s{(api/version\?skill=[a-z-]+&v=)[0-9A-Za-z.\-]*}{\${1}$v}g" "$f"
  grep -q '^version: '"$v"'$' "$f" || {
    echo "ERROR: failed to stamp $f (no name: line in frontmatter?)." >&2; exit 1; }
done

perl -pi -e "s/^export const VERSION = \".*\";/export const VERSION = \"$v\";/" lib/site.ts
perl -pi -e "s/early release \(v[0-9A-Za-z.\-]*\)/early release (v$v)/" SECURITY.md

echo "Stamped version $v into skills/*/SKILL.md, lib/site.ts, and SECURITY.md"
