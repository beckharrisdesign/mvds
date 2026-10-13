---
name: mvds-figma-token-sync
description: Sync MVDS design tokens from code (src/index.css) into the MVDS Core Figma variable collections. Use ONLY when the user explicitly asks to update/sync Figma — never proactively. Covers color (Tokens collection, light + dark) and scales (Scales collection).
---

# MVDS → Figma token sync

Code is the source of truth; Figma ("MVDS Core") is a one-way mirror, updated
**only on explicit request**. This skill encodes the repeatable procedure so the
file's structure isn't re-discovered each time.

**Prerequisite:** load the `figma-use` skill first — it is mandatory before any
`use_figma` call.

## Target

- **fileKey:** `C20nU0mROzk3Zr0I9BELJF` (file "MVDS Core")
- **Collections:**
  - `Tokens` — `VariableCollectionId:2:2` — colors + radius + font-sans. Modes: **Light** `2:0`, **Dark** `2:1`.
  - `Scales` — `VariableCollectionId:8:5` — spacing (`space-*`) + breakpoints. Mode: **Value** `8:0`.
- **Text styles:** the 9-step ramp — `Type/Display`, `Type/Heading 1..4`, `Type/Body Large`, `Type/Body`, `Type/Small`, `Type/Caption`. Each style's
  `fontName` comes from `figma/conventions.mjs` → `typography` (family
  `fontFamily.figma`, style from `weightToFigmaStyle` keyed by the ramp step's
  `--font-weight` in `src/index.css`).
- **Font tokens (TWO of them):** `Typography/font-sans` **and**
  `Typography/font-heading`, both STRING variables (scope `["FONT_FAMILY"]`) in the
  Tokens collection, each the same value in **both** modes (font doesn't vary by
  mode). ❌ **Do NOT bind every `Type/*` style to `font-sans`.** Each ramp step
  binds exactly one of the two, per `conventions.typography.fontTokenByStep`:
  Display + Heading 1–4 → `font-heading`, Body Large / Body / Small / Caption →
  `font-sans`. The family is a token: a rebrand is a one- or two-variable change.

  > **Why this is spelled out.** This file said "bound to every `Type/*` style" and
  > named only `font-sans` until 2026-10-13, while Figma had carried both variables
  > since 2026-08-23. A sync that followed the old wording would have rebound all
  > nine styles to `font-sans` and **passed every gate**, because `--font-heading`
  > aliases `--font-sans` so both resolve to `Inter`. It would have surfaced only
  > once a brand gave headings their own face. `check:figma` **T8** now compares the
  > bound variable by name, so that mistake fails the build instead of shipping.

## Conventions (match exactly — don't impose new ones)

- **Variable names use group prefixes** (added 2026-06-17) — the Figma variable
  panel shows four top-level folders. Map code token names (without `--`) to
  Figma names as follows:
  - All color tokens → `Color/{token-name}` (e.g. `Color/primary`, `Color/border`,
    `Color/gray-50`, `Color/destructive-tint`)
  - Font family token → `Typography/font-sans`
  - Radius tokens → `Sizing/radius`, `Sizing/radius-sm`, `Sizing/radius-md`,
    `Sizing/radius-lg`, `Sizing/radius-xl`
  - Spacing tokens (Scales collection) → `Spacing/space-4` … `Spacing/space-96`
  - Breakpoint tokens (Scales collection) → `Sizing/breakpoint-sm` … `Sizing/breakpoint-2xl`
- Color variable **scopes:** `["ALL_FILLS", "STROKE_COLOR"]`.
- Color **values** are `{ r, g, b, a }` in 0–1. Code authors tokens in **oklch** —
  convert with `scripts/color.mjs` (`oklchStrToRgb`). The converter reproduces
  Figma's existing values to the digit; validate against an existing variable
  before bulk writes.
