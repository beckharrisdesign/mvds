# Capability: theme-presets

> Canonical spec. Promoted from `openspec/changes/scoped-theming/` when that
> change was archived (2026-08-25, shipped in PR #83). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Outcomes

- **Who:** Consumers who want a second brand without authoring one — starting with the terracotta palette the Etsy Listing Kit hand-rolled off-system.
- **Job:** Import a named, ready-made brand and apply it to a scope (or a whole app) with zero hand-written token values.
- **Done when:** See proposal — a terracotta preset ships in the package, is applied via the scope from a verified consumer example, and its pairings clear the same AA bar as the defaults.
- **Not doing:** A preset gallery; per-preset Figma variable modes; additional presets beyond terracotta in this change.

## Requirements

### Requirement: A terracotta preset ships in the package

A consumer imports one stylesheet from the published package (e.g. `@beckharrisdesign/mvds/themes/terracotta.css`) and `data-brand="terracotta"` works — light and dark values for every overridable brand role **plus the brand's authored gradation steps (`primary-1…5` / `secondary-1…5`, per the `stepped-scales` contract)**, no hand-written tokens. `docs/THEMING.md` documents the two-step recipe (import + wrap).

**Fails until:** The package exports the preset file and the documented two steps produce a terracotta sub-tree in a consumer app.

#### Scenario: Preset applies in two steps from the published package

- **WHEN** a consumer imports the terracotta preset stylesheet and wraps a sub-tree in `data-brand="terracotta"`
- **THEN** MVDS components inside render the terracotta brand in both modes, with no token values authored by the consumer

### Requirement: Preset pairings clear token-level AA

Every preset ships held to the same contrast bar as the default brand: each foreground/background pairing the token gate checks today is also checked for each preset, light and dark.

**Fails until:** `npm run check:contrast` iterates presets and fails on any preset pairing below AA.

#### Scenario: Contrast gate covers the preset

- **WHEN** `npm run check:contrast` runs
- **THEN** terracotta's token pairings are validated at WCAG AA in both modes alongside the defaults, and a failing pairing fails the gate
