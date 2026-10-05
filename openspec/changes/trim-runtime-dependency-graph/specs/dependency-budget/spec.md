# Capability: dependency-budget

## Purpose

The size and composition of the runtime dependency tree MVDS publishes is a
constraint the repo enforces by machine, not a fact someone has to remember. An
authored ceiling bounds the transitive package count, and tooling-only packages
are kept out of `dependencies` by a check rather than by convention.

## Outcomes

- **Who:** consumers paying the install cost, and the founder reviewing a PR that
  adds a dependency.
- **Job:** keep the published graph small on purpose, and catch a regression in
  review instead of after a release.
- **Done when:** `npm run check:deps` resolves the published tree, compares it to
  an authored ceiling of 54, fails above it, and runs in CI beside the existing
  gates.
- **Not doing:** bounding `devDependencies` (Storybook, Vitest, Playwright, and
  the `openspec` CLI are authoring tools and cost consumers nothing); auditing
  licences or vulnerabilities; replacing Radix as the primitive substrate.

## ADDED Requirements

### Requirement: The published tree is bounded by an authored ceiling

The number of packages a consumer installs is written down in the repo and
enforced, so growth is a decision someone makes rather than something that
happens.

**Fails until:** `npm run check:deps` does not exist, or it passes while the
resolved tree exceeds the authored ceiling.

#### Scenario: the check fails when the tree exceeds the ceiling

- **WHEN** `npm run check:deps` resolves `dependencies` plus peers with
  `npm install --package-lock-only` and counts the transitive packages
- **THEN** it exits non-zero when the count is above the authored ceiling, naming
  the count, the ceiling, and the packages that pushed it over

#### Scenario: Radix is imported scoped, not as the umbrella

- **WHEN** `src/` is searched for Radix imports
- **THEN** the seven component files import the six primitives MVDS actually uses
  as `@radix-ui/react-{label,radio-group,checkbox,switch,select,slot}` rather than
  the `radix-ui` umbrella, `tsup.config.ts` externals match, and the resolved tree
  lands at the ceiling of 54

#### Scenario: the budget runs with the other gates

- **WHEN** CI runs on a pull request
- **THEN** `check:deps` runs alongside `check:contrast`, `check:principles`, and
  `check:upstream-drift`, and a breach blocks the PR the same way they do

### Requirement: Tooling-only packages cannot sit in dependencies

The specific bug this change removes — a CLI in `dependencies` — is caught by a
rule rather than left to review attention.

**Fails until:** a package that declares `bin` and is imported nowhere under
`src/` can be added to `dependencies` with every check passing.

#### Scenario: a bin-only package in dependencies is rejected

- **WHEN** a package declaring `bin`, with no import or `@import` anywhere in
  `src/`, is present in `dependencies`
- **THEN** `check:deps` fails and names the package, pointing at `devDependencies`
  as the correct home
