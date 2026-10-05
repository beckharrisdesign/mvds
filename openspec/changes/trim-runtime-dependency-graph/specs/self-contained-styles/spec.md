# Capability: self-contained-styles

## Purpose

The stylesheet entries MVDS publishes resolve entirely from the package's own
files plus its declared runtime dependencies, with no third-party CLI package on
the resolution path. Where upstream CSS is vendored to achieve that, the copy
records its provenance and stays diffable against the source it came from.

## Outcomes

- **Who:** consumers importing `@beckharrisdesign/mvds/styles.css` into a product
  repo, and the agents that read the install cost to judge adoption.
- **Job:** get the token layer and its variant declarations without installing a
  CLI toolchain they will never run.
- **Done when:** `shadcn` no longer appears in `dependencies`, `styles.css`
  resolves with no bare third-party CLI specifier in it, and Storybook renders
  identically in light and dark.
- **Not doing:** changing the variant declarations themselves, altering the
  `add`-then-tune authoring workflow, or touching `tokens.css` (its build already
  strips external `@import`s).

## ADDED Requirements

### Requirement: Published styles resolve without a CLI package

A consumer installing MVDS gets the variant layer from the package itself, not
from a 303-package CLI pulled in to supply 1.6 KB of static CSS.

**Fails until:** `node -e "require('./package.json').dependencies.shadcn"` resolves
to a version string, or `src/index.css` still contains a bare `shadcn/` specifier.

#### Scenario: shadcn leaves the runtime dependency set

- **WHEN** the published `dependencies` and peers are resolved into a lockfile
- **THEN** `shadcn` and its transitive packages are absent, and `shadcn` appears
  under `devDependencies` so `components.json` and `npx shadcn add` keep working

#### Scenario: the variant layer ships as a tracked source file

- **WHEN** `src/index.css` is read
- **THEN** it imports a repo-local file carrying the accordion keyframes, the nine
  `@custom-variant` declarations, and the `no-scrollbar` utility, instead of
  importing them from the `shadcn` package

### Requirement: Vendored CSS records where it came from

A reader can tell at a glance that the file is a copy, which upstream version it
was taken from, and how to check whether that copy has gone stale.

**Fails until:** the vendored file carries no provenance header, or nothing in the
repo can report drift against upstream.

#### Scenario: provenance header names the source and version

- **WHEN** the vendored stylesheet is opened
- **THEN** its header names the upstream package, the exact version vendored, and
  the reason the copy exists, matching how `.upstream/` and `src/components/ui/`
  already document vendored material

### Requirement: Rendered output is byte-for-byte unchanged

Removing the dependency is a packaging change, not a visual one. Nothing a
consumer sees moves.

**Fails until:** any existing gate that passed before the change fails after it.

#### Scenario: every gate stays green across the swap

- **WHEN** `npm run build`, `npm run check:contrast`, `npm run check:principles`,
  and `npm test` run after the vendoring
- **THEN** all pass, and Storybook's visual-regression coverage reports no diff in
  light or dark
