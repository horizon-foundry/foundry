# Foundry repo tasks

SKILLS_DIR := $(CURDIR)/skills
CLAUDE_SKILLS := $(HOME)/.claude/skills

.PHONY: install uninstall validate sync-bundled sync-version

# Symlink every skill in skills/ into the user-global skills directory. The
# symlinks (not copies) keep the installed skills tracking git. Refuses to
# clobber a real directory that isn't already one of our symlinks.
install:
	@for dir in $(SKILLS_DIR)/*/; do \
		name=$$(basename "$$dir"); \
		target="$(CLAUDE_SKILLS)/$$name"; \
		if [ -e "$$target" ] && [ ! -L "$$target" ]; then \
			echo "ERROR: $$target exists and is not a symlink; refusing to replace it."; exit 1; \
		fi; \
		ln -sfn "$$dir" "$$target"; \
		echo "Installed: $$target -> $$dir"; \
	done

# Remove only the symlinks we created (those pointing back into this repo's
# skills/). Leaves any unrelated skill in ~/.claude/skills untouched.
uninstall:
	@for dir in $(SKILLS_DIR)/*/; do \
		name=$$(basename "$$dir"); \
		target="$(CLAUDE_SKILLS)/$$name"; \
		if [ -L "$$target" ]; then \
			link=$$(readlink "$$target"); \
			case "$$link" in "$(SKILLS_DIR)"/*) rm "$$target"; echo "Removed: $$target";; esac; \
		fi; \
	done

# Installs ship ONLY the skill's own directory (make install symlinks
# skills/<name>/), so anything a skill tells the agent to read must live inside
# it. Three files are therefore bundled copies of canonical originals, and this
# target re-copies all three after any change to one.
sync-bundled:
	cp schema/audit-report.schema.json skills/production-audit/audit-report.schema.json
	cp reference/templates/BRAND.md skills/brand-voice/BRAND.template.md
	cp reference/templates/plan.md skills/phase-plan/plan.template.md
	@echo "Synced bundled copies into skills/production-audit/, skills/brand-voice/, skills/phase-plan/."

# VERSION (repo root) is the suite version's single source of truth, bumped in
# the release roll-up commit. This stamps it into every surface that carries
# it; validate fails on drift, so the copies cannot diverge silently.
sync-version:
	sh scripts/sync-version.sh

# Runs in three parts. First, every skill is visible on every public surface and
# every count claim matches (scripts/check-skill-surfaces.mjs). Then the schema
# example and any published reports against the contract. Last, the version
# markers, so a stamped copy cannot drift from VERSION.
# Also fails if any bundled skill copy has diverged from its canonical original
# (a fork in the schema would split the report contract between the installed
# skill and the site renderer; a fork in a template would hand adopters a
# different artifact shape than the repo documents), enforces the cross-field
# report invariants JSON Schema cannot express (the verification rule, scope
# honesty, stats accuracy, no em dashes, no personal paths), and enforces the
# version marker: VERSION agrees with every SKILL.md frontmatter and check
# URL, lib/site.ts, and SECURITY.md, and SKILL_SLUGS matches skills/ exactly.
validate:
	node scripts/check-skill-surfaces.mjs
	@cmp -s schema/audit-report.schema.json skills/production-audit/audit-report.schema.json || { \
		echo "ERROR: skills/production-audit/audit-report.schema.json is out of sync with schema/audit-report.schema.json. Run 'make sync-bundled'."; exit 1; }
	@cmp -s reference/templates/BRAND.md skills/brand-voice/BRAND.template.md || { \
		echo "ERROR: skills/brand-voice/BRAND.template.md is out of sync with reference/templates/BRAND.md. Run 'make sync-bundled'."; exit 1; }
	@cmp -s reference/templates/plan.md skills/phase-plan/plan.template.md || { \
		echo "ERROR: skills/phase-plan/plan.template.md is out of sync with reference/templates/plan.md. Run 'make sync-bundled'."; exit 1; }
	npx --yes ajv-cli validate --spec=draft2020 -s schema/audit-report.schema.json -d "schema/examples/sample-report.json"
	node scripts/validate-report-invariants.mjs schema/examples/sample-report.json
	@if ls reports/*.json >/dev/null 2>&1; then \
		npx --yes ajv-cli validate --spec=draft2020 -s schema/audit-report.schema.json -d "reports/*.json"; \
		node scripts/validate-report-invariants.mjs reports/*.json; \
	else \
		echo "No reports/*.json yet; skipped."; \
	fi
	@v=$$(tr -d '[:space:]' < VERSION); ok=1; \
	[ -n "$$v" ] || { echo "ERROR: VERSION is empty."; exit 1; }; \
	for f in skills/*/SKILL.md; do \
		fv=$$(perl -ne 'if (/^version:\s*(\S+)/) { print $$1; exit }' "$$f"); \
		[ "$$fv" = "$$v" ] || { echo "ERROR: $$f frontmatter version ($$fv) != VERSION ($$v). Run 'make sync-version'."; ok=0; }; \
		uv=$$(perl -ne 'if (m{api/version\?skill=[a-z-]+&v=([0-9A-Za-z.\-]*)}) { print $$1; exit }' "$$f"); \
		[ "$$uv" = "$$v" ] || { echo "ERROR: $$f version-check URL carries v=$$uv, not $$v (a missing check section fails too). Run 'make sync-version', or add the standard Version check section."; ok=0; }; \
	done; \
	grep -q "early release (v$$v)" SECURITY.md || { echo "ERROR: SECURITY.md supported-versions line != VERSION ($$v). Run 'make sync-version'."; ok=0; }; \
	slugs=$$(perl -ne 'if (/SKILL_SLUGS/) { print "$$1\n" while /"([a-z-]+)"/g }' lib/site.ts | sort); \
	for d in $$(ls skills/); do echo "$$slugs" | grep -qx "$$d" || { echo "ERROR: skills/$$d missing from SKILL_SLUGS in lib/site.ts (its version checks would be dropped from capture)."; ok=0; }; done; \
	for s in $$slugs; do [ "$$s" = "SKILL_SLUGS" ] || [ -d "skills/$$s" ] || { echo "ERROR: SKILL_SLUGS entry '$$s' has no skills/ directory."; ok=0; }; done; \
	[ $$ok -eq 1 ] || exit 1; \
	echo "Version marker in sync at $$v."
