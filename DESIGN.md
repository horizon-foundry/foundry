---
name: Foundry
colors:
  ink: '#14191F'
  ink-raised: '#1E2530'
  ink-raised-2: '#283340'
  line: '#334455'
  line-strong: '#45566A'
  bone: '#E8ECF0'
  bone-dim: '#A2ABB8'
  bone-faint: '#8B94A4'
  signal: '#FFFFFF'
  brand-slate: '#334455'
  command: '#D99A2E'
  critical: '#FF5C5C'
  high: '#FF9F45'
  medium: '#F5CE4B'
  low: '#5AB0E6'
  informational: '#8B93A0'
  verdict-safe: '#3FCB7A'
  verdict-risk: '#F5CE4B'
  verdict-noship: '#FF5C5C'
typography:
  display:
    fontFamily: 'Inter'
    fontWeight: '600'
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'IBM Plex Sans'
  mono:
    fontFamily: 'IBM Plex Mono'
  serif:
    fontFamily: 'IBM Plex Serif'
spacing:
  unit: '4px'
  gutter: '24px'
  container-max: '1180px'
---

## Brand & Style

Foundry is Horizon Foundry's suite, and the site wears the Horizon Foundry identity: a dark blue-gray steel ground, the angular Horizon Foundry mark, and a monochrome palette. The register is a working foundry, industrial and precise, software forged with craft rather than announced with hype.

Two layers share one screen. The **brand layer** (chrome, the suite pages, the mark and wordmark) is steel and white in a geometric sans. The **instrument layer** (the audit reports and other technical surfaces) keeps a monospace, ledger character and the severity palette. The instrument is the tool; the brand is the foundry it was made in.

The organizing color rule holds throughout: the brand is monochrome, so color means a severity or a verdict, nothing else. A screen is steel and bone until a finding or a verdict speaks; emphasis in the brand layer reads by luminance (bright white on steel), not by hue.

## Wordmark and mark

The **mark** is the Horizon Foundry symbol: an angular geometric mark (inlined from the brand SVG). It is monochrome and takes the surrounding text color, so it reads bone on the dark ground and slate on light. Minimum height 20px, clear space equal to the mark's cap height.

The **wordmark** pairs the mark with "Foundry" (the suite) in Inter, or "Horizon Foundry" (the parent brand) in the fuller lockup. Set the wordmark only in Inter, never the mono or serif.

## Colors

Steel is the ground: a dark blue-gray anchored on the Brand Slate `#334455` (which doubles as the hairline). It layers `ink` -> `ink-raised` -> `ink-raised-2`. Text is `bone`, `bone-dim`, `bone-faint` (`bone-faint` was brightened from `#6C7684` to `#8B94A4` so small metadata clears WCAG AA 4.5:1 on the steel grounds; the hairline tokens `line`/`line-strong` are RULES, never text). The brand layer is monochrome: emphasis is pure white `#FFFFFF` (`signal`) against the steel ground and bone body text, an accent of luminance rather than hue.

One functional accent breaks the monochrome: **amber `#D99A2E`, the forge glow**, the forge. It appears as a faint ambient glow behind the hero (the heat of the foundry), on the commands you fire (`/production-audit`, `make install`, install and invocation tokens), and as the heading token of a directory tile on `/skills` (codified 2026-07-13). On the skills directory, amber marks the actionable heading of each entry-point tile, so it reads as one consistent set; this includes the non-command "Your reports" tile that shares the grid. Outside that directory grid, amber stays strictly the command signal. It is distinct from the brand (monochrome) and from the severity and verdict hues (which live only in the reports).

The severity ramp (critical red, high orange, medium amber-yellow, low steel-blue, informational gray) and the three verdict colors (green safe, amber-yellow risk, red no-ship) belong to the instrument layer and mean exactly severity and verdict. Because the brand layer carries no hue, any saturated color a reader sees is unambiguously a severity or a verdict.

