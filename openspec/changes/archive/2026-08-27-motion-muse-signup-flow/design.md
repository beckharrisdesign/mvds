# motion-muse-signup-flow — design

## Context

The as-is page converts through seven `mailto:` links — the 0.5 eval's one red
finding (F1) and the cluster of near-misses around it (F2–F5, F12). `Input`,
`Label`, and `RadioGroup` shipped in MVDS 0.4.0, so the flow can be composed
entirely from published DS surface. The proposal below was generated with the
**approved 0.6 Eval Summary** in context.

## Goals / Non-Goals

**Goals:**

- An on-page signup flow reachable from every current contact entry point,
  carrying the clicked offer, with honest filling / invalid / sending /
  success / send-failed states.
- A visible plain-text email address as the always-works fallback (and as the
  recovery path in the send-failed state).
- CTA verbs that promise exactly what the flow delivers.
- Availability claims that can visibly go stale (dated, single-sourced).

**Non-Goals:**

- No backend: submission POSTs to a configurable endpoint
  (`VITE_SIGNUP_ENDPOINT`); the page stays static.
- No new MVDS components — verified: `Input` already carries the full
  `aria-invalid` destructive treatment in both modes ([input.tsx:7](../../../src/components/ui/input.tsx));
  `Label` / `RadioGroup` exist. **DS-side code scope of this change: zero.**
- Deferred findings (F6–F11) stay deferred — logged for the motion-muse
  backlog, not absorbed here.

## User flow / IA

1. **Entry:** all seven former `mailto:` links become in-page links to the new
   `#signup` section; each sets the offer pre-selection before scrolling —
   hero + closing "Request a discovery call" → *Discovery call*; "Request a
   spot" → *Morning Momentum*; "Apply for 1:1" → *The Maker's Body*; "Ask
   about dates" → *Studio Reset*; footer "Contact" → form with default
   selection.
2. **Form** (replaces the closing CTA band; same muted-band treatment): offer
   radio group ("What are you here for?", four options, clicked offer
   pre-selected), Name (`Input` lg), Email (`Input` lg, `type=email`),
   primary "Send my note", caption with the application deadline. Beside it:
   "Prefer email? hello@motionandmuse.studio" as selectable text.
3. **Validation:** on submit — name required, email required + format. Inline
   `text-small text-destructive` messages, `aria-invalid` + `aria-describedby`
   on the fields, focus moved to the first invalid field. Form never clears.
4. **Submission:** POST JSON to the configured endpoint; button disabled
   "Sending…" while in flight. **Success:** confirmation replaces the form —
   names the chosen offer and the reply window, repeats the dated deadline.
   **Failure:** destructive-tinted error box above the fields with the email
   address as the constructive next step; input values preserved.
5. **Stale-able availability:** the hero badge becomes "Autumn cohort —
   applications close Sep 26"; the date lives in one code constant shared by
   badge, form caption, and confirmation.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | <https://www.figma.com/design/2sC7O98JUXh9KczI9ZPdH9> — "HF Motion & Muse" (scratch/HF; MVDS Core `C20nU0mROzk3Zr0I9BELJF` referenced by variable key) |
| As-is page / frame | `0.0 As is` — `L 1024 / light` · `L 1024 / dark` · `S 480 / light` · `S 480 / dark` (from discovery) |
| Proposed page / frame | **`03.0 Propose: motion-muse-signup-flow update`** (current iteration — founder-chosen number, `02.0` deliberately skipped) — `… / v3` frames: `L 1024` + `S 480` × light/dark, plus `Form states / light+dark / v3`. Prior iteration `01.0 Propose: motion-muse-signup-flow` retained untouched per convention. |
| Libraries / version | MVDS Core Tokens/Scales by key; components per `@beckharrisdesign/mvds@0.4.0`. Brand colors + radii hand-mirrored from motion-muse `styles.css` (flagged reference, per the file's established exception). Destructive + tint bound to Core (resolves per mode). |
| Breakpoints | S · 480px / L · 1024px (BHD Content Types) |
| Status | draft — pending founder review at this checkpoint |

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| 1. Kill the mailto dead end (F1) | Signup section on-page; all seven entry points route there; plain-text `hello@motionandmuse.studio` rendered beside the form and repeated in the send-failed state. `mailto:` count on the page: 7 → 0 (the visible address remains a link but the address is now readable/copyable text). |
| 2. Carry the offer through (F3+F4) | Every CTA sets the radio pre-selection; all seven entry points behave identically; the submission payload and the success message carry the offer. |
| 3. Honest verbs (F2+F12) | "Book a discovery call" → "Request a discovery call"; "See next dates" → "Ask about dates"; "Join the next cohort" → "Request a spot"; "Apply for 1:1" unchanged (the form genuinely starts an application). |
| 4. Stale-able availability (F5) | Badge, form caption, and confirmation share one dated constant — "applications close Sep 26" — which visibly expires. |

**Don't-breaks touched:** the closing CTA band is *replaced* by the signup
section — its anchor role and muted-band rhythm are preserved; "Explore the
programs" untouched; zero-backend simplicity kept (endpoint is config, not
infrastructure); every new state pairs destructive/foreground on tints already
verified AA in both modes at the token level.

