# Capability: type-runtime-tokens

> Canonical spec. Promoted from `openspec/changes/themeable-typography/` when that
> change was archived (2026-08-25, shipped in PR #84). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Purpose

Typography is themeable the way color is: faces and per-step sizes live in the runtime token layer and are consumed by the ramp utilities through `var()`, so plain CSS overrides them app-wide or inside a `data-brand` sub-tree. The semantic ramp steps stay the only type API — shape (weight, tracking) remains contract.

## Outcomes

- **Who:** Consumers and brands giving a product its own type voice — app-wide or on a `data-brand` sub-tree; agents, for whom the semantic ramp steps stay the only type API.
- **Job:** Theme typography the way color is themed — one runtime token overrides a face or a step's size, in plain CSS, at whatever scope.
- **Done when:** See proposal — faces and per-step sizes live in the runtime token layer, consumed via `var()` by the ramp utilities; overrides work app-wide and inside `data-brand` scopes; the seam is render-tested.
- **Not doing:** Runtime knobs for weight/tracking (shape stays contract); per-mode type values; new or renamed ramp steps.

## Requirements

### Requirement: One token restyles a face

The two face tokens (`--font-sans`, `--font-heading`) are declared in the runtime layer (`:root`) and the ramp utilities consume them via `var()`. Heading steps (`text-display`, `text-h1`…`text-h4`) render in `--font-heading`, which defaults through `--font-sans` — so the token stops being inert without changing anything until a brand opts in.

**Fails until:** Overriding `--font-heading` in plain consumer CSS (no `@theme` block required) restyles every heading with zero markup changes — and the same declaration inside a `data-brand` block scopes to that wrapper.

#### Scenario: Headings follow one face override

- **WHEN** a consumer sets `--font-heading` (e.g. to a serif) in their own `:root` brand layer
- **THEN** every `text-display`/`text-h1`…`text-h4` renders the new face while `text-body-lg`/`text-body`/`text-small`/`text-caption` stay on `--font-sans`

#### Scenario: A scoped brand carries its own heading face

- **WHEN** a `data-brand` block declares `--font-heading` and a sub-tree wears that attribute
- **THEN** headings inside the wrapper render the brand's face and identical headings outside keep the host's

### Requirement: Step sizes adjust in the consumer's environment

Each ramp step's size is a runtime token (e.g. `--text-h1-size`) declared in `:root` and consumed via `var()` by the step's utility. Line-heights remain unitless step constants, so an adjusted size keeps its proportional leading automatically.

**Fails until:** Overriding a step-size token in plain consumer CSS resizes every use of that step, with leading following, and no markup changes.

#### Scenario: A step size adjusts from the consumer's stylesheet

- **WHEN** a consumer sets a step-size token (e.g. a larger `--text-display-size`) in their own stylesheet
- **THEN** every element on that step renders the new size with proportional line-height, and all other steps are unchanged

### Requirement: The seams are render-tested, not just declared

A story exercises both seams in a real browser: a wrapper sets `--font-heading` and a step-size token inline, and the test asserts the computed font-family of a heading child and the computed font-size of the adjusted step change, while body copy's face and the other steps' sizes do not — so no seam can silently regress to inert.

**Fails until:** The override story exists and its play assertions pass in light and dark.

#### Scenario: Override story proves the seams

- **WHEN** the type override story renders with `--font-heading` and a step-size token set on its wrapper
- **THEN** the heading's computed face and the adjusted step's computed size are the overrides, and body face plus untouched steps remain default
