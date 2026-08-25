# Capability: scale-stepping-principles

> Canonical spec. Promoted from `openspec/changes/stepped-scales/` when that
> change was archived (2026-08-25, shipped in PR #82). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Outcomes

- **Who:** Agents generating UI (the stepping rule is the guidance they act on); reviewers reading the manifest as the system's encoded strategy.
- **Job:** Encode "you step between values on the scale by default" as manifest principles for color gradation and typography size — the same data shape, scoping, and enforcement rails as the spacing rules.
- **Done when:** See proposal — two records in `principles.config.mjs`, enforced by `check:principles` with deliberate scopes/carve-outs.
- **Not doing:** New prose-only rules (records ride the existing manifest machinery); rewriting vendored `ui/` internals to comply (that is the Phase-2 de-alpha change).

## Requirements

### Requirement: Color-gradation stepping is a machine-enforced principle

A manifest record (`step-on-color-gradations`) makes stepping the rule for brand-family color modulation: tints/shades of `primary`/`secondary` come from gradation steps, not ad-hoc alpha (`bg-primary/10`), arbitrary `color-mix()`, or hand-picked values. Severity `error`, with the vendored `ui/` internals carved out via scope until the Phase-2 de-alpha change migrates them (carve-out recorded in the manifest entry itself), and specimen stories carved out as today.

**Fails until:** `check:principles` (and the edit-guard hook) flags a brand-family alpha tint outside the carve-outs and names the gradation alternative.

#### Scenario: Ad-hoc brand tints are flagged with the stepped alternative

- **WHEN** `npm run check:principles` runs over non-carved-out code containing `bg-primary/10`
- **THEN** it errors citing `step-on-color-gradations` and points to the gradation step tokens as the fix

### Requirement: Type-ramp stepping is a machine-enforced principle

A manifest record (`step-on-type-ramp`) turns the existing prose golden rule into data: typography size/weight comes from the semantic ramp (`text-display`…`text-caption`), never generic size utilities (`text-2xl`, `text-sm`) or arbitrary sizes (`text-[17px]`). Severity `error`, same scope treatment as other principles; violations surfaced at apply are fixed or suppressed inline with a reasoned `mvds-allow`.

**Fails until:** `check:principles` flags a generic/arbitrary text-size utility in scoped files and names the ramp alternative.

#### Scenario: Ad-hoc type sizes are flagged with the ramp alternative

- **WHEN** `npm run check:principles` runs over scoped code containing `text-2xl font-bold`
- **THEN** it errors citing `step-on-type-ramp` and points to the semantic ramp steps as the fix
