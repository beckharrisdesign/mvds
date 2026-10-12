# harden-figma-coverage-gate — design

## Context

`check:figma` enumerates `componentManifests` — a hand-maintained array — so it
validates what is declared and never asks whether everything that should be
mirrored is in the array. `Input` and `Dropzone` ship in code **and** in Figma
while being invisible to it. The fix inverts the enumeration: walk the mirrorable
scope, require every component to be mirrored or excluded with a documented
reason, reconcile against every lock entry, and fingerprint each exclusion so a
judgment is re-confirmed when its subject changes.

This artifact is generated against the approved `0.6 Eval Summary`, which put
exactly one surface change in scope: the Figma library card's first tally,
because the coverage fix moves that number and `0.5` found the number already
miscommunicating.

## Goals / Non-Goals

**Goals:**

- A gate that fails closed: an unclassified component, an undeclared lock entry,
  or a stale exclusion fingerprint each exit non-zero.
- Declared coverage reaches 19 and matches the lock.
- The Figma library card's tally stops inviting the inference `0.5` F2 found.

**Non-Goals:**

- Growing the mirror. 17 → 19 and no further; no component gains a variant.
- The other twelve `0.5` findings. Pre-existing, not caused here, and fixing them
  means widening the PR.
- Any Figma library sync. One-way and only on founder request.
- The lock-schema split of token vs component baselines (deferred at
  beckharrisdesign/mvds#113).

## User flow / IA

No IA change. The six-card order, the disclosure behaviour and the card anatomy
(title → description → tally → disclosure → footer path) are untouched. One tally
unit on one card changes its wording; its position, type ramp, tokens and
sibling units are identical.

The authored change is one line —
`scripts/generate-manifest-snapshot.mjs:371`:

```js
{ label: "components", value: componentManifests.length }
```

becomes a label that states scope against a shared denominator. The data shape is
unchanged, so `manifest-dashboard.tsx` is not touched and the tally's
unbreakable-unit guard from beckharrisdesign/mvds#110 still applies.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | `https://www.figma.com/design/4wjZheQYLfBAVQ8nWn1YRR/` (HF scratch, not MVDS Core) |
| As-is page / frame | **No `0.0 As is` page for this change** — discovery took a recorded exception. The as-is reference is the shipped `15.0 Propose: improve-manifests-ia update 14` frames (`74:8` L 1024, `74:195` S 480), which *are* the current surface; the proposed frames below are clones of them, so every fill, radius and gap keeps its live variable binding. |
| Proposed page / frame | `02.0 Propose: harden-figma-coverage-gate update` (`92:2`) — `L 1024 / proposed` (`92:3`), `S 480 / proposed` (`92:26`). Supersedes `01.0 Propose: harden-figma-coverage-gate` (`90:2`), kept per the never-overwrite rule. |
| Libraries / version | MVDS Core bindings inherited through the clone — fills, strokes, radii and `itemSpacing` remain bound; no hand-mirrored hex introduced. |
| Breakpoints | L · 1024px and S · 480px (BHD Content Types) |
| Status | ready for apply |

**The change, rendered:**

| | Figma library card, first tally row |
| --- | --- |
| As-is | `17 components · 137 declared variants · 9 text styles · 3 pages` |
| `01.0` | `19 of 25 mirrored · 143 declared variants · 9 text styles · 3 pages` |
| `02.0` | `19 of 25 components mirrored · 143 declared variants · 9 text styles · 3 pages` |

`143` is computed, not estimated: `declaredTotal` sums each manifest's axis
cross-product, Input adds `size` ×3 and Dropzone `state` ×3, and the lock records
exactly 3 variants for each.

`25` is Card 1's own inventory (9 + 10 + 4 + 2), so the two cards now share a
denominator.

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| **In scope — F2's worsening.** The coverage fix moves Card 2's figure 17 → 19 while Card 1 holds at 10, widening a side-by-side that already read backwards. | The tally no longer presents a bare count. `19 of 25 components mirrored` states a subset of Card 1's own total, so the "Figma has more than code" inference is closed rather than widened. Delta confirms **addressed**. |
| **Out of scope — F1, F4 and the rest.** Pre-existing, not caused here, not fixable without widening. | Left untouched and carried forward as the cached baseline for the dashboard-semantics change. One exception surfaced by the delta is recorded under *Risks* below, because this change made it worse rather than merely leaving it. |
| **Don't-break — `manifest-ia`'s "presentation matches the actual set of manifests".** | Strengthened: the gate now enforces it rather than relying on the generator being right. |
| **Don't-break — the beckharrisdesign/mvds#110 tally guard.** | Untouched. The data shape is unchanged, so the no-mid-unit-break assertion still holds; the longer label makes it *more* load-bearing, and tasks must re-run it at 480. |
| **Don't-break — no new variants, no mirror growth beyond 19, no Figma write.** | Held. 19 is the ceiling; the Figma writes here are HF scratch pages, not a library sync. |

## Eval Delta (1.5)

Same rubric, same isolation as `0.5` — separate subagent, surface and rubric
only. Run against the `02.0` surface. **Informational, never blocking.**

| 0.5 finding | Disposition | Note |
| --- | --- | --- |
| F1 visibility-of-system-status | unchanged | No freshness or run-outcome state on either card; `syncReports` still a bare page name. The new copy arguably makes the absence louder. |
| **F2 consistency-and-standards** | **addressed** | Card 2's tally no longer counts "components" as a competing total; `of 25` ties it to Card 1's inventory. Residual: Card 2's *list heading* "Components" still spans all four of Card 1's groups. |
| **F3 visibility-of-system-status** | **addressed** | `Input` present; the gap is now numerically marked (25 − 19 = 6). Residual: *which* six still requires diffing the lists by hand. |
| **F4 match-system-and-real-world** | **regressed** | See *Risks* — this change surfaced a latent contradiction in existing card copy. |
| F5 consistency-and-standards | unchanged | Two of Card 2's four figures still resolve to no list; `Collections` still has no tally. |
| F6 recognition-rather-than-recall | unchanged | Card 2's list order is still neither alphabetical nor Card 1's grouping; `Input`/`Dropzone` append at the end. |
| F7 consistency-and-standards | unchanged | `RadioGroup` vs `RadioGroupItem` still unmarked — and the card's own copy claims "conventions bind the shared names". |
| **F8 match-system-and-real-world** | **addressed** | "declared" is glossed in place by existing copy ("A spec declares which components and variants appear"). Not caused by this change. |
| F9 match-system-and-real-world | unchanged | "Customize Here" still an imperative in an object-label slot. |
| F10 aesthetic-and-minimalist-design | unchanged | Uniform weight across ~44 proper nouns; the largest figure is still the least actionable. |
| F11 consistency-and-standards | unchanged | Page casing still mixes. Noted regression in kind: the new label shares no word with the `Components` heading it resolves to, where `17 components` did. |
| F12 flexibility-and-efficiency-of-use | unchanged | All names inert; one footer path per card. |
| F13 consistency-and-standards | unchanged | `src/components` vs `figma/` still inconsistently formed. |
| **F14 help-and-documentation** | **addressed** | Existing copy glosses spec / conventions / lock. Not caused by this change. |

**New in the delta:**

| # | Finding | Disposition here |
| --- | --- | --- |
| N1 | Description slot holds ~11 words on Card 1 against ~55 on Card 2 — same slot, same treatment, different behaviour. | Pre-existing, untouched. Belongs to the dashboard-semantics change. |
| N2 | Card 2's copy ("Design and code always match") and its tally ("19 of 25 … mirrored") make opposite factual claims about the same thing. | **Caused to become legible by this change.** See *Risks*. |
| N3 | `01.0`'s `19 of 25 mirrored` named no object. | **Fixed in `02.0`** — the noun is restored while the denominator is kept. |

Totals against `02.0`: 4 addressed, 1 regressed, 9 unchanged, 0 deliberately
preserved, 2 new carried forward, 1 new fixed in iteration.

## Decisions

1. **`19 of 25 components mirrored`, not `19 mirrored` or `19 of 25 mirrored`.**
   The ratio is what closes F2 — a bare count invites the backwards comparison,
   and `of 25` borrows Card 1's own arithmetic. The noun is what the delta's N3
   caught: `19 of 25` alone names no object. Keeping both costs four words.
2. **Label only; no component change.** The `{label, value}` shape already renders
   as `{value} {label}`, so the whole change lives in the generator and
   `manifest-dashboard.tsx` is untouched.
3. **Proposed frames are clones of the shipped `15.0` frames**, not rebuilt. A
   rebuild would hand-place values that are currently variable-bound and would
   make the comparison less trustworthy, not more.
4. **The exclusion fingerprint is the component's public prop signature.** Three
   attempts to derive mirror-eligibility from source all failed to discriminate
   (Layer is mirrored and paints no surface; Container has a closed `size` enum
   and stays native), so the gate makes no claim about what *ought* to be
   mirrored — only that the thing judged has not changed shape.

## Risks / Trade-offs

**F4 / N2 — this change makes an existing false claim legible.** Card 2's
description says *"Design and code always match"*. That is already untrue — six
components are deliberately native — but `17 components` did not contradict it on
its face, whereas `19 of 25 components mirrored` states the mismatch plainly
directly beneath it.

The delta rates this a regression against the baseline, and it is not a false
alarm: a reader now gets a confident claim and its refutation in the same card.

**Recommendation: leave it to the dashboard-semantics change, and decide at this
checkpoint.** The sentence is site voice governed by the `site-voice` capability,
not by this one, and `0.6` deliberately scoped this change to a single label.
Fixing it here means editing marketing copy inside a gate-hardening PR. If you
would rather not ship the contradiction, the minimal edit is to replace *"Design
and code always match"* with a claim the card can support — e.g. *"Every mirrored
component matches its code"* — and I will fold it in before apply.

**Longer label at 480px.** `19 of 25 components mirrored` is 10 characters longer
than `17 components`. The beckharrisdesign/mvds#110 guard makes each count+label
an unbreakable unit, so the risk is a wrap at a `·` separator rather than a
mid-unit break — acceptable, but tasks must re-run the 480 assertion rather than
assume it.

**The gate will fail on first run.** Between the coverage pass landing and the two
manifests being authored, `check:figma` exits non-zero. That is the feature
working; tasks sequence it so the failing state is never committed as green.
