#!/bin/sh
# Stamp the suite version from the repo-root VERSION file into every surface
# that carries it: each skill's SKILL.md frontmatter (`version:`), each
# skill's version-check URL (`&v=`), and the site's lib/site.ts VERSION
# constant. VERSION is the single source of truth; run this after bumping it
# (the release roll-up commit). `make validate` fails on any drift, so a
# hand-edited copy cannot survive CI.
set -eu

cd "$(dirname "$0")/.."
v=$(cat VERSION)

for f in skills/*/SKILL.md; do
  if grep -q '^version:' "$f"; then
    perl -pi -e "s/^version:.*/version: $v/" "$f"
  else
    # Insert after the name: line, keeping name first in the frontmatter.
    perl -pi -e "s/^(name: .*)\$/\$1\nversion: $v/" "$f"
  fi
  # The version-check curl in the gate block carries the installed version as
  # a query param; keep it in lockstep with the frontmatter.
  perl -pi -e "s{(api/version\?skill=[a-z-]+&v=)[0-9A-Za-z.\-]+}{\${1}$v}g" "$f"
done

perl -pi -e "s/^export const VERSION = \".*\";/export const VERSION = \"$v\";/" lib/site.ts

echo "Stamped version $v into skills/*/SKILL.md and lib/site.ts"