- Per-mode mapping: light token (`:root`) → mode `2:0`; dark token (`.dark`) → mode `2:1`.
- **Font style names:** take them from `conventions.typography.weightToFigmaStyle`,
  never from memory — Inter's Figma styles contain a **space** (`Semi Bold`, not
  `SemiBold`; Geist is the opposite). `loadFontAsync` fails loudly on the wrong
  form, and every face used across **all modes** must be loaded before any
  `fontFamily` binding / `setValueForMode` on a `FONT_FAMILY`-scoped variable.

## Procedure

1. **Load `figma-use`** (mandatory before `use_figma`).
2. **Inspect first** (read-only `use_figma`): list collections, modes, existing
   variable names + scopes; confirm the file is MVDS Core. Never assume a token is
   absent — e.g. `popover` already existed but wasn't swatched on the board.
3. **Diff** `src/index.css` tokens against the collection. Create/update only what
   is missing or changed.
4. **Convert** oklch → rgb with the `scripts/color.mjs` math (paste the converter
   into the `use_figma` script, or precompute).
5. **Write incrementally** (≤10 variables per `use_figma` call):
   `createVariable(name, collection, "COLOR")` → set `scopes` →
   `setValueForMode("2:0", lightRgb)` and `setValueForMode("2:1", darkRgb)`.
   Return all created variable IDs.
6. **Typography** (the font family is a gated token — `check:figma` T6/T7/T8):
   a. Inspect: dump every `Type/*` style's `fontName` **and its `fontFamily`
      bound-variable id** (`style.boundVariables.fontFamily`), then diff against
      `conventions.typography` — this is where live hand-drift in Figma is
      caught (the code↔manifest side is already gated in CI). Dump the binding,
      not just the family: the two font variables resolve to the same string
      today, so `fontName` alone cannot tell them apart.
   b. Ensure **both** STRING variables exist in Tokens (scope `["FONT_FAMILY"]`),
      same value in both modes — `Typography/font-sans` at `fontFamily.figma` and
      `Typography/font-heading` at `fontHeading.figma`.
   c. `await figma.loadFontAsync(...)` for every face in `weightToFigmaStyle`
      (both families, if they ever differ), then per style: set `fontName` per the
      map and bind `fontFamily` to **the variable that step's `fontTokenByStep`
      entry names** — `font-heading` for Display + Heading 1–4, `font-sans` for the
      rest. ❌ Never bind all nine to one variable. **Probe one style first**; if
      binding fails, leave `fontName` direct and record `bound: false` — values
      still match, and T8 downgrades to a warning when `boundVariable` is absent.
   d. **Override sweep:** component text nodes with manifest `fontWeight`
      overrides (e.g. Button Label, Medium) hold node-level `fontName` and do
      NOT follow style retargets — set them to the mapped face explicitly.
   e. Validate: re-read all 9 styles' `fontName`; screenshot the type ramp.
7. **Validate**: re-read the collection — count + spot-check tricky values (alpha
   like dark `sidebar-border`; hued tokens like dark `sidebar-primary`).
8. **Record**: write the `typography` block into `figma/figma.lock.json` —
   `fontFamilyVariable { name, id, value }` + per style `{ id, fontFamily,
   fontStyle, bound, boundVariable, boundVariableId }` (resolved values, even when
   variable-bound; `boundVariable` is the Figma variable NAME that step's
   `fontFamily` binds — T8 compares it against `fontTokenByStep`, so omitting it
   leaves the heading/body split unverified) — then commit
   on a `chore/figma-lock-…` branch and confirm `npm run check:figma` passes
   with **zero** typography warnings. ❌ Never touch the **top-level**
   `syncedAt`/`syncedFromCommit` — that stamp records the last *component* sync
   and belongs to `mvds-figma-component-sync` (step 7). A token run that moved it
   would claim a component baseline it never verified.

## Out of scope

- **No Code Connect** — not used, not planned. Do not add or suggest it.
- The swatch **boards** (frames "Color Tokens — Light/Dark", etc.) are hand-built
  docs and do **not** auto-update from variables — only touch them if asked.
- Components (Button, Card) are separate from token sync.
