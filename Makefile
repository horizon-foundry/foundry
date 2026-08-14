# Foundry repo tasks

SKILLS_DIR := $(CURDIR)/skills
CLAUDE_SKILLS := $(HOME)/.claude/skills

.PHONY: install uninstall validate sync-bundled

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

# First: every skill is visible on every public surface and every count claim
# matches (scripts/check-skill-surfaces.mjs). Then the schema example and any
# published reports against the contract.
# Also fails if any bundled skill copy has diverged from its canonical original
# (a fork in the schema would split the report contract between the installed
# skill and the site renderer; a fork in a template would hand adopters a
# different artifact shape than the repo documents), and enforces the
# cross-field report invariants JSON Schema cannot express (the verification
# rule, scope honesty, stats accuracy, no em dashes, no personal paths).
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
