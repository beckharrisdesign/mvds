# stepped-scales — design

## Context

Specs approved 2026-08-21. This artifact fixes the candidate default-brand
step values, the token/utility naming, the gate wiring, and the principle
records' detection shape. Origin: the founder's redirect during
scoped-theming design review ("why are we deriving the ramp at all?") — the
ramp's value is the discipline of stepping, encoded as principle + a small
authored scale, not a runtime formula.

## Goals / Non-Goals

**Goals:**

- Authored `primary-1…5` / `secondary-1…5` (light + dark) with role contracts,
  replacing the derived 50–950 ramps and their formulas.
- Two machine-enforced manifest records: `step-on-color-gradations`,
  `step-on-type-ramp`.
- Specimen, contrast gate, snapshot, and Figma lock all read the authored steps.

**Non-Goals:**

- Gray ladder changes (substrate for semantic tokens; keeps 50–950 naming —
  deliberate asymmetry: gray is plumbing, gradations are the designed stepping
  surface).
- Status-triad gradations; Phase-2 component de-alpha migration (this lands
  its substrate).
- Any library sync to MVDS Core without an explicit ask.

## User flow / IA

Agent/consumer decision flow: need a tint/shade of a brand color → pick a step
by role (1–2 tint surface · 3 decorative · 4–5 text-safe) → `bg-primary-2`,
`text-primary-5`, `from-secondary-1`. Ad-hoc `/10` alpha or `color-mix` on
brand families now errors in `check:principles` (outside carve-outs).

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/KbkmvIV65YvRBEMJcuvbtI (scratch: "MVDS explore: stepped-scales") |
| As-is page / frame    | `0.0 As is` — "Three 11-step derived ladders": gray/primary/secondary 50–950 as shipped, annotated with the consumer count (one: the specimen story) and the runtime-derivation problem |
| Proposed page / frames| `01.0 Propose: stepped-scales` — "Five authored steps, roles as contract (light)" (default-brand candidates + terracotta primary/secondary rows demonstrating brand-authored values, role demos inline); same "(dark)"; "The two stepping principles" (manifest records as cards with ✗/✓ usage diffs) |
| Libraries / version   | Values mirror `src/index.css` defaults (oklch→hex, reference); terracotta rows are the scoped-theming candidate palette |
| Breakpoints           | Storybook canvas (token/specimen change — no S/L delta) |
| Status                | iterating — first pass for founder review |

## Decisions

1. **Naming:** tokens `--primary-1…-5` / `--secondary-1…-5`, utilities
   `bg-primary-1` etc. via the existing `@theme inline` mapping. The 1–5 space
   is deliberately alien to Tailwind's 50–950 muscle memory — an agent cannot
   pattern-match a generic palette habit onto it without noticing.
2. **Authored values live in `:root` / `.dark`** as plain declarations — fully
   parseable by `check-contrast.mjs` and `generate-manifest-snapshot.mjs` with
   no selector changes at all (simpler than the parked scoped-theming v2
   mechanism; that change now just ships five more declarations per preset).
3. **Candidate default-brand values** (draft — the gate is the authority):
   light `#f5f5f5 / #e8e8e8 / #cfcfcf / #5e5e5e / #2e2e2e`, dark
   `#2b2b2b / #383838 / #555555 / #b8b8b8 / #ebebeb`; `secondary` mirrors
   until the founder differentiates (default brand is monochrome by design).
4. **Gate wiring:** `check:contrast` pairing list gains, per family × mode:
   `foreground` on step-1, `foreground` on step-2, step-4 on `background`,
   step-4 on `card`, step-5 on `background`, step-5 on `card`. Step-3 carries
   no text pairing (decorative — the `muted-foreground`-style carve-out,
   documented in the specimen).
5. **Detection shape for the principle records** (regex sketch, refined at
   apply): `step-on-color-gradations` flags `(bg|text|border|from|via|to)-
   (primary|secondary)/\d+` and `color-mix(...var(--primary|--secondary)...)`;
   `step-on-type-ramp` flags Tailwind generic sizes (`text-(xs|sm|base|lg|
   [2-9]?xl)`) and arbitrary `text-[...px]`. Both severity `error`; vendored
   `ui/` carve-out on the color record **noted in the record itself** with the
   Phase-2 pointer; specimen stories scoped out as today.
6. **The derivation formula is deleted, not demoted.** No shipped generator in
   this change; if brand authoring later wants an assistant, that is a
   consumer-tooling decision (backlog item 4) — not part of the token
   contract.
7. **Migration:** in-repo, only the color specimen consumes ramp steps —
   rewritten as the gradation specimen. `AGENTS.md` golden-rule bullet and
   `docs/THEMING.md` ramp recipe rewritten. External: Motion & Muse's
   gradient classes migrate on its next MVDS bump (recorded in its
   FINDINGS.md follow-ups).

## Risks / Trade-offs

- **Five steps may prove too few** for dataviz-like needs; that is a future
  scale decision, not a reason to keep 11 unused ones — the principle record
  and authored shape extend to more steps without rework.
- The color principle's `ui/` carve-out means the rule is initially silent
  exactly where alpha tints are densest; acceptable because Phase 2 owns that
  migration, and the carve-out is data in the record (visible, dated), not an
  invisible exception.
- Removing `primary-*` 50–950 utilities is breaking for any consumer using
  them decoratively (known: Motion & Muse, landing gradients) — pre-1.0 clean
  break per house rules, migration is a class rename.
- Terracotta rows shown in the frames are scoped-theming candidates rendered
  here for storytelling; their approval travels with `scoped-theming`, not
  this change.
