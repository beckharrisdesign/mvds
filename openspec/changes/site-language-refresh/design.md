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

Header chrome (wordmark, theme toggle, Figma / GitHub / Storybook routes) over the hero: badges → headline → supporting copy → **elements row** → **expressions row**. The founder's model (03.0 iteration): the checklist names the six *elements* of MVDS (what the system is — Principles, Token layer, Component library, Figma library, Openspec schemas, Skills, matching the sections her parallel session is expanding below the fold), and the buttons beneath name its *expressions* (where it shows up — Starter app, Storybook, Figma, GitHub, npm), with "keep reading" as the first expression, buttonless because the page itself is that expression. The old action-CTA row ("Browse the system" …) is gone.

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/buIM7pFiGK07xzSkWNjcQw (HF MVDS Site — scratch/HF, not Core) |
| As-is page / frame    | `0.0 As is` — `Landing 1024 — Light` / `Landing 1024 — Dark` (from discovery) |
| Proposed page / frame | `04.0 Propose: site-language-refresh update` — `Landing 1024 — Light` / `Landing 1024 — Dark` (current iteration: same content as 03.0, rebuilt on the **published** post-sync Core instances — expressions buttons 32px primary, badges 8px pad; dark = Tokens mode flip). Prior iterations kept: `01.0` (initial), `02.0` (founder wording + six elements), `03.0` (expressions row, pre-sync instances) |
| Libraries / version   | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`) Tokens + `Type/*` text styles imported by key; **Button/Badge on the 03.0 frames are Core component instances** (founder attached the Core asset library 2026-09-02). Core components synced 2026-07-29 from 8f791b1 — trails main by design; see parity review |
| Breakpoints           | L · 1024px in Figma; S · 480px verified on the coded surface at apply (wrapping guards are code-level: nowrap spans + `text-balance`) |
| Status                | iterating (03.0 + 03.5 complete) — ready for founder review |

Mapping to code: `src/components/site/site-hero.tsx` (already drafted on this branch) + `src/App.tsx` header labels (new work for tasks). Semantic ramp only (`text-display`, `text-body-lg`, `text-small`, `text-caption`); spacing on the 8-grid via Stack/Inline gaps; checklist glyph in `text-success`.

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| F3 (+F2) one concept, one name | **Fully resolved by the 03.0 iteration:** every route is destination-titled, identically in header and expressions row ("Storybook" is "Storybook" everywhere; no "gallery", no "Browse"). The hero/header overlap is now deliberate parallelism — persistent chrome vs the in-flow expressions index. F2's dead-end is dev-env-only (deployed `/storybook/`) — unchanged. |
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

## Eval Delta (3.5 — against the 03.0 elements/expressions iteration)

> Blind re-run of the same rubric against the `03.0` frames after the founder's
> two iterations (02.0 wording + six elements; 03.0 expressions row). Same
> medium limits as 1.5. `no-runts`: **pass** — headline break confirmed
> deliberate, paragraph last line near full width. Baseline F dispositions
> unchanged from 1.5.

| # | Finding | Severity | Disposition |
| --- | --- | --- | --- |
| Q1 | Dark frame's toggle reads "Dark mode" — state-blind | red | **Mockup artifact** (as P1): the coded toggle relabels "Light mode" in dark; no code change |
| Q2 | Toggle styled identically to nav pills | amber | Pre-existing (was P2), unchanged here; recorded for the founder |
| Q3 | Same three destinations in shuffled order: header "Figma · GitHub · Storybook" vs expressions "Storybook · Figma · GitHub" | low | **Addressed:** header reordered to Storybook · Figma · GitHub — the founder's expressions order — on the amended 03.0 frames; `App.tsx` follows at apply |
| Q4 | Five equal-weight pills, no primary CTA | amber | **Resolved by founder direction (2026-09-02): all five expressions buttons are primary** ("make the buttons primary - they feel lightweight right now"). 03.0 frames amended to Core `Button variant=default`; code follows at apply |
| Q5 | "human and agentic founders" / "Openspec schemas" / "Skills" read as insider vocabulary | amber | **Deliberately preserved:** founder-canonical voice, and the six elements intentionally name what the page itself expands below the fold — the expansion is the in-context definition |
| Q6 | ✓ glyphs half-read as status results | low | Founder-directed treatment (was P3); preserved, still flagged |

**Figma `03.5 Eval Delta` page:** frames `Delta — Landing 1024 — Light` / `— Dark` with Q-pins + disposition board (annotation layer; this markdown canonical).

## Decisions

0. **Elements / expressions model (founder, 03.0).** The checklist names what MVDS *is* (six elements, mirroring the page's below-the-fold sections); the button row names where MVDS *shows up* (five expressions, destination-titled, matching the header). "Keep reading" is the first expression and gets no button — the page is it. All five expression buttons are **primary** (founder redline 2026-09-02, superseding the earlier equal-weight-outline call); the checklist's accessible label becomes "The elements of MVDS".

### Core library parity review (founder ask, 2026-09-02)

With the Core asset library attached to the HF file, the 03.0 frames' Button/Badge lookalikes were replaced with real Core instances (header: `variant=outline, size=sm`; expressions: `variant=default, size=default`; badges: `variant=success` / `variant=outline`) and measured against the code's tuned metrics:

| Element | Code (`src/components/ui/`) | Core instance | Parity |
| --- | --- | --- | --- |
| Button `size=sm` height / pad | 24px (`h-6`) / 8px (`px-2`) | 24px / 8px | ✓ |
| Button `size=default` height / pad | **32px** (`h-8`) / 16px (`px-4`) | **29px** / 16px | ✗ height — Core hugs to 29 instead of fixed 32 |
| Badge padding | **8px** (`px-2`) | **16px** | ✗ |
| Color/type bindings | tokens + semantic ramp | Tokens variables + `Type/*` styles | ✓ |

The gaps are in the Core **components**, not the frames: the component library was last synced 2026-07-29 from `8f791b1` (33 commits behind — the designed trailing state), predating the v0.4.0-era tuning. Fix is the founder-requested component sync (`mvds-figma-component-sync`), not hand-editing Core. The frames use the instances as published — true to what the library currently ships.

**Sync performed on founder ask (2026-09-02, `mvds-figma-component-sync`, code @ main `c84e494`):** Button — heights bound to `space-24/32/40` across all sm/default/lg variants (were unbound, hugging 25/29/37), vertical padding zeroed, `sm` paddingX rebound `space-16` → `space-8`; Badge — paddingX rebound to `space-8`, paddingY 2; tint paints on both sets normalized to the conventions rule (paint opacity removed; alpha rides the `-tint` variable values). No variants added/renamed/removed; every node id preserved, so `figma/figma.lock.json` required no change. Validated on instances in both modes (24/32/40 exact; single-alpha tints). Sync Report frame `Sync Report — 2026-09-02` inserted newest-first in the Sync Reports container. **Publish is the founder's merge gate — the HF file sees only the published library (verified: re-import still returns the 29px button), so the 04.0 iteration on true components lands after her Publish click.** Published 2026-09-02; `04.0` rebuilt on the live library and re-measured: Button default 32px / sm 24px, Badge 21px h / 8px pad — **parity ✓ across the board**. 04.0 is a metrics-only iteration (content identical to 03.0), so the 3.5 delta's content dispositions carry over unchanged.
2. **Checklist proof line.** Five ✓ items with real list semantics (`role="list"`/`listitem`) — founder direction ("styled like a checklist or some visually more strong presentation"). Check glyphs in `text-success`.
3. **Link rule applied to chrome, not to the CTAs' voice.** Header buttons are destination titles without icons. The hero CTAs are founder-canonical action labels — the rule's "button format" half; they carry no icons either.
4. **Runt guards live in code.** `whitespace-nowrap` spans on "that doesn’t drift." / "and stays that way." and `text-balance`/`text-pretty` where they help — the no-runts fix line's sanctioned tools.

## Risks / Trade-offs

- **Hero/header duplication is now deliberate:** Storybook / Figma / GitHub appear in both the header and the expressions row, identically named. Accepted as parallelism (chrome vs index); if founder review reads it as redundant, the fallback is thinning the header on the landing page.
- **The starter-app scenario in specs** still says buttons per the 03.0 set; the story and README must move with it at apply (six elements, five expressions).
- **Figma pair is 1024-only:** 480 behavior is asserted by code guards + apply-gate verification, not a mockup frame. Consistent with "the story is the eval target; the pages are the visual record."
