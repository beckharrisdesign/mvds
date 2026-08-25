## Outcomes

- **Who:** See proposal — agents and humans reading the manifest as encoded strategy; the vendored `ui/` components; every brand beyond the default.
- **Job:** Retire the `VENDORED_UI` carve-out and narrow `step-on-color-gradations` to what it means: gradation steps govern authored surfaces, interaction states derive from the variant's own rest token.
- **Done when:** See proposal — no brand alpha in `ui/`, scope excludes nothing, state-variant mixes exempt while every alpha and non-state brand mix still errors.
- **Not doing:** Status-triad gradations; non-brand alpha in `ui/`; hover-state contrast checking (needs new token surface — owner-gated).

## MODIFIED Requirements

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