## Eval Delta (1.5)

> Same rubric, same isolation rules as 0.5, run against the `01.0 Propose`
> frames by a separate subagent (frames + rubric + bare baseline findings —
> no design rationale). Informational, never blocking.

| 0.5 finding | Disposition | Note |
| --- | --- | --- |
| F1 (critical) | **addressed** | Primary path is the on-page form; email rendered as visible text beside it and repeated verbatim in the Send-failed banner as the fallback path. |
| F2 (major) | **addressed** | "Ask about dates" honestly promises asking, not seeing; the form + two-working-day reply copy make the ask a real, answerable path. (Dates on the page itself remain F10's issue.) |
| F3 | **addressed (pending implementation)** | The "What are you here for?" radio enumerates all four intents at send time; per-CTA pre-selection is runtime behavior the frames can't demonstrate. |
| F4 | **addressed (pending implementation)** | Program CTAs are uniform in style with distinct honest labels; all conversion paths converge on the single form. |
| F5 | **addressed** | Dated claim everywhere — badge "applications close Sep 26" + form microcopy — concrete and self-expiring. |
| F6 | deliberately preserved | Toggle still labels only the target mode — deferred per 0.6. |
| F7 | not assessable from frames | Persistence is runtime behavior; deferred per 0.6. |
| F8 | deliberately preserved | Fixed 64px single-row chrome geometry unchanged (~428px min content width) — deferred per 0.6. |
| F9 | deliberately preserved | Header targets still 24px at 4px gaps — deferred per 0.6. |
| F10 | deliberately preserved | Program cards content-identical; partially mitigated in spirit by the form as an ask-channel with a stated reply SLA. |
| F11 | deliberately preserved | About monogram unchanged — deferred per 0.6. |
| F12 | **addressed** | "Request a discovery call" matches the actual mechanism. |

**New findings on the proposed surface:**

| # | Violation | Rubric item | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| N1 | The form's copy is built around a note the form cannot carry ("Tell Mara what you're after", "Send my note", "Your note … is in") — but the card holds only radio + Name + Email; no message field in any of the ten state cards. | match-system-and-real-world | Users who clicked "Ask about dates" or have specifics have nowhere to say them; the send action promises content the user never wrote, forcing a second email round-trip anyway. | major |
| N2 | "Discovery call" is pre-selected in every frame and state, so the intent field can never be caught empty; nothing demonstrates program CTAs pre-selecting their own option. | error-prevention | Skimmers submit "Discovery call" regardless of actual intent — silent wrong data validation can never flag. | minor |
| N3 | Success headline "You're on Mara's list." frames a one-off inquiry as list membership. | match-system-and-real-world | Reads as a newsletter opt-in the user didn't request; the accurate status is the second line, which the headline undercuts. | minor |
| N4 | The radio rows are 21px tall at 29px pitch — below the 24px touch minimum, on the mobile frame's primary conversion control. | error-prevention | Mis-taps between adjacent intent options, compounding N2's silent wrong-intent submissions. | minor |

**Founder-flagged at this checkpoint (new rubric item):** the propose
headline breaks as "Train the body. Feed / the muse." — a **runt** ("Feed"
stranded after the period). The founder added `no-runts` to the principles
manifest with an `evalLens` (2026-08-26), so it joins the rubric from the
next eval on — the live exercise of `adding-eval-gate` outcome 1.9. Queued
for the `02.0` iteration: a deliberate break ("Train the body." /
"Feed the muse.") and `text-wrap: balance`-style wrapping as the systemic
guard.

**Per-rubric movement (0.5 → 1.5):** error-recovery **red → green**;
recognition-rather-than-recall yellow → **green**;
flexibility-and-efficiency-of-use green (held); the remaining seven hold at
yellow — their residue is the deferred cluster (F6–F11) plus the new N1/N3
(match) and N2/N4 (error-prevention).

**Figma `01.5 Eval Delta` page:** <https://www.figma.com/design/2sC7O98JUXh9KczI9ZPdH9>
— page `01.5 Eval Delta` (after `01.0`): pinned duplicates `L 1024 / delta` +
`Form states / delta` (bindings intact; disposition-colored pins, N-pins on
the state cards) and boards `Delta ledger` · `New findings` ·
`Per-rubric delta`. Annotation layer; this markdown stays canonical.

### Iteration `03.0` (2026-08-26) — delta re-run, eleven-item rubric

The founder-directed iteration (page number `03.0`, founder's explicit
choice). Fixes: hero headline hard-broken "Train the body." / "Feed the
muse."; optional "Anything else?" textarea in every state (N1); no default
intent + required-choice error "Pick what you're here for — it routes your
note." (N2); success copy "Your note is in." (N3); 24px radio rows (N4).
The delta re-ran blind against the `03.0` frames under the extended rubric —
**the first eval to apply the founder-added `no-runts` record, exercising
`adding-eval-gate` outcome 1.9.**

| Finding | Disposition | Note |
| --- | --- | --- |
| F1 · F2 · F5 · F12 | **addressed** (held from 01.0) | form primary + visible email; honest verbs; dated claim |
| F3 · F4 | **addressed (pending implementation)** | CTA→radio pre-fill and uniform behavior are runtime; success copy echoes the intent |
| F6 · F8 · F9 · F10 · F11 | deliberately preserved | deferred cluster, geometry byte-identical to 01.0 |
| F7 | not assessable from frames | runtime persistence |
| N1 | **addressed** | textarea in all 12 field-bearing cards — the note copy is backed by a note |
| N2 | **addressed** | all radios unselected; missing choice is caught, not silently defaulted |
| N3 | **addressed** | factual success framing, offer echoed in body |
| N4 | **addressed** | radio rows 24px, pitch 32 |

**New findings (P-series, all `no-runts`, all minor):**

| # | Violation | Predicted consequence | Severity |
| --- | --- | --- | --- |
| P1 | Move card body at 1024 ends with the single word "guilt." stranded on its own line. | A one-word terminal line in the first pillar card reads as a typesetting mistake and unbalances the three-card row. | minor |
| P2 | Three short-phrase terminal lines: blockquote at 480 ("you're lifting."), About ¶2 at 1024 ("up for it."), Send-failed banner ("same place."). | Ragged, unfinished read at the trust moment, the bio, and the error state. | minor |

**Per-rubric movement (01.0 → 03.0):** match-system-and-real-world yellow →
**green** (every promise now has a mechanism); recognition, flexibility, and
error-recovery hold green; `no-runts` enters at yellow (headings clean, four
body-copy runts remain); the deferred-cluster yellows hold.

**P1/P2 disposition plan:** fixed at apply, not another Figma pass — body-copy
terminal wraps are rendering-engine-dependent (Figma's wrap ≠ browser's), so
the honest fix is `text-wrap: pretty` on body/blockquote copy plus a copy
check in the real browser at both widths, verified against `no-runts` in the
apply gate.

**Figma `03.5 Eval Delta` page:** same file, after `03.0` — pinned duplicates
(`L 1024 / delta v3`, `Form states / delta v3`) + disposition ledger / new
findings / eleven-row per-rubric boards.

## Decisions

- **Radio group over select** for the offer: all four options visible
  (recognition-rather-than-recall), only four exist, and it removes a
  dropdown interaction on mobile.
- **Replace the closing band** rather than add an eighth section: the band's
  job (last-chance conversion) is exactly the form's job; adding both would
  fail aesthetic-and-minimalist-design.
- **Endpoint: experiment-hub's shared landing-submission path** (settled
  post-apply, 2026-08-27, on founder direction "the default for experiment
  hub"): the form POSTs to `labs.beckharrisdesign.com/api/landing-submission`
  → the hub's `experiment_submissions` table, offer in `metadata`. No new
  service, no client secret. `VITE_SIGNUP_ENDPOINT` is a dev/test override
  only; the send-failed state remains the honest degradation path.
- **Form never clears on error**; success replaces the form rather than
  toasting — no toast primitive exists in MVDS, and none is needed (deliberate
  non-expansion of DS surface, per proposal's capability budget of zero).

## Risks / Trade-offs

- **Delivery still depends on an external endpoint** the founder must
  provision before the flow is "real"; until then the send-failed path is the
  honest state. Recorded as an apply task, not hidden.
- **Offer pre-selection via client-side state** (not URL params): shareability
  of a pre-selected form is lost — accepted; the offer field is visible and
  one tap to change.
- **The dated badge will go stale on Sep 26 by design** — that is the point
  (F5), but it creates a small maintenance duty logged in FINDINGS.md.
