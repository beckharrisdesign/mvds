# scoped-theming — design

> **Pivot note (2026-08-21):** during review of this design the founder asked
> "but why are we deriving the ramp at all?" and redirected ramp handling into
> a new prerequisite change — [`stepped-scales`](../stepped-scales/proposal.md)
> (authored 1–5 gradation scale as a principle; derived 50–950 ramps removed).
> Decisions 1/1a below and Figma pages 01.0/02.0 are the parked record of the
> superseded derivation mechanisms. Spec requirement 3 ("ramps re-derive in
> scope") will be respecced against gradation steps once `stepped-scales` is
> approved; the rest of this change (scoped semantic roles, terracotta preset,
> gate coverage) stands.

## Context

Specs approved 2026-08-21. The mechanism question this artifact settles: the
`primary-*`/`secondary-*` ramps are derived with CSS relative color **inside
`:root`** (`src/index.css:254-276`), so a `--primary` override on a descendant
element would *not* re-derive them — the sub-tree inherits the host's computed
ramp. Mode flipping only works today because `.dark` lands on the same element
as `:root`. Scoped theming needs the derivations to move to where they
re-compute per element.

## Goals / Non-Goals

**Goals:**

- One attribute (`data-brand="terracotta"`) re-brands a sub-tree — components,
  ramps, both modes — with the host untouched outside it.
- A terracotta preset importable from the package; pairings AA-gated.
- The mechanism also fixes scoped *custom* brands (any consumer override on a
  wrapper re-derives ramps), not just presets.

**Non-Goals:**

- Phase-3 principle variance; multi-accent roles; runtime switcher UI.
- Figma variable modes per preset (mirror sync only on explicit request).
- Re-branding the status triad (`success`/`destructive`/`neutral`) per preset —
  status semantics stay system-wide in v1.

## User flow / IA

Consumer flow is two steps, no component edits:

```css
@import "@beckharrisdesign/mvds/styles.css";
@import "@beckharrisdesign/mvds/themes/terracotta.css";
```

```tsx
<Section data-brand="terracotta">…MVDS components…</Section>
```

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/SbghvBWm8gm8lfyo6HwXlN (scratch: "MVDS explore: scoped-theming") |
| As-is page / frame    | `0.0 As is` — "As is — one brand per app (L 1024)": default brand strip + neutral ramp, reconstructed from `src/index.css` (oklch→hex flagged as reference), with the gap annotated |
| Proposed page / frames| `02.0 Propose: scoped-theming update` (current) — "Two brands, one page (light)" (host strip + dashed `data-brand="terracotta"` wrapper with re-branded strip and re-derived primary/secondary ramps); "Two brands, one page (dark)" (same under `.dark`); "Terracotta preset — token spec (draft)" (11 roles × light/dark chips). `01.0` is the superseded first pass (mechanism used a universal `*` rule) |
| Libraries / version   | Values mirror `@beckharrisdesign/mvds@0.3.0` tokens (`src/index.css`); scratch file, not MVDS Core |
| Breakpoints           | L·1024 only — token-level change, no responsive delta |
| Status                | iterating — first pass for founder review |

## Decisions

1. **Ramp derivations are declared per brand-scope root — selector
   `:root, .dark, [data-brand]` — not on `*`.** (Supersedes the `01.0`
   mechanism after founder review, 2026-08-21.) Each scope re-derives
   `primary-*`/`secondary-*` from its own base and the values inherit down
   normally. Two properties the `*` rule would have destroyed are preserved:
   the ramps remain **one parseable token block** (the contract
   `check-contrast.mjs`, `generate-manifest-snapshot.mjs`, and the Figma
   derived-variables lock rely on — they get a one-line selector-match update,
   not a rework), and a preset can **hand-tune any individual ramp step** in
   its own block via the ordinary cascade (formulas come first in source
   order; a tuned step inherits like any token — needed for hues where fixed
   lightness rungs go muddy, e.g. ochre). Tailwind's `@theme inline` mapping
   (`--color-primary-50: var(--primary-50)`) resolves at the use element, so
   utilities pick up inherited scoped values with no further change.
1a. **Ramp contract lands before the preset rides on it (sequencing).** Tasks
   order: first formalize the derivation block as a checked token surface —
   snapshot, contrast gate, and Figma derived-variables lock all become
   per-brand aware, so every theme's derived ramp is computed, recorded, and
   checked (the color ramps get the same first-class treatment as the type
   ramp). Only then does `themes/terracotta.css` ship on top of that
   contract.
2. **Preset selector architecture:**
   `[data-brand="terracotta"] { …light tokens… }` plus
   `.dark [data-brand="terracotta"], [data-brand="terracotta"].dark { …dark
   tokens… }`. Custom-property inheritance carries the brand down the sub-tree;
   the `.dark`-qualified block outranks the light block by specificity.
   Nested scopes work implicitly (innermost declaration wins) — allowed, not
   documented as a feature in v1.
3. **Preset surface = the 11 color roles in the spec frame** (background,
   foreground, card, muted, muted-foreground, border, primary(+fg),
   secondary(+fg), ring). No radius, no status triad, no chrome dimensions.
4. **Terracotta values:** light sourced from the palette ELK hand-rolled
   (`elk.module.css`: ink/surface/border/terracotta `#b24a2e`/ochre
   `#d99a2b`); dark values authored new (warm near-blacks, lifted terracotta
   `#e07a55`). The Figma chips are **draft** — `check:contrast` is the
   authority at apply, and values move if the gate says so (e.g.
   `--secondary-foreground` was already darkened from ELK's `#7a4d12`, which
   fails AA on ochre).
5. **Gate extension:** `check-contrast.mjs` iterates brands × modes
   (`default`, `terracotta` × light, dark) over the same pairing list — one
   loop, not a parallel script.
6. **Packaging:** preset ships as `dist-lib/themes/terracotta.css` with a
   `"./themes/*"` export in `package.json`; tsup copies it like `styles.css`.

## Risks / Trade-offs

- **The parser contract moves one notch:** scripts that match a literal
  `:root {` block must recognize the widened selector list — small, but it
  must land *with* decision 1, or the manifest snapshot silently drops the
  ramps. Chromatic must still show **zero diffs on defaults** — the
  regression tripwire for the selector move.
- Default dark `--border` is alpha (`oklch(1 0 0 / 10%)`); the preset uses
  opaque values — consistent with the Phase-2 opaque-tint direction, slightly
  ahead of the rest of the system.
- The `muted-foreground` never-on-`bg-muted` house rule must hold *per
  preset*; the extended gate enforces it with the same pairing list.
- Two token vocabularies in one consumer (hub's namespaced palette + MVDS
  tokens) can still collide visually; out of scope here, tracked as hub issue
  #285.
