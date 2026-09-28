# TODOS.md standard

Spec version 1. This is the single owner of what a project's `TODOS.md` looks like. The reference
implementation (parser, linter, move operations, preservation check) is `scripts/todos/`, and the
conformance checklist below maps one to one onto its linter rule ids, so a rule cannot exist in one and
not the other. `make validate` fails if they disagree.

`phase-plan` owns the `### Phase Plans` index semantics (dating, appending, checkbox meaning, terminal
entries). This spec only says where that index lives and which of its properties the linter checks.

## Why a standard

`TODOS.md` is read by a person deciding what is next, by an agent resuming cold, and by tools that
reorder it. Free-form files drift: sections named after phases, done work left unchecked in the middle
of open work, narrative and tasks interleaved. A tool cannot move an item safely in a file it cannot
parse, and an agent cannot find "what is next" in a file with no defined answer. The standard is small
on purpose: five sections, one item grammar, one place for narrative.

## Sections

A conforming file is one `# ` title, then exactly these `## ` sections in this order:

| Section | Holds | Prose | `###` |
|---|---|---|---|
| `## Master Plan` | The master plan pointer and the `### Phase Plans` index, owned by `phase-plan` | yes | yes |
| `## Now` | Units in flight, one `###` block each, at most 3 | yes, inside a unit | required, one per unit |
| `## Up Next` | The priority queue. Ordered; line 1 is top priority | no | no |
| `## Backlog` | Unordered pool of not-yet-prioritized items | no | groupings only |
| `## Done` | Closed units, one `###` block each, oldest first | yes, inside a block | required, one per block |

Narrative lives in exactly three places: the Master Plan section, inside a Now unit block, and inside a
Done block. Everything longer than a paragraph lives in a plan file that an item or block links. Up Next
and Backlog hold items and nothing else, because those are the two lists a tool reorders; prose between
items has no defined owner when one of them moves.

Names are exact and case-sensitive. A file may not carry any other `## ` section. Work that used to live
in a `## Phase 7 (Done)` style section belongs in `## Done` as a block.

## Items

```
- [ ] YYYY-MM-DD **[Tag]** Title -> plan-path
```

- The bullet marker is `-`; the checkbox is `[ ]` or `[x]` (lowercase). No numbered items, no `*`, no
  `+`, no `[X]`.
- The date is the absolute day the item was added and is required in Up Next and Backlog. Inside Now and
  Done blocks an item is a step of its unit and inherits the block's context, so its date is optional.
- Tags are zero or more `**[Name]**` runs after the date. The title is the text after the tags up to
  ` -> `. The plan link is optional: ` -> ` then a path, backticked or bare.
- No strikethrough (`~~`) and no emoji check marks. A finished item is `[x]` and lives in Done.
- **Continuation and children.** Every following line that is indented (or blank, when the next
  non-blank line is indented) belongs to the item and moves with it. A non-indented line directly under
  an item, with no blank between, is a lazy continuation: markdown reads it as part of the item but a
  span-based tool would strand it, so the linter rejects it in the two reorderable lists.
- Nested checkboxes are children of their parent, not items. They are never reordered on their own.

**Identity.** An item is addressed by section, date, and normalized title: tags and the plan link
removed, emphasis and backtick markers removed, whitespace collapsed, case folded. Identity must be
unique within a section. There are no hidden id comments; an item's text is its id. Guarded edits also
carry the hash of the file they were computed against (below).

## Done

A Done block heading is `### <unit> (YYYY-MM-DD)` or `### <unit> (YYYY-MM-DD, PR #n)`, where the date
is the day the unit closed. A small item finished outside any unit goes under a dated block for its
close day, whose heading is only the date: `### YYYY-MM-DD`. Blocks are ordered by date, oldest first,
so "the last unit complete" is always the last block. Every checkbox in Done is `[x]`.

## How an agent reads the file

1. Read `## Now`. Each unit there is in flight and links its plan; read the plan before acting.
2. With nothing in flight, read `## Up Next` top-down. The first item is the top priority; work it.
3. Never take work from Backlog without it being promoted to Up Next first.
4. The last `###` block in `## Done` is the last unit complete.

## Operations

Reordering is an edit to lines, never a rewrite of the file.

| Verb | Meaning |
|---|---|
| Top priority | Move an item to Up Next position 1 |
| Queue N | Move the selected items to the top of Up Next, in the chosen order |
| Reorder | Move an item to another position within Up Next |
| Promote or demote | Move an item between Backlog and Up Next |

