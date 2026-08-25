# ui-de-alpha — tasks

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Ad-hoc brand tints are flagged with the stepped alternative — `bg-primary/10` in non-carved-out code errors in `check:principles` citing `step-on-color-gradations`
- [x] 1.2 Vendored ui/ is in scope for the stepping rule — a `src/components/ui/` file containing `hover:bg-primary/80` errors; no `VENDORED_UI` exclusion applies
- [x] 1.3 Interaction states may derive from the rest token — a state-variant `color-mix` does not error, while the same mix outside a state variant still does

## 2. Preview (Storybook)

- [x] 2.1 Button hovers verified live in Storybook, not just via the gates — hover resolves to `oklch(0.364)` = `#3e3e3e` (light) and `#b3b3b3` (dark) on the default variant, `#e7e7e7` / `#2f2f2f` on secondary. **Sample past the 0.15s `transition-all` window**: reading computed style immediately after hover returns the pre-transition value and looks like "no hover at all" (this cost a full false-alarm cycle — see design.md Context)

## 3. Implementation

- [x] 3.1 `src/components/ui/button.tsx`: default variant `hover:bg-primary/80` → `hover:bg-[color-mix(in_oklch,var(--primary),var(--background)_20%)]`; secondary left untouched (design.md decisions 2–3)
- [x] 3.2 `principles.config.mjs`: `VENDORED_UI` removed from the `step-on-color-gradations` exclude list; `description`/`rationale`/`fix` rewritten to state the authored-surface vs interaction-state split, with the terracotta evidence recorded in the record itself
- [x] 3.3 `principles.config.mjs`: pattern narrowed via negative lookbehind so a `color-mix` inside `hover:`/`focus:`/`focus-visible:`/`active:bg-[…]` is exempt while all alpha forms and non-state brand mixes still error (design.md decision 4)
- [x] 3.4 `scripts/check-contrast.mjs`: confirmed unchanged — under a relative mix there are no fixed step pairings to add
- [x] 3.5 Verified the sweep is complete: the principle's regex over `src/` and `examples/` returns zero brand-alpha matches

## 4. QA

- [x] 4.1 Regex behaviour verified against 11 shapes — all alpha forms, bare/style-prop brand mixes flagged; state-variant mixes, real gradation steps, `-foreground/` variants and status tints clean
- [x] 4.2 `npm run build` && `npm run check:contrast` && `npm run check:principles` && `npm test` — all green, light + dark, zero `mvds-allow` suppressions added
- [x] 4.3 Chromatic: no diffs expected — rest states untouched and no story forces a hover, so the one changed colour is not captured
