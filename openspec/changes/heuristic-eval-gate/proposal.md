# heuristic-eval-gate

## Human anchor

> "MVDS is my prototype for orchestrating the design loop — my strategic point of
> view goes into the wet cement, and my agent generates Figma proposals for my
> review and iteration. Code is the source of truth, design principles are
> machine-enforced, and experience is instrumented from Day 1."
>
> "Its felt like I skated over that phase in previous tests."
> — on the discovery phase, approving this change (2026-08-25)

## Outcomes

- **Who:** The founder, who reviews every artifact at every gate; the agent
  generating design proposals; eventually, consumers of the system who bring
  their own evaluation rubrics.
- **Job:** Make the founder's review pass at the design gate fast and confident —
  see what is wrong with the current surface *before* a proposal exists, and see
  whether a proposal actually improved it, instead of judging absolute quality
  by eye.
- **Done when:** A change run under the evolved schema produces a `discovery.md`
  (0.0 As-is → 0.5 Heuristic Eval → 0.6 Eval Summary) that stops for founder
  approval before any proposal is generated; `design.md` (1.0 Proposal → 1.5
  Eval Delta) reports a findings ledger — each 0.5 finding dispositioned as
  addressed / deliberately preserved / regressed / new; the heuristic rubric
  lives in `principles.config.mjs` as data, with the surface-evaluation lens on
  the five Nielsen records already present and the five missing heuristics
  added; and the original `experiment-hub-lite` schema remains byte-identical,
  drift-watched, and selectable — the safe archived version.
- **Not doing:** Post-ship instrumentation (live experience signal feeding back —
  a separate future change); auto-blocking on eval scores or deltas (the delta
  is informational; promotion to a hard gate is a later, calibrated decision);
  Figma Core library sync; upstreaming to experiment-hub; editing any of the 14
  mirrored hub files.

## Why

The current loop machine-enforces code (`check:principles`, `check:contrast`,
`npm test` — all at apply) but the artifact the founder personally reviews — the
Figma as-is + proposed pair — is checked by nothing but eyes. Verification, not
generation, is the loop's bottleneck. This change moves structured evaluation to
the founder's own checkpoint: the eval runs before the proposal exists and
conditions it (0.6 is generation input, not a report), and the delta turns the
founder's review from absolute judgment into comparative judgment. Discovery
also becomes a real stage with its own artifact and stop rule, rather than a
phase skated over inside design.

## What changes

1. **Fork the schema; the untouched original is the archive.**
   `openspec/schemas/experiment-hub-lite/` is one of the 14 hub-mirrored files
   and stays byte-identical — it remains drift-watched and usable as-is. The
   evolved schema is a new directory, `openspec/schemas/mvds-lite/` (name open
   to founder veto), and `openspec/config.yaml` flips the default to it.
   Mutating the mirror in place would make the weekly `upstream-currency` issue
   fire forever; forking keeps the drift signal meaningful *and* answers the
   "archive a safe working version" requirement structurally.
2. **New `discovery` artifact** (`discovery.md`, requires proposal, own template,
   own stop rule): 0.0 As-is (unchanged mechanics), 0.5 Heuristic Eval
   (per-heuristic findings: violation / heuristic / predicted consequence /
   severity; scores are summary only, never load-bearing), 0.6 Eval Summary
   (top issues to fix, tradeoffs worth preserving, don't-breaks). The loop
   becomes proposal → specs → **discovery** → design → tasks, five founder
   checkpoints, all absolute stops — no conditional pass-through.
3. **`design` artifact reworked** (requires discovery): 1.0 Proposal generated
   with the Eval Summary in context, 1.5 Eval Delta re-running the same rubric
   and reporting the findings ledger against the 0.5 baseline.
4. **Eval mechanics:** the eval runs in a separate subagent context that sees
   only the surface and the rubric — never the proposal's rationale (de-biasing
   proxy, acknowledged imperfect). It evaluates the running Storybook story
   where one exists, with the Figma page as the visual record (founder decision,
   2026-08-25). The 0.5 baseline is cached; iterations re-run only the delta.
5. **Heuristics become manifest data:** the five existing Nielsen `guiding`
   records gain a surface-evaluation lens alongside their system-design
   reading (same record, two consumers); the five absent heuristics (2, 3, 7,
   9, 10) are added. This is the extension point for per-context rubrics and
   consumer-supplied principles later (`principles.resolve.mjs`).
6. **`rules/figma.mdc` updated:** 0.5 / 0.6 / 1.5 are markdown artifacts in the
   change directory, not Figma pages; the Figma page convention itself
   (`0.0 As is`, `0N.0 Propose:`) is unchanged.

## Capabilities

### New Capabilities

- `discovery-eval`: the loop has a discovery stage whose heuristic evaluation is
  produced before, conditions, and is deltaed against every design proposal,
  with a founder stop at the Eval Summary.
- `heuristic-rubric`: the evaluation rubric is data in the principles manifest —
  Nielsen's ten as the base set, surface-evaluation lens per record, open to
  founder and consumer additions.

### Modified Capabilities

*(none — existing promoted specs are untouched; the schema fork leaves
`experiment-hub-lite` selectable per-change via `.openspec.yaml`)*

## Impact

- `openspec/schemas/mvds-lite/` — new schema + templates (fork of lite)
- `openspec/config.yaml` — default schema flips to `mvds-lite`
- `openspec/README.md` — schema table and workflow line
- `principles.config.mjs` — eval lens + five new heuristic records
- `rules/figma.mdc` — stage-model artifact locations
- Mirrored hub files — **no edits**; drift posture unchanged

## Optional links

- House rules: `AGENTS.md`
- Figma rules: `rules/figma.mdc`
- Upstream baseline: `.upstream/README.md`
