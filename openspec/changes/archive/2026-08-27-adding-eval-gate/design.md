# adding-eval-gate — design

## Context

Proposal and specs approved 2026-08-25. This change is mostly schema/manifest
machinery, but it has one genuine UI edge: the principles surfaces render from
the live manifest, so completing Nielsen's ten adds five cards to the landing
"Adopted from published work" section and five `nn##-` rows to the Intro →
Design principles index. The HF pair below renders exactly that delta. This
change runs under the original `experiment-hub-lite` schema (founder decision —
the evolved `mvds-default` schema it creates will be exercised by a separate
test change after this one ships).

## Goals / Non-Goals

**Goals:**

- `mvds-default` schema fork with the discovery stage (0.0 → 0.5 Eval → 0.6
  Eval Summary, founder stop) and the reworked design stage (1.0 conditioned on
  0.6 → 1.5 Eval Delta, findings ledger).
- Rubric as manifest data: surface-evaluation lens on all ten Nielsen records;
  five new guiding records (nn02, nn03, nn07, nn09, nn10).
- `experiment-hub-lite` untouched — byte-identical, drift-watched, selectable.

**Non-Goals:**

- Post-ship instrumentation; score-based auto-blocking; rendering the eval
  lens in any UI; Figma Core library sync; hub upstreaming.

## User flow / IA

Founder's loop under `mvds-default`: approve proposal → approve specs →
**approve discovery** (read 0.5 findings + 0.6 summary; steer what the proposal
must fix before any pixels exist) → approve design (judge 1.0 comparatively via
the 1.5 ledger: addressed / preserved / regressed / new) → approve tasks →
apply. Five checkpoints, all absolute stops.

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/HLBCE2Ncj0NG2RDoDnvGag (scratch HF: "MVDS explore: adding-eval-gate") |
| As-is page / frames   | `0.0 As is` — "Adopted from published work — as shipped (light · L)" (5 cards, from `principles-panel.tsx`) + "Intro › Design principles index — as shipped, NN rows (light · L)" (5 `nn##-` rows, from `principles-index.tsx`) |
| Proposed page / frames| `02.0 Propose: adding-eval-gate update` — lean cards, all ten heuristics ordered by number (supersedes the cards frame on `01.0`; the index table stands on `01.0` — 10 rows, new rows interleaved nn02/03/07/09/10) |
| Libraries / version   | MVDS Core Tokens (Light/Dark) + Scales, imported by key — no hand-mirrored hex; mirrors `@beckharrisdesign/mvds@0.4.0` tokens |
| Breakpoints           | Rendered at L · 1024 (2-col card grid); S · 480 stacks to 1 col via the existing `md:2` grid — no new responsive behavior. Index is Storybook/desktop chrome. |
| Status                | iterating — second pass (card tune) for founder review |

Dark mode = Tokens collection mode flip on the imported variables, not a second
hand-painted board (per `rules/figma.mdc` HF rules).

## Decisions

1. **The UI delta is data-plus-one-card-tune** (founder redirect on `01.0`
   review, 2026-08-25 — superseding the first-pass "data-only" stance).
   `PrincipleCard` is tuned: the `rationale` line no longer renders (the field
   stays in the manifest — agents, autodocs, and the why-record keep it), and
   the source row becomes id + one plain `NN/g · Heuristic N ↗` caption link —
   the outline source badge was chrome masquerading as a Badge and is gone;
   the real enforcement Badge stays. The panel explainer drops its "MVDS's own
   account" clause (it described the rationale wording). The surface-evaluation
   lens remains deliberately **not rendered**.
2. **Card copy on the five new records is draft.** Titles/descriptions/
   rationales in the propose frames set the voice (MVDS-idiom titles like
   "Errors say what to do next" — mirroring the manifest's own `fix:` field);
   final wording lands at apply.
3. **Eval target (founder decision, 2026-08-25):** the 0.5/1.5 eval evaluates
   the running Storybook story where one exists; the Figma page is the visual
   record. The 0.5 baseline is cached; iterations re-run only the delta.
4. **0.6 is an absolute founder stop**, same grammar as the schema's other
   stop rules — no conditional severity-threshold pass-through. Founder
   reserves backing it off if friction proves too high; that would be a schema
   edit, not conditional logic.
5. **Findings ledger over scores.** Numeric per-heuristic scores are summary
   color only; nothing gates on them. The auditable artifact is the
   per-finding disposition ledger.
6. **Eval isolation:** 0.5 and 1.5 run in a subagent context containing only
   the surface and the manifest rubric — never proposal rationale. Accepted as
   an imperfect but directionally right de-biasing proxy.
7. **Schema fork, not mutation:** `openspec/schemas/mvds-default/` (founder
   naming); `config.yaml` default flips; `experiment-hub-lite` stays
   byte-identical as the drift-watched safe archive.
8. **Display ids:** the five new records take the existing `nn##-` display
   prefix (`principle-display.ts`) so the index keeps sorting by heuristic
   number; machine ids stay kebab-case without the prefix.

## Risks / Trade-offs

- **Self-grading residue:** subagent isolation reduces but does not eliminate
  the generator-grades-itself problem; the ledger's falsifiable dispositions
  are the real check, and the informational-first stance (Decision 5) keeps a
  miscalibrated eval from blocking work.
- **Eval token cost:** two eval passes per change is real spend against the
  "Claude is the expensive loop" constraint — mitigated by the cached baseline,
  delta-only re-runs, and Storybook-over-Figma-MCP as the eval target.
- **Panel density** (5 → 10 adopted cards) was the first-pass risk; the `02.0`
  lean card resolves it — dropping the rendered rationale roughly halves each
  card, so ten lean cards scan better than today's five long ones. The card now
  practices "cut surface that doesn't earn its place" on itself.
- **Draft copy risk:** five new titles/descriptions written agent-first; the
  founder's review of the propose page is exactly the wet-cement moment to
  redirect voice before apply.
