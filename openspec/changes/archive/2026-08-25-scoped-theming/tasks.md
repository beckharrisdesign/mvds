# scoped-theming — tasks

> Sequencing: implementation lands **on top of `stepped-scales`** (PR #82) —
> the gradation contract and the 52-pairing gate are its substrate. Do not
> start apply until #82 is merged.

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Sub-tree wears its own brand beside the host brand — Button/Badge/Card inside a `data-brand="terracotta"` wrapper render terracotta while identical components outside keep the host brand
- [x] 1.2 Scoped brand follows the mode toggle — with `.dark` on the root, the wrapper renders terracotta's dark values, light values in light mode
- [x] 1.3 Gradation steps follow the scoped brand — `bg-primary-2` inside the wrapper renders terracotta's authored step, the same class outside renders the host's
- [x] 1.4 Preset applies in two steps from the published package — import `@beckharrisdesign/mvds/themes/terracotta.css` + add the attribute; zero consumer-authored tokens
- [x] 1.5 Contrast gate covers the preset — a terracotta value that breaks any of the shared 52 pairings fails `npm run check:contrast`, naming brand, pairing, and mode

## 2. Preview (Storybook)

- [x] 2.1 "Foundations/Theming — scoped brand" demo story: host strip and a `data-brand="terracotta"` wrapper side by side (components + gradation steps), exercised light + dark via the toolbar, with a play assertion that computed token values differ inside vs. outside the wrapper; `npm run storybook`

## 3. Implementation

- [x] 3.1 `src/themes/terracotta.css` — `[data-brand="terracotta"]` block (11 semantic roles + authored `--primary-1…-5` / `--secondary-1…-5`, light) and `.dark [data-brand="terracotta"], [data-brand="terracotta"].dark` block (dark values); candidates from Figma 03.0 token spec, gate is the authority
- [x] 3.2 Packaging: tsup copies `themes/` into `dist-lib/themes/`; `package.json` gains the `"./themes/*"` export; preset also importable in-repo for the demo story
- [x] 3.3 `scripts/check-contrast.mjs` — brand-aware parsing: for each file in `src/themes/`, read the `[data-brand]` light/dark blocks and run the same `AA_PAIRS` list per brand × mode (missing token in a preset = failure, so presets stay complete)
- [x] 3.4 `docs/THEMING.md` — "Recipe: a second brand on one page" section (two steps: import + wrap; role/gradation authoring rules for custom presets); promote the existing two-line multi-brand aside into this recipe
- [x] 3.5 `examples/starter` — add a small `data-brand="terracotta"` section wired per the recipe (the consumer-side proof; `verify:consumer` exercises it against the published package after the next release)
- [x] 3.6 Demo story per §2 with play assertions covering scenarios 1.1–1.3

## 4. QA

- [x] 4.1 Manual walkthrough of the Outcomes in Storybook: wrapper vs host in both modes; two-step recipe followed verbatim from THEMING.md in the starter
- [x] 4.2 `npm run build` && `npm run check:contrast` (now brands × modes) && `npm run check:principles` && `npm test` — all green, light + dark
- [x] 4.3 Chromatic: only the new Theming demo story adds snapshots; every existing story zero-diff
