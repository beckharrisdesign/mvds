# Capability: scoped-theming

> Canonical spec. Promoted from `openspec/changes/scoped-theming/` when that
> change was archived (2026-08-25, shipped in PR #83). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Purpose

A single brand attribute re-brands everything beneath it — every token role, light and dark, gradation steps included — without repainting the host page and without editing a component. It is how a consumer app hosts more than one brand on one domain while staying on-system.

## Outcomes

- **Who:** Consumer apps hosting more than one brand on one domain (the hub's route-level products); agents building those routes on-system.
- **Job:** Give one sub-tree its own complete brand — every token role, light and dark — without repainting the host and without leaving MVDS.
- **Done when:** See proposal — an attribute scope re-brands everything beneath it, in both modes, gradation steps included, from a consumer app with zero component edits.
- **Not doing:** Phase-3 principle variance; multi-accent token model; runtime theme-switcher UI; Figma preset sync.

## Requirements

### Requirement: A brand attribute re-brands its sub-tree only

Wrapping any element in `data-brand="<name>"` makes every MVDS component inside it render that brand's tokens, while everything outside keeps the host brand.

**Fails until:** A consumer page with a `data-brand` wrapper shows two brands side by side — scoped components re-branded, host components untouched.

#### Scenario: Sub-tree wears its own brand beside the host brand

- **WHEN** a consumer app wraps one route section in `data-brand="terracotta"` while the rest of the page stays on the host brand
- **THEN** Button/Badge/Card inside the wrapper render terracotta tokens and identical components outside it keep the host's tokens

### Requirement: The scope covers both modes

A branded sub-tree honors light and dark: with `.dark` active on the root, components inside the scope render the brand's dark values, not the host's and not the brand's light values.

**Fails until:** The same scoped sub-tree renders the brand's light values in light mode and the brand's dark values in dark mode.

#### Scenario: Scoped brand follows the mode toggle

- **WHEN** `.dark` is toggled on the document root while a `data-brand` wrapper is on the page
- **THEN** components inside the wrapper switch between the brand's light and dark token values

### Requirement: The gradation scale wears the scoped brand

*(Respecced 2026-08-21 after `stepped-scales` landed the authored 1–5 gradation contract — supersedes "derived ramps re-derive inside the scope".)* A brand scope carries its own authored gradation steps: inside a `data-brand` wrapper, the gradation utilities (`bg-primary-2`, `text-primary-5`, `from-secondary-1`, …) render the brand's authored five per family, in both modes, with the same role contract (1–2 tint surfaces · 3 decorative · 4–5 text-safe).

**Fails until:** A gradation utility rendered inside a `data-brand` wrapper resolves to the scoped brand's authored step value, not the host's.

#### Scenario: Gradation steps follow the scoped brand

- **WHEN** a component inside a `data-brand="terracotta"` wrapper uses a gradation step such as `bg-primary-2`
- **THEN** it renders terracotta's authored step-2 value, while the same class outside the wrapper renders the host brand's step
