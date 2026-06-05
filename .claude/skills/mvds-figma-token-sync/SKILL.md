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
  - `Tokens` — `VariableCollectionId:2:2` — colors + `radius`. Modes: **Light** `2:0`, **Dark** `2:1`.
  - `Scales` — `VariableCollectionId:8:5` — spacing (`space-*`) + breakpoints. Mode: **Value** `8:0`.
- **Text styles:** the 9-step ramp — `Type/Display`, `Type/Heading 1..4`, `Type/Body Large`, `Type/Body`, `Type/Small`, `Type/Caption`.

## Conventions (match exactly — don't impose new ones)

- Variable names are **flat**, matching code token names without the `--`
  (e.g. `sidebar-primary-foreground`, `chart-1`, `space-16`).
- Color variable **scopes:** `["ALL_FILLS", "STROKE_COLOR"]`.
- Color **values** are `{ r, g, b, a }` in 0–1. Code authors tokens in **oklch** —
  convert with `scripts/color.mjs` (`oklchStrToRgb`). The converter reproduces
  Figma's existing values to the digit; validate against an existing variable
  before bulk writes.
- Per-mode mapping: light token (`:root`) → mode `2:0`; dark token (`.dark`) → mode `2:1`.

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
6. **Validate**: re-read the collection — count + spot-check tricky values (alpha
   like dark `sidebar-border`; hued tokens like dark `sidebar-primary`).

## Out of scope

- **No Code Connect** — not used, not planned. Do not add or suggest it.
- The swatch **boards** (frames "Color Tokens — Light/Dark", etc.) are hand-built
  docs and do **not** auto-update from variables — only touch them if asked.
- Components (Button, Card) are separate from token sync.
