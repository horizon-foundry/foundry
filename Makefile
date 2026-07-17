# Foundry repo tasks

SKILLS_DIR := $(CURDIR)/skills
CLAUDE_SKILLS := $(HOME)/.claude/skills

.PHONY: install uninstall validate sync-schema

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

# Installs ship only the skill directory, so production-audit carries a bundled
# copy of the schema. The canonical file is schema/audit-report.schema.json;
# this target re-copies it into the skill after any schema change.
sync-schema:
	cp schema/audit-report.schema.json skills/production-audit/audit-report.schema.json
	@echo "Synced schema into skills/production-audit/."

# Validate the schema example and any published reports against the contract.
# Also fails if the bundled skill copy of the schema has diverged from the
# canonical one (a fork here would split the report contract between the
# installed skill and the site renderer), and enforces the cross-field report
# invariants JSON Schema cannot express (the verification rule, scope honesty,
# stats accuracy, no em dashes, no personal paths).
validate:
	@cmp -s schema/audit-report.schema.json skills/production-audit/audit-report.schema.json || { \
		echo "ERROR: skills/production-audit/audit-report.schema.json is out of sync with schema/audit-report.schema.json. Run 'make sync-schema'."; exit 1; }
	npx --yes ajv-cli validate --spec=draft2020 -s schema/audit-report.schema.json -d "schema/examples/sample-report.json"
	node scripts/validate-report-invariants.mjs schema/examples/sample-report.json
	@if ls reports/*.json >/dev/null 2>&1; then \
		npx --yes ajv-cli validate --spec=draft2020 -s schema/audit-report.schema.json -d "reports/*.json"; \
		node scripts/validate-report-invariants.mjs reports/*.json; \
	else \
		echo "No reports/*.json yet; skipped."; \
	fi
