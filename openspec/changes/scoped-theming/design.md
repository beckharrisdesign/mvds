# scoped-theming — design

> **Pivot note (2026-08-21):** during review of this design the founder asked
> "but why are we deriving the ramp at all?" and redirected ramp handling into
> a new prerequisite change — [`stepped-scales`](../stepped-scales/proposal.md)
> (authored 1–5 gradation scale as a principle; derived 50–950 ramps removed).
> **Resolved same day:** `stepped-scales` was planned, approved, and applied
> (PR #82); R3 here was respecced to "the gradation scale wears the scoped
> brand", and this design is now **v3** — Figma page 03.0, decisions rewritten
> below. Figma pages 01.0/02.0 and the superseded decision text remain the
> parked record of the derivation mechanisms this change no longer needs.

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
| Proposed page / frames| `03.0 Propose: scoped-theming update` (current) — "Two brands, one page (light)" (host strip + dashed `data-brand="terracotta"` wrapper with re-branded strip and the brand's **authored gradation steps 1–5 with roles**); "Two brands, one page (dark)"; "Terracotta preset — token spec (draft)" (11 roles × light/dark chips + authored gradation steps). Superseded: `01.0` (universal-`*` derivation), `02.0` (scope-root derivation) |
| Libraries / version   | Values mirror `@beckharrisdesign/mvds@0.3.0` tokens (`src/index.css`); scratch file, not MVDS Core |
| Breakpoints           | L·1024 only — token-level change, no responsive delta |
| Status                | iterating — first pass for founder review |

## Decisions

1. **Nothing derives — a preset is plain declarations only.** (v3; the 01.0
   universal-`*` and 02.0 scope-root derivation mechanisms are superseded —
   `stepped-scales` removed derivation from the system entirely.) The preset
   stylesheet declares the 11 semantic roles **and** the brand's authored
   gradation steps (`--primary-1…-5` / `--secondary-1…-5`), light block +
   dark block. Custom-property inheritance carries everything down the
   sub-tree; Tailwind utilities resolve at the use element. No selector
   machinery, no parser changes, no formula anywhere.
1a. **Gate parsing for presets:** `check-contrast.mjs` gains brand-aware block
   parsing — for each shipped preset it reads `[data-brand="<name>"]` (light)
   and `.dark [data-brand="<name>"]` (dark) blocks and runs the **same
   52-pairing list** used for the defaults (roles included). One loop over
   brands, not a parallel script.
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

- **Preset drift risk moves to authoring:** with nothing derived, a preset's
  ten gradation values are hand-authored data — the shared contrast gate is
  what keeps them honest (role pairings, both modes, every brand). Chromatic
  must still show **zero diffs on defaults** (presets touch nothing unless a
  wrapper opts in).
- Default dark `--border` is alpha (`oklch(1 0 0 / 10%)`); the preset uses
  opaque values — consistent with the Phase-2 opaque-tint direction, slightly
  ahead of the rest of the system.
- The `muted-foreground` never-on-`bg-muted` house rule must hold *per
  preset*; the extended gate enforces it with the same pairing list.
- Two token vocabularies in one consumer (hub's namespaced palette + MVDS
  tokens) can still collide visually; out of scope here, tracked as hub issue
  #285.
