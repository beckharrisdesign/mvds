# stepped-scales — tasks

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Gradation steps render authored values in both modes — `bg-primary-2` / `text-primary-5` (and `secondary` peers) work light and dark; no `50…950` utility exists anymore
- [x] 1.2 Contrast gate owns the gradation pairings — a step value that breaks its role's AA pairing fails `check:contrast`, naming step, pairing, and mode
- [x] 1.3 Specimen and mirrors show the authored steps — the foundations specimen renders 5 steps × 2 families with roles in both modes; snapshot and Figma manifest list the steps, not the removed ramps
- [x] 1.4 Ad-hoc brand tints are flagged with the stepped alternative — `bg-primary/10` outside carve-outs errors in `check:principles` citing `step-on-color-gradations`
- [x] 1.5 Ad-hoc type sizes are flagged with the ramp alternative — `text-2xl font-bold` in scoped code errors citing `step-on-type-ramp`

## 2. Preview (Storybook)

- [x] 2.1 Gradation-scale specimen story under Foundations (replaces the 50–950 ramp boards in `src/foundations/color.stories.tsx`), driven by the real tokens, roles annotated, exercised light + dark via the toolbar; `npm run storybook`

## 3. Implementation

- [x] 3.1 Token layer (`src/index.css`): add authored `--primary-1…-5` / `--secondary-1…-5` to `:root` and `.dark` (design.md decision 3 candidates); delete the derived `--primary-50…950` / `--secondary-50…950` relative-color blocks; update the `@theme inline` color mappings accordingly
- [x] 3.2 Contrast gate (`scripts/check-contrast.mjs`): extend the pairing list per design.md decision 4 (foreground on steps 1–2; steps 4–5 as text on `background` and `card`; both families, both modes)
- [x] 3.3 Principle records (`principles.config.mjs`): add `step-on-color-gradations` (severity error, vendored `ui/` carve-out recorded in the entry with the Phase-2 pointer, specimen scope-outs) and `step-on-type-ramp` (severity error), detection per design.md decision 5 — records as data on the existing check machinery (edit-guard hook picks them up automatically)
- [x] 3.4 Mirrors: regenerate the manifest snapshot; update the Figma manifest/lock expectations for authored (not derived) variables — no MVDS Core library sync in this change (only on explicit ask)
- [x] 3.5 Docs: rewrite the `AGENTS.md` golden-rule bullet ("scale ramps are tokens too…") and the `docs/THEMING.md` ramp recipe to the authored 1–5 contract ("a brand authors its own five per family")
- [x] 3.6 In-repo migration: rewrite the color specimen off ramp steps; sweep for any other `primary-*`/`secondary-*` 50–950 or brand-family alpha/`color-mix` usage outside carve-outs and migrate or `mvds-allow` with reasons
- [x] 3.7 Update `openspec/changes/scoped-theming/` requirement 3 respec note is unblocked (respec itself lands in that change, not this one)

## 4. QA

- [x] 4.1 Manual walkthrough of the Outcomes: pick steps by role in a scratch composition, both modes; confirm 50–950 classes are gone
- [x] 4.2 `npm run build` && `npm run check:contrast` && `npm run check:principles` && `npm test` — all green, light + dark
- [x] 4.3 Chromatic: only intended diffs (specimen board changes); component stories show zero diffs
