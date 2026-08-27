# adding-eval-gate — tasks

## 1. User outcomes (from spec scenarios)

From `specs/discovery-eval/spec.md`:

- [x] 1.1 Founder approves discovery before any proposal exists
- [x] 1.2 Founder reads auditable findings from the as-is surface
- [x] 1.3 Eval runs blind to proposal rationale
- [x] 1.4 Proposal answers the approved eval summary
- [x] 1.5 Founder reviews the proposal as a delta against baseline
- [x] 1.6 Iterations re-run only the delta

From `specs/eval-rubric/spec.md`:

- [x] 1.7 Eval applies exactly what the manifest carries
- [x] 1.8 All ten heuristics evaluate a surface
- [x] 1.9 A founder-added rubric item applies on the next eval
- [x] 1.10 Principles gate is byte-for-byte indifferent to eval lenses

> **Verified 2026-08-26 by `motion-muse-signup-flow`** — the first real run:
> discovery (0.5 blind eval / 0.6 summary) approved before design existed
> (1.1, 1.2, 1.3); the proposal answered the approved summary via the
> "Eval Summary → Proposal" table (1.4); the founder reviewed 1.5 and 3.5
> delta ledgers (1.5); iterations 01.0 → 03.0 re-ran only the delta against
> the cached 0.5 baseline (1.6); and the founder-added `no-runts` record
> joined the rubric mid-change and caught four findings on its first eval
> (1.9). See openspec/changes/motion-muse-signup-flow/{discovery,design}.md.
>
> 1.1–1.6 and 1.9 are behaviors of a change *run under* `mvds-default` — they
> verify in the founder's planned test change (first real run of the new loop),
> not inside this PR. 1.7, 1.8, and 1.10 verify here (manifest + gate).

## 2. Preview (Storybook)

- [x] 2.1 `principles-panel` story shows ten lean adopted cards (rationale not
      rendered; source row = id + `NN/g · Heuristic N ↗` link; enforcement
      Badge only) — light + dark; `npm run storybook`
- [x] 2.2 `principles-index` story shows ten `nn##-` rows sorted by heuristic
      number — light + dark

## 3. Implementation

- [x] 3.1 `openspec/schemas/mvds-default/` — fork of `experiment-hub-lite`
      (schema.yaml + templates) with: `discovery` artifact (template
      `discovery.md`; 0.0 As-is / 0.5 Eval / 0.6 Eval Summary; requires
      proposal; absolute stop rule), `design` reworked (requires discovery;
      1.0 conditioned on approved 0.6; 1.5 Eval Delta findings ledger:
      addressed / deliberately preserved / regressed / new; informational),
      eval mechanics per design.md Decisions 3 & 6 (Storybook story target,
      cached baseline, subagent isolation), `x-source` provenance noting the
      deliberate fork
- [x] 3.2 `openspec/config.yaml` — default schema flips to `mvds-default`;
      `openspec/README.md` schema table + workflow line updated;
      `experiment-hub-lite` files untouched (byte-identical)
- [x] 3.3 `principles.config.mjs` — surface-evaluation lens field on the five
      existing Nielsen records (system-design `rationale`/`fix` text
      unchanged); five new guiding records: nn02 match-system-and-real-world,
      nn03 user-control-and-freedom, nn07 flexibility-and-efficiency-of-use,
      nn09 error-recovery, nn10 help-and-documentation (final copy from the
      02.0 drafts, founder-approved voice); eval resolves rubric from the
      manifest only
- [x] 3.4 `src/components/site/principles-panel.tsx` — PrincipleCard tune per
      02.0: drop rationale render, source row = id + single NN/g link,
      explainer copy trimmed; update `principles-panel.stories.tsx`
- [x] 3.5 Regenerate the manifest snapshot consumed by the site surfaces;
      `principles-index` renders the ten rows with `nn##-` display ids (no
      component change expected — verify `principle-display.ts` covers the new
      records)
- [x] 3.6 `rules/figma.mdc` — note the stage model: 0.5/0.6/1.5 are markdown
      artifacts in the change directory; Figma page convention (0.0 / 0N.0)
      unchanged

## 4. QA

- [ ] 4.1 Manual walkthrough of Outcomes: 1.7/1.8/1.10 here; 1.1–1.6 + 1.9
      deferred to the founder's test change under `mvds-default` (do not
      archive this change until that run passes or the founder waives)
- [x] 4.2 `npm run build` · `npm run check:contrast` · `npm run
      check:principles` (must be byte-for-byte indifferent to the new records
      per 1.10) · `npm test` (stories + a11y, light + dark)
- [x] 4.3 `npm run check:upstream-drift` — confirms the mirrored
      `experiment-hub-lite` set still matches the stamp (no accidental edits)
