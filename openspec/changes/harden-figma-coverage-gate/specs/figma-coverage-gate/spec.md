## Purpose

Every component in the mirrorable scope is either mirrored into the Figma library
or explicitly recorded as deliberately not mirrored, with a reason — and
`npm run check:figma` derives that census from the filesystem rather than from a
curated list, so a component cannot ship to code or to Figma while staying
invisible to the drift guard.

## Outcomes

- **Who:** the founder reading `npm run check:figma` as the code↔Figma drift
  guard, and any agent that trusts a green result before running a sync.
- **Job:** know that a passing `check:figma` means the whole mirror is accounted
  for — not that a hand-picked subset of it is internally consistent.
- **Done when:** an unclassified component fails the gate; a component recorded
  in the lock with no manifest fails the gate; an exclusion whose component has
  changed shape fails the gate; and declared coverage matches the lock at 19.
- **Not doing:** growing the mirror. The six native auto-layout primitives stay
  native and take exclusion records; `src/components/site/` stays out; no Figma
  write or sync; no component gains a variant.

## ADDED Requirements

### Requirement: Coverage is derived from the filesystem

The gate finds components by walking the mirrorable scope, so the census is the
code itself rather than a list someone remembered to update.

**Fails until:** `check:figma` reports a classified count equal to the number of
component files found under the mirrorable scope, and removing a manifest from
`componentManifests` changes that component from mirrored to unclassified rather
than making it disappear from the count.

SHALL enumerate candidate components from `mirrorScope` include/exclude globs and
classify each one, never from the length of `componentManifests`.

#### Scenario: Walk the mirrorable scope

- **WHEN** `npm run check:figma` runs against the current tree
- **THEN** it reports 25 candidate component files across `ui/`, `forms/`,
  `blocks/` and `layout/`, and the stories files are excluded by glob

### Requirement: An unclassified component fails the gate

A component that is neither mirrored nor explicitly excluded is an error, so the
decision gets made while its author still has the context to make it.

**Fails until:** adding a component file under the mirrorable scope with no
manifest and no exclusion record exits `check:figma` non-zero and names that
file, and the same run passes once the component is either manifested or
excluded.

SHALL treat exactly three states as valid — mirrored, excluded, or a failure —
with no silent fourth.

#### Scenario: A new component lands unclassified

- **WHEN** a component file is added under the mirrorable scope with neither a
  manifest nor an exclusion record
- **THEN** the gate exits non-zero, names the file, and prints both ways to
  resolve it (author a manifest, or record it as deliberately not mirrored)

### Requirement: Exclusions carry a reason and a prop fingerprint

An exclusion records why a component is not mirrored and what it looked like when
that call was made, so the judgment is re-confirmed when its subject changes
rather than inherited forever.

**Fails until:** each record in `notMirrored` carries a non-empty `reason` and a
`props` fingerprint, the gate recomputes each fingerprint from source and exits
non-zero on a mismatch, and editing an excluded component's public props
reproduces that failure.

SHALL recompute every exclusion's prop fingerprint on each run and fail on
mismatch, without inferring whether the component ought to be mirrored.

#### Scenario: An excluded component changes shape

- **WHEN** a component carried by an exclusion record gains, loses or renames a
  public prop
- **THEN** the gate exits non-zero, names the component, and shows the recorded
  fingerprint against the recomputed one so the reason can be re-confirmed

### Requirement: The lock reconciles with the manifests

What Figma actually holds and what the manifests declare are compared in both
directions, so the mirror cannot hold a component nobody declared.

**Fails until:** a component set present in `figma/figma.lock.json` with no
manifest exits `check:figma` non-zero, and a manifest with no lock entry reports
a warning while leaving the exit code clean.

SHALL error on lock-without-manifest and warn on manifest-without-lock, the
latter being a legitimate not-yet-synced state.

#### Scenario: The lock holds an undeclared component

- **WHEN** `figma.lock.json` records a component set that no manifest declares
- **THEN** the gate exits non-zero and names that component set

### Requirement: Input and Dropzone are mirrored

The two components that were already in code and in Figma but absent from the
manifests are declared, so the gate's count reflects the real mirror.

**Fails until:** `figma/components/input.figma.mjs` and
`dropzone.figma.mjs` exist and are listed in `componentManifests`, their axes
match their sources, and `check:figma` reports 19 mirrored with the lock
reconciliation clean.

SHALL mirror `src/components/ui/input.tsx` and
`src/components/forms/dropzone.tsx`, adopting the existing Figma sets by name
(`690:25`, `690:35`) rather than creating new ones.

#### Scenario: Declared coverage matches the lock

- **WHEN** `npm run check:figma` runs after both manifests are authored
- **THEN** it reports 19 mirrored and 6 excluded, 25 classified in total, with no
  lock reconciliation error
