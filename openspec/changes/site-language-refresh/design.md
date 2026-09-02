# site-language-refresh — design

## Context

The founder's canonical framing (anchored in proposal.md) replaces the hero's earlier register. Scope is the hero section plus the header chrome its 0.6 issues touch; the principles section belongs to the parallel manifests session. The 01.0 proposal is conditioned on the approved 0.6 Eval Summary and the founder's link-presentation rule ("title of the page … with a button format, or a full url link. Don't put an icon in general").

## Goals / Non-Goals

**Goals:**

- Hero speaks the founder's copy verbatim: headline, supporting copy ("experiment"), five-item checklist proof line, three CTAs.
- No runts at 1280 or 480, both modes — deliberate breaks, not luck.
- Header chrome follows the link rule: destination-titled buttons, no ↗/→ glyphs.

**Non-Goals:**

- Principles section (parallel session), package docs, verification panel, dashboard.
- New tokens, components, or variants; Figma library sync.

## User flow / IA

Unchanged: header chrome (wordmark, theme toggle, Figma / GitHub / Storybook routes) over the hero (badges → headline → supporting copy → proof checklist → CTA row). The proof line's promotion from sentence to checklist is the one structural change — it becomes a `role="list"` of five checked items, ending on "Checks that can fail a build".

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/buIM7pFiGK07xzSkWNjcQw (HF MVDS Site — scratch/HF, not Core) |
| As-is page / frame    | `0.0 As is` — `Landing 1024 — Light` / `Landing 1024 — Dark` (from discovery) |
| Proposed page / frame | `01.0 Propose: site-language-refresh` — `Landing 1024 — Light` / `Landing 1024 — Dark` (header + hero; dark = Tokens mode flip) |
| Libraries / version   | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`) Tokens + `Type/*` text styles, imported by key; matches `@beckharrisdesign/mvds@0.4.0` |
| Breakpoints           | L · 1024px in Figma; S · 480px verified on the coded surface at apply (wrapping guards are code-level: nowrap spans + `text-balance`) |
| Status                | iterating — ready for founder review |

Mapping to code: `src/components/site/site-hero.tsx` (already drafted on this branch) + `src/App.tsx` header labels (new work for tasks). Semantic ramp only (`text-display`, `text-body-lg`, `text-small`, `text-caption`); spacing on the 8-grid via Stack/Inline gaps; checklist glyph in `text-success`.

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| F3 (+F2) one concept, one name | Header button retitles to the destination per the link rule: "Storybook" (arrow dropped). The hero CTA keeps the founder's canonical "Browse the system" — an action label in her voice. Two labels remain, but now one names the destination and one names the action, and neither is an unexplained hybrid; see Decisions for the residual trade-off. F2's dead-end is dev-env-only (deployed `/storybook/`) — unchanged. |
| F8 (hero rows) wrapping | Deliberate breaks encoded, not hoped for: headline holds "that doesn’t drift." unbreakable; supporting copy holds "and stays that way."; checklist items are atomic units that wrap between, never inside. Verified at 1280/480 both modes at the apply gates (the Figma pair is 1024-only). |
| F4 CTA verb honesty | Founder's canonical "Start with the starter app" replaces "Copy the starter app" — the verb no longer promises a copy action the link doesn't perform. |
| Founder link rule | Header: "GitHub ↗" → "GitHub", "Storybook →" → "Storybook"; no icon glyphs anywhere in the chrome. (Checklist ✓ marks are status glyphs on list items, not link icons — kept.) |
| Don't-breaks touched | Single h1 kept (headline). Token binding untouched — all new text on existing ramp + tokens, AA-verified by `check:contrast`/`npm test`. Version badge stays fed by `package.json`. |

## Eval Delta (1.5)

> Same rubric, isolated subagent, run blind against the `01.0 Propose` frames
> (static 1024 mockups, light + dark — interaction/viewport judgments limited
> by the medium; 480 wrapping is re-verified on the coded surface at apply).
> Informational, never blocking.

**Baseline dispositions (F1–F8):**

| 0.5 finding | Disposition | Note |
| --- | --- | --- |
| F1 (red, principles claim) | out of scope — handed off | Principles section is the parallel manifests session's; not on the 01.0 surface |
| F2 (red, localhost dead-end) | deliberately preserved | Dev-env-only (deployed serves `/storybook/`); header now at least names the destination |
| F3 (amber, two names) | partially addressed | Header retitled to the destination ("Storybook", no arrow) per the link rule; hero CTA stays founder-canonical "Browse the system". Residual action-vs-destination split accepted — see Risks |
| F4 (low, "Copy" copies nothing) | addressed | "Start with the starter app" — verb no longer promises an unperformed action |
| F5 (amber, anchor-less citations) | out of scope — handed off | Principles cards; manifests session |
| F6 (low, NN/g shorthand) | out of scope — handed off | Principles cards; manifests session |
| F7 (amber, desktop card runts) | out of scope — handed off | Principles cards; manifests session |
| F8 (amber, 480 runts) | addressed (hero rows) | Delta found **zero runts** on the proposal; headline breaks "An opinionated design system / that doesn’t drift." deliberately; card rows hand off with F7. 480 re-verified on code at apply |

**New findings from the blind delta (P1–P5):**

| # | Finding | Severity | Disposition here |
| --- | --- | --- | --- |
| P1 | Dark frame's toggle still reads "Dark mode" — state-blind label | amber | **Mockup artifact:** the coded surface relabels to "Light mode" when dark (0.5 eval verified this pass on the live page); the static clone simply wasn't relabeled. No code change needed |
| P2 | Mode toggle styled identically to the three navigation buttons — no behavior-class differentiation | amber | Pre-existing as-is condition, unchanged by this change. Recorded for the founder; a chrome-differentiation pass would be its own small change |
| P3 | ✓ glyphs read as live "passing checks" status beside "checks that can fail a build" | low | Founder-directed treatment (the checklist ask); the ✓ is deliberate rhetoric — the claims *are* backed by the page's gates section below the fold. Flagged for founder judgment |
| P4 | "Start … starter" verb/noun repetition | low | Founder-canonical copy — preserved verbatim |
| P5 | "Semantic type" / "Component manifests" read as internal terms | low | Founder-canonical copy — preserved verbatim; the proof line names the system's real vocabulary on purpose |

Per-rubric: 11/11 dispositioned by the blind run — `no-runts` **pass**, `aesthetic-and-minimalist-design` otherwise "spare and disciplined; every hero element earns its place". Medium limitation noted: static 1024 frames; interaction, contrast, and reflow are asserted by the apply gates instead.

**Figma `01.5 Eval Delta` page:** frames `Delta — Landing 1024 — Light` / `— Dark` with P-pins + disposition board (annotation layer; this markdown canonical).

## Decisions

1. **Founder copy is immutable input.** Headline, supporting copy, proof items, and CTA labels are hers verbatim; design work is presentation (breaks, checklist, chrome), never wording.
2. **Checklist proof line.** Five ✓ items with real list semantics (`role="list"`/`listitem`) — founder direction ("styled like a checklist or some visually more strong presentation"). Check glyphs in `text-success`.
3. **Link rule applied to chrome, not to the CTAs' voice.** Header buttons are destination titles without icons. The hero CTAs are founder-canonical action labels — the rule's "button format" half; they carry no icons either.
4. **Runt guards live in code.** `whitespace-nowrap` spans on "that doesn’t drift." / "and stays that way." and `text-balance`/`text-pretty` where they help — the no-runts fix line's sanctioned tools.

## Risks / Trade-offs

- **Residual F3:** "Browse the system" (hero) and "Storybook" (header) still name one destination two ways. Accepted for now: the founder's CTA label is canonical, and the header now at least names the real destination. If the delta or founder review reads it as still confusing, the fallback is dropping the header Storybook button on the landing page (the hero CTA two lines below covers the route).
- **Figma pair is 1024-only:** 480 behavior is asserted by code guards + apply-gate verification, not a mockup frame. Consistent with "the story is the eval target; the pages are the visual record."
