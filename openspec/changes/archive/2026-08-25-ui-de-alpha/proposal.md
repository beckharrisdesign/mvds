# ui-de-alpha

## Human anchor

> "make sure we've got a fresh copy and then lets de-alpha" — founder, 2026-08-25, picking the Phase-2 de-alpha off the vision roadmap after reviewing what was in flight.

> "I agree - A" — founder, 2026-08-25, choosing to narrow the principle rather than force components onto fixed gradation steps, after the contrast gate proved a stepped hover breaks non-default brands.

## Outcomes

- **Who:** Agents and humans reading `principles.config.mjs` as the system's encoded strategy (the carve-out is the last "do as I say, not as I do" in the manifest); the vendored `ui/` components, which lose their ad-hoc brand alpha; every brand beyond the default, which a stepped hover would have silently broken.
- **Job:** Remove brand-family alpha from vendored `ui/`, retire the `VENDORED_UI` carve-out on `step-on-color-gradations`, and narrow that principle so it says what it actually means — gradation steps govern **authored surfaces**, while **interaction states** derive relatively from the variant's own rest token.
- **Done when:** No brand-family alpha remains in `src/components/ui/` (today that is one hover: `hover:bg-primary/80` on Button's default variant); the record's scope no longer excludes `VENDORED_UI`; its pattern exempts state-variant `color-mix` and still flags every alpha and every non-state brand mix; the promoted `scale-stepping-principles` spec drops its "carved out until Phase 2" language and gains the state-modulation exemption; all four gates pass with zero `mvds-allow` suppressions.
- **Not doing:** Status-triad gradations (`bg-success/10` stays sanctioned — the triad has no gradation scale); non-brand alpha in `ui/` (`ring-ring/50`, `ring-foreground/10`, `dark:bg-input/30`); gradation token value changes; **hover-state contrast checking**, which stays uncovered by the token gate (see Risks — it needs new token surface and is owner-gated).

## Why

The `step-on-color-gradations` principle shipped with its own exception: vendored `ui/` was scope-excluded because Button still modulated brand color via alpha. Stepped-scales (#82) deferred that migration deliberately, and the carve-out was recorded as visible, dated data precisely so it would be paid down.

The first attempt paid it down the obvious way — swap the alpha for a fixed gradation step (`hover:bg-primary-4`, `hover:bg-secondary-2`/`-3`). Adding the hover pairings to `check:contrast` immediately failed on a real brand: `terracotta/dark: secondary-foreground on secondary-3 — 2.78:1`. The cause is structural, not a bad value: **nothing binds `--primary`/`--secondary` to a rung on their own gradation ladder.** The default brand seats them exactly on steps (primary ≡ step 5; secondary ≡ step 1 light, step 2 dark), which is why the approach looked clean and the Figma frames looked perfect. Terracotta lands *between* steps, at a different rung per mode, and inverts the relationship in dark (its `--secondary` is a light surface with dark text where the default's is the reverse). A hover pinned to a fixed step is therefore a brand-specific guess.

The code being removed was, ironically, already brand-safe: `color-mix(in oklch, var(--secondary), var(--foreground) 5%)` is not alpha at all — it yields an opaque color derived *relatively* from the rest token, so it self-scales to any brand and can only shift contrast slightly. The real defect was the one true alpha (`hover:bg-primary/80`), which composites against whatever happens to sit behind the button rather than against a known color. So the change keeps the relative mechanism, converts the alpha to it, and teaches the principle the distinction it was always implying.

## What changes

- `src/components/ui/button.tsx`: default variant `hover:bg-primary/80` → `hover:bg-[color-mix(in_oklch,var(--primary),var(--background)_20%)]` — the same 80/20 relationship the alpha expressed, now opaque and independent of what is painted behind. **Not pixel-identical:** alpha composites in sRGB while `color-mix` interpolates in oklch, so the light-mode hover moves `#454545` → `#3e3e3e` (marginally darker). `in srgb` would match exactly, but oklch is the system's color space — every token and the existing secondary mix use it — and it keeps the 20% perceptually predictable on saturated brand colors instead of shifting chroma unevenly. The secondary variant is **unchanged**: its existing `color-mix` is the sanctioned pattern this change ratifies.
- `principles.config.mjs`, `step-on-color-gradations`: `VENDORED_UI` removed from `exclude`; the color-mix half of the pattern gains a negative lookbehind exempting mixes that sit directly inside a state-variant arbitrary value (`hover:`/`focus:`/`focus-visible:`/`active:bg-[…]`); `description`, `rationale`, and `fix` rewritten to state the authored-surface vs interaction-state split and record why (with the terracotta evidence).
- `openspec/specs/scale-stepping-principles/spec.md`: MODIFIED — `ui/` is in scope, and state modulation is a declared exemption rather than an undocumented gap.
- `scripts/check-contrast.mjs`: **unchanged.** The earlier plan to add hover pairings is withdrawn — under a relative mix there are no fixed step pairings to check (see Risks).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `scale-stepping-principles`: the color-gradation stepping requirement now covers vendored `ui/`, and carves interaction-state modulation out of the stepping rule by design rather than by scope.

## Impact

- `src/components/ui/button.tsx`, `principles.config.mjs`, `openspec/specs/scale-stepping-principles/spec.md`.
- Gates: `check:principles` newly enforces the rule over `ui/`; `check:contrast` is untouched (104 pairings, 2 brands, still green); `npm test` re-verifies stories light + dark.
- Chromatic: **no diffs expected in practice** — rest states are untouched and no story forces a hover, so the one changed color (`#454545` → `#3e3e3e` on the default variant's hover) is not captured. Verified in-browser instead: hovering resolves to `oklch(0.364)` = `#3e3e3e` in light, `#b3b3b3` in dark, with secondary at `#e7e7e7` / `#2f2f2f`.
- Vision roadmap: closes the "ui/ de-alpha" item. Remaining Phase-3 item is per-context principle variance.

## Optional links

- Origin: `openspec/changes/archive/2026-08-25-stepped-scales/` (proposal "Not doing" names this as the Phase-2 follow-up)
- Evidence for the redesign: `src/themes/terracotta.css` vs the `:root`/`.dark` blocks in `src/index.css`
- House rules: `AGENTS.md`
