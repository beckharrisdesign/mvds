# harden-figma-coverage-gate — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | `Site/ElementsOfMvds` — **LiveSnapshot** ("the committed snapshot, exactly as the landing page ships it"). `Collapsed` / `Expanded` render fixture args and are not the eval target. |
| Figma `0.0 As is` page | **Not created — narrow-scope exception requested, pending founder call.** Figma access confirmed (pro seat, admin on Beck Harris Design), so this is a proportionality question, not a capability one. See *Figma gate* below. |
| Scope note | The `Figma library` card only: its tally (`components`, `declared variants`) and its `Components` list. This change alters no layout, type, color, spacing or component — the card's form is untouched and its numbers are generated from the manifests. |

### Figma gate

`rules/figma.mdc` holds the design gate as not skippable for any change that adds
or alters UI. What this change alters, in rendered terms: `17 components → 19`,
`137 declared variants → higher`, and two names joining the `Components` list.

The schema itself names the story as the eval target and the Figma page as the
*visual record* ("richer signal, cheaper than walking Figma"). The eval below ran
against the story and produced 14 findings, so the signal was real — but every
finding is about labelling and semantics, which the markdown ledger carries in
full. A `0.0 As is` / `0.5 Eval` pair whose only visual difference from today is
`17` vs `19` adds no review signal this change can act on.

**Recommendation:** record the exception here and carry the ledger into a separate
dashboard-semantics change, where the Figma pair would earn its place against a
real visual delta. **Founder call outstanding.**

## Eval (0.5)

> Produced by an isolated subagent (surface + rubric only — no proposal
> rationale, no mention of this change). Rubric = every `principles.config.mjs`
> record with an `evalLens` — 11 of 20. Scores are summary color only; the
> findings are the artifact. This baseline is cached — proposal iterations
> re-run only the Delta (1.5).

Surface evaluated: the two adjacent cards `Component library` and `Figma library`
as `LiveSnapshot` renders them.

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | Neither card shows freshness or outcome state — no last-synced time, no pass/fail, no stale marker — though Card 2 lists a page named `syncReports`, which tells the reader syncing is a recurring, failable event. | visibility-of-system-status | Reader quotes the tallies as today's coverage. A maintainer cannot tell whether a sync is overdue, so the mirror silently rots. | high |
| F2 | "components" counts a different set on each card: Card 1 "10 ui components" (UI list only), Card 2 "17 components" (flat, also absorbing layout, blocks and forms). Same word, same tally slot, same treatment, different denotation. | consistency-and-standards | Reading the numbers side by side, the reader concludes Figma has 7 more components than code — the inverse of what the lists contain — and treats Figma as the richer source. | high |
| F3 | Card 1 enumerates 25 named items; Card 2's list has 17, and 8 of Card 1's appear nowhere in Card 2. The absence is never marked. `Input` is missing while `Textarea` is present. | visibility-of-system-status | An adopter assumes there is no `Input` and no layout primitive, and builds detached local versions — or assumes the mirror is complete and files a bug. Nobody learns coverage is partial. | high |
| F4 | Two cards, same grid, same treatment, near-twin titles, and no copy stating which is derived from the other, or that one is derived at all. | match-system-and-real-world | Reader models them as two peer libraries and may start from Figma as the authority, authoring or renaming there. Contributions land on the wrong side of a one-way mirror. | high |
| F5 | Tally-to-list correspondence is exact on Card 1 (9/10/4/2 → four lists) and broken on Card 2: `137 declared variants` and `9 text styles` have no list, while `Collections` has no tally. | consistency-and-standards | Having verified Card 1, the reader extends that trust to Card 2's unverifiable figures, and hunts for a missing variants list. | medium |
| F6 | Card 1's lists are alphabetical within labelled groups; Card 2's 17-item list is in neither alphabetical nor Card 1's order (it opens "Button, Badge"). | recognition-rather-than-recall | Reader must hold 25 names against a differently-ordered 17, gives up partway, and leaves with "mostly covered" instead of the real gap. | medium |
| F7 | The same concept is `RadioGroup` on Card 1 and `RadioGroupItem` on Card 2, with nothing marking them as the same object. | consistency-and-standards | Reader counts one as un-mirrored and the other as a Figma-only extra, inflating perceived divergence by two. | medium |
| F8 | `137 declared variants` uses an unexplained qualifier — "declared" distinguishes itself from something the surface never names — with no counterpart on Card 1. | match-system-and-real-world | Reader either quotes 137 as variants that exist and work, or notices the hedge and discounts the card's numbers. | medium |
| F9 | `Customize Here` sits as a third entry in `Collections` — an imperative rendered as an inert object label. | match-system-and-real-world | Reader reads it as a call to action, finds no control, and concludes the dashboard is partly non-functional. | medium |
| F10 | 48 proper nouns at uniform weight, while the question the reader arrives with — what is covered, is it current — is nowhere stated. The largest, least actionable figure is the loudest element. | aesthetic-and-minimalist-design | Reader skims the lists, anchors on the biggest number, and leaves with "137 variants" instead of a judgement about coverage. | medium |
| F11 | Lexical drift between parallel slots: `ui components`/`UI`, `form components`/`Forms`, `layout primitives`/`Layout`; page list mixes `foundations, components, syncReports`. | consistency-and-standards | Reader cannot tell whether blocks and layout primitives are also "components" — precisely the ambiguity that makes F2 go wrong. | low |
| F12 | All 48 names are inert text; the only accelerator is one footer link per card, pointing at a directory. | flexibility-and-efficiency-of-use | A maintainer checking one component navigates down by hand every time, so the dashboard gets bypassed. | low |
| F13 | Footer actions are raw paths, inconsistently formed (`src/components` vs `figma/`), and neither says what opens. | consistency-and-standards | Reader expects the second to open the Figma library, lands elsewhere, and stops trusting the links. The asymmetric slash reads as a typo. | low |
| F14 | The surface's own vocabulary — "declared", "syncReports", "Customize Here", "blocks" vs "ui components" — is never glossed. | help-and-documentation | An evaluator cannot answer "how do I consume this, and which side do I start from" from the surface. | low |