A move removes the item's whole line span (the item line plus its continuation and children) and
inserts that span at the target position. No other line changes. Moves address items by identity and
carry the file hash they were computed against; a mismatch, a missing item, an ambiguous item, or an
invalid target is a typed conflict, never a guess. The parser is lossless: serializing a parse returns
the input byte for byte, for conforming and non-conforming files alike.

## Preservation

A rewrite that claims to preserve content (a migration onto this standard is the case) must pass
`preserve(before, after)`: every checkbox line in the original survives with the same normalized text
(date removed, plan link removed, everything else compared), a `[ ]` may become `[x]` only where the
item now sits in Done, and every plan-link path survives, both on its item and in the file. It reports
what is missing; it never repairs.

## Conformance checklist

Severity `error` fails the lint; `warn` is reported and does not. Rule ids are stable once published.

| Rule id | Severity | A conforming file |
|---|---|---|
| `file-crlf` | error | Uses LF line endings only |
| `file-final-newline` | error | Ends with exactly one newline |
| `line-trailing-space` | warn | Has no trailing whitespace on a non-blank line |
| `indent-tab` | warn | Indents with spaces, not tabs |
| `fence-unclosed` | error | Closes every code fence it opens |
| `title-h1` | error | Starts with a `# ` title before any `## ` |
| `preamble-content` | warn | Has nothing but blank lines between the title and the first section |
| `section-missing` | error | Has all five sections |
| `section-unknown` | error | Has no `## ` section outside the five |
| `section-duplicate` | error | Has each section once |
| `section-order` | error | Orders the sections Master Plan, Now, Up Next, Backlog, Done |
| `phase-plans-missing` | error | Has a `### Phase Plans` block under Master Plan |
| `phase-plans-undated` | warn | Dates each Phase Plans entry (new entries only; `phase-plan` owns the rule) |
| `phase-plans-order` | warn | Keeps dated Phase Plans entries chronological |
| `now-outside-unit` | error | Keeps all Now content inside a `###` unit block |
| `now-cap` | error | Has at most 3 units in Now |
| `now-unit-plan` | warn | Links a plan file from every Now unit |
| `upnext-heading` | error | Has no `###` heading in Up Next |
| `list-prose` | error | Has only items and blank lines in Up Next and Backlog |
| `list-lazy-continuation` | error | Has no lazy continuation line under an Up Next or Backlog item |
| `upnext-checked` | error | Has no `[x]` item in Up Next |
| `item-date` | error | Dates every Up Next and Backlog item |
| `item-duplicate` | error | Has unique item identity within Up Next and within Backlog |
| `item-marker` | error | Uses `-` bullets and lowercase `[x]` |
| `item-strikethrough` | error | Marks no item with `~~` |
| `item-emoji-check` | error | Marks no item with an emoji check |
| `done-outside-block` | error | Keeps all Done content inside a `###` block |
| `done-heading` | error | Formats each Done heading as specified above |
| `done-order` | error | Orders Done blocks oldest first |
| `done-open-item` | error | Has no `[ ]` item in Done |

## Legacy shapes and the rule that answers each

A file written before this standard is expected to fail. Each shape found in a survey of real files is
either allowed here or rejected by a named rule, so a migration has a finite worklist.

| Shape | Answer |
|---|---|
| Sections named after phases or features | `section-unknown` |
| A `Done`-ish section mid-file, or done work unchecked among open work | `section-unknown`, `section-order`; migrate into `## Done` |
| Undated items | `item-date` (Up Next, Backlog); allowed inside Now and Done blocks |
| Tags, plan links, several tags on one item | Allowed |
| Indented sub-bullets, nested checkboxes, multi-line items | Allowed; they are children and move with the item |
| Blockquotes, tables, prose paragraphs | Allowed in Master Plan, Now blocks, Done blocks; `list-prose` in Up Next and Backlog |
| Strikethrough, emoji check marks | `item-strikethrough`, `item-emoji-check` |
| `*` or `+` bullets, `[X]`, numbered items | `item-marker`; numbered items `list-prose` |
| Plain bullets with no checkbox in a list | `list-prose` |
| Open items inside a Done block | `done-open-item` |
| CRLF, tabs, missing final newline | `file-crlf`, `indent-tab`, `file-final-newline` |
| Em dashes in headings | Not a structure question; not checked here |
