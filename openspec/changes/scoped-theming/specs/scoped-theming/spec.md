## Outcomes

- **Who:** Consumer apps hosting more than one brand on one domain (the hub's route-level products); agents building those routes on-system.
- **Job:** Give one sub-tree its own complete brand — every token role, light and dark — without repainting the host and without leaving MVDS.
- **Done when:** See proposal — an attribute scope re-brands everything beneath it, in both modes, ramps included, from a consumer app with zero component edits.
- **Not doing:** Phase-3 principle variance; multi-accent token model; runtime theme-switcher UI; Figma preset sync.

## ADDED Requirements

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

### Requirement: Derived ramps re-derive inside the scope

The `primary-*` / `secondary-*` ramp utilities used inside a branded sub-tree derive from the scope's base tokens, so tints and gradients follow the scoped brand automatically.

**Fails until:** `bg-primary-100` (and peers) rendered inside a `data-brand` wrapper resolve from the scoped `--primary`, not the host's.

#### Scenario: Ramp tints follow the scoped base

- **WHEN** a component inside a `data-brand="terracotta"` wrapper uses a ramp step such as `bg-primary-100`
- **THEN** the rendered color is derived from terracotta's base, while the same class outside the wrapper stays host-derived
