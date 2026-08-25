# Capability: scale-stepping-principles

> Canonical spec. Promoted from `openspec/changes/stepped-scales/` when that
> change was archived (2026-08-25, shipped in PR #82), then modified by
> `ui-de-alpha` (2026-08-25, shipped in PR #95) — which retired the vendored
> `ui/` carve-out and exempted interaction states. Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Outcomes

- **Who:** Agents generating UI (the stepping rule is the guidance they act on); reviewers reading the manifest as the system's encoded strategy.
- **Job:** Encode "you step between values on the scale by default" as manifest principles for color gradation and typography size — the same data shape, scoping, and enforcement rails as the spacing rules.
- **Done when:** See proposal — two records in `principles.config.mjs`, enforced by `check:principles` with deliberate scopes/carve-outs.
- **Not doing:** New prose-only rules (records ride the existing manifest machinery); rewriting vendored `ui/` internals to comply (that is the Phase-2 de-alpha change).

## Requirements

### Requirement: Color-gradation stepping is a machine-enforced principle

A manifest record (`step-on-color-gradations`) makes stepping the rule for brand-family **surface** color: tints/shades of `primary`/`secondary` come from gradation steps, not ad-hoc alpha (`bg-primary/10`) or arbitrary `color-mix()`. Severity `error`, scoped over all source **including the vendored `ui/` internals** — the Phase-2 carve-out is retired — with specimen stories carved out as today. **Interaction states are exempt**: a hover/focus/active fill derives from the variant's own rest token, because gradation steps are absolute positions and no contract binds a semantic token to a rung on its own ladder.

**Fails until:** `check:principles` (and the edit-guard hook) flags brand alpha anywhere in `src/components/ui/`, flags a brand `color-mix()` outside a state variant, and stays silent on one inside a state variant.

#### Scenario: Ad-hoc brand tints are flagged with the stepped alternative

- **WHEN** `npm run check:principles` runs over non-carved-out code containing `bg-primary/10`
- **THEN** it errors citing `step-on-color-gradations` and points to the gradation step tokens as the fix

#### Scenario: Vendored ui/ is in scope for the stepping rule

- **WHEN** `npm run check:principles` runs over a `src/components/ui/` file containing `hover:bg-primary/80`
- **THEN** it errors citing `step-on-color-gradations` — no `VENDORED_UI` exclusion applies

#### Scenario: Interaction states may derive from the rest token

- **WHEN** `npm run check:principles` runs over a state-variant fill such as `hover:bg-[color-mix(in_oklch,var(--primary),var(--background)_20%)]`
- **THEN** it does not error, while the same `color-mix()` outside a state variant still errors citing `step-on-color-gradations`

### Requirement: Type-ramp stepping is a machine-enforced principle

A manifest record (`step-on-type-ramp`) turns the existing prose golden rule into data: typography size/weight comes from the semantic ramp (`text-display`…`text-caption`), never generic size utilities (`text-2xl`, `text-sm`) or arbitrary sizes (`text-[17px]`). Severity `error`, same scope treatment as other principles; violations surfaced at apply are fixed or suppressed inline with a reasoned `mvds-allow`.

**Fails until:** `check:principles` flags a generic/arbitrary text-size utility in scoped files and names the ramp alternative.

#### Scenario: Ad-hoc type sizes are flagged with the ramp alternative

- **WHEN** `npm run check:principles` runs over scoped code containing `text-2xl font-bold`
- **THEN** it errors citing `step-on-type-ramp` and points to the semantic ramp steps as the fix