**Lenses with no finding:** `user-control-and-freedom`, `error-prevention`,
`error-recovery`, `no-runts`.

**Strengths worth preserving:**

- Card 1's four tallies resolve exactly against its four lists, so its counts are
  verifiable in place rather than taken on trust (visibility-of-system-status).
- Both cards use the identical internal part order — title → tally → lists →
  single footer action — so structure learned on one transfers
  (consistency-and-standards).
- Each card ends with exactly one destination link rather than competing calls to
  action (aesthetic-and-minimalist-design).

**Figma `0.5 Eval` page:** not created — see the exception under *Figma gate*.
The ledger above is canonical.

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

### What this change does to the ledger

Measured, not asserted:

- **F3 improves.** The unmarked-absence list shrinks from 8 items to 6 —
  `Input` and `Dropzone` stop being invisible on Card 2.
- **F2 gets worse.** Card 2's `components` goes 17 → 19 while Card 1's
  `10 ui components` is unchanged, so the misleading side-by-side widens from
  10-vs-17 to 10-vs-19 and the inverse reading gets stronger.
- Every other finding is pre-existing and untouched by this change.

### Top issues to fix

1. **In scope — F2's worsening.** This change must not leave the two cards
   further apart than it found them. The cheapest honest fix is making Card 2's
   tally label say what it counts (it counts *mirrored components across all
   families*, not *ui components*). One label, no new surface.
2. **Out of scope — F1, F4, and the rest.** Freshness state, the derived-from
   relationship, the `RadioGroup`/`RadioGroupItem` split, the unglossed
   vocabulary: all real, none caused by this change, none fixable without
   widening it. They belong to a separate dashboard-semantics change, with this
   ledger as its cached baseline and the Figma pair built there against a real
   visual delta.

### Tradeoffs worth preserving

- Card 1's verifiable tally-to-list correspondence. Whatever label fix lands on
  Card 2 must not break Card 1's property that every count can be checked
  against the list beside it.
- The shared internal part order across both cards.
- One footer destination per card.

### Don't-breaks

- The `manifest-ia` requirement that the presentation matches the actual set of
  manifests — the whole point of this change is that the gate enforces it.
- `npm test` story assertions on `Site/ElementsOfMvds`, including the tally
  no-mid-unit-break guard added in beckharrisdesign/mvds#110.
- No new variants, no mirror growth beyond 19, no Figma write.

## Status

ready for founder review — with one open call: the `Figma gate` exception
(recommendation: accept) under **As-is (0.0)**.