**The report-excerpt exception (codified 2026-07-13).** A marketing surface may carry severity or verdict hues ONLY inside an element framed as a report excerpt: the hero terminal's simulated output, the worked-example report specimen (a real excerpt of the published example, rendered by the report components), the flagship's three-verdict list, and the install block's mini-verdict. The frame is what licenses the color; a severity hue on plain marketing chrome (a label, a badge, a heading) is still a violation. Labels like "recommended" are emphasis, not commands or verdicts: they read in `signal` white, never amber, never a severity hue.

## Typography

**Inter** carries the brand: the wordmark and display headings. **IBM Plex Sans** is the body and UI voice. **IBM Plex Mono** is the instrument voice: verdicts, finding IDs, severities, code, and all technical metadata. **IBM Plex Serif** sets long-form rendered documentation. Geometric sans for the foundry, monospace for the instrument.

## Layout & Spacing

A strict 4px unit. Generous negative space around dense, high-signal content. Hairline rules (Brand Slate) divide sections instead of stacked cards. Content max width 1180px; long-form prose narrows to ~68ch. Left-aligned and ledger-like.

## Elevation & Depth

Depth comes from tonal steel layering and hairlines, never drop shadows. A focused element gains a `line-strong` border or a 1px white edge, not a glow. A faint film grain over the ground gives the screen the texture of milled stock.

## Shapes

Sharp. Corner radius 2-4px, effectively square, matching the mark's cut letterforms. Severity chips and the verdict stamp are rectangular with a hairline border and a colored rule or fill.

## Components

- **Wordmark / mark**: the Horizon Foundry symbol plus the Foundry wordmark; monochrome.
- **Severity chip**: uppercase mono label, hairline border, a 2px left rule in the severity color.
- **Verdict stamp**: a bordered block with corner registration ticks in the verdict color; level in mono uppercase.
- **Nav tabs**: mono, active tab underlined in bone, not a filled pill (action is not selection).
- **Doc prose**: IBM Plex Serif, bone on steel, narrow measure, hairline rules under headings.

## The report reads like a triage tool, not a document (codified 2026-07-16)

The audit report is read by a detail-oriented but time-poor senior or principal engineer, or a product lead. They do not read it top to bottom; they triage. So the report is comprehensive but never a wall of text: the default view is the decision and the shape, and all depth is one click away and precise when opened.

- **The first screen is the whole call.** The verdict stamp carries the punch: the amber verdict, then the one-line posture as a bright, bold summary inside the stamp (it is the headline, so it is the punchiest text on the block, never subdued). The justification is quieter supporting detail below the stamp; the findings that drive the verdict are named and linked right under it, not left as bare IDs. Then one scorecard: the severity mix, the count of risks versus improvements, the gate statuses, and what was not assessed. A reader who reads nothing else has the decision and the triage. The stamp is a compact block sized to its content, never a full-width bar with a dead half.
- **Progressive disclosure below, risks before improvements.** Findings split into two groups: **risks to weigh** (a path to harm, what the verdict rests on) then **improvements** (safe today, robustness over time, which never cap the verdict), each a severity-sorted index of collapsed rows (one-line issue plus location) with the low and informational bulk folded into one disclosure. A report with no risks says so plainly ("no risks surfaced"), so a healthy app reads as healthy with a punch list, not as a wall of problems. Strengths lead as scannable green headlines, the note one click away. Process detail (remediation, not-assessed, mechanical sweeps) sits at the tail, compact.
- **No repetition, no filler.** Identical per-item cards collapse to one line. If a section repeats the same sentence, it is one sentence.
- **Gate and finding notes surface only when they move the decision.** A met gate is a chip; an at-risk or not-met gate shows its reason.

## Anti-goals

- No drop shadows, glows, rounded-pill buttons, or gradient meshes.
- No color that does not mean a severity or a verdict. The brand layer is monochrome.
- No hype or marketing warmth; this is a foundry, not a SaaS splash.
- Never set the identity in anything but Inter and the Horizon Foundry mark.
- No em dashes in any copy.
