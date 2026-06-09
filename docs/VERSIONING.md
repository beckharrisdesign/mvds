# Versioning — the coupling contract

> How MVDS versions its **principles and patterns alongside its components**.
> One sentence: **there is one version, and it covers everything.**

MVDS is a single artifact. The components, the layout primitives, the token
layer, and the **principle manifest** ([`principles.config.mjs`](../principles.config.mjs))
all ship from one repo, in one commit stream, and are released together. So they
share **one** version — the `version` in [`package.json`](../package.json),
following [SemVer](https://semver.org/spec/v2.0.0.html).

```
version N of MVDS  =  these components + these primitives + these tokens + these principles
```

This is the lockstep model. It's the only one that's honest with "code is the
single source of truth": a principle and the component it governs are the same
release, so they can never drift out of sync, and a consumer who pins `mvds@x.y.z`
gets a coherent set — not components from one era judged by rules from another.

## Two version numbers, two different jobs

There are two `version` fields in the repo. They are **not** the same axis, and
conflating them is the trap this doc exists to prevent:

| Number | Lives in | Versions | Audience |
|---|---|---|---|
| **Package version** | `package.json` (`0.1.0`) | the **content** — every component, token, and principle | consumers |
| **Manifest schema version** | `principles.config.mjs` (`version: 1`) | the **shape** of the manifest — its check kinds and fields | the runner & `resolveManifest` |

- The **package version** is *the* version of MVDS. When a principle's content
  changes — a rule gets stricter, a new rule is added, a regex is corrected — the
  **package version** moves. Principle content does **not** get its own version.
- The **manifest schema version** (`manifest.version: 1`) is an internal contract
  between the manifest *data* and the code that reads it
  ([`principles.resolve.mjs`](../principles.resolve.mjs), the check runner). It
  bumps **only** when the manifest's *structure* changes — a new `check.kind`, a
  new field on `Principle`, a change to how layers resolve. It is invisible to
  consumers and unrelated to whether any individual rule changed. A release can
  add five new principles without touching `manifest.version`, because the *shape*
  didn't change — only the data did.

Think of it like a file format: the package version is the document, the manifest
schema version is the format the document is written in. You revise the document
constantly; you change the format almost never.

## What bumps the package version

MVDS is **pre-1.0** (`0.x`). Per the house rules, **breaking changes are allowed
in any release until `1.0.0`** — we do not hoard backward compatibility this early
(see [AGENTS.md](../AGENTS.md), "Pre-1.0: breaking changes are fine"). So before
`1.0.0` the SemVer mapping is deliberately loose:

| Change | Pre-1.0 (`0.x`) | Post-1.0 |
|---|---|---|
| A principle gets **stricter** (flags code that previously passed) | **minor** | **major** — it's breaking for consumers' code |
| A **new `error` principle** is added | **minor** | **major** |
| A **new `warn` principle**, or one scoped narrowly | **minor** | **minor** |
| A principle is **relaxed / removed**, or a regex **false-positive** is fixed | **patch** | **minor** (relax) / **patch** (false-positive fix) |
| A component's API changes in a breaking way | **minor** | **major** |
| A new component, primitive, or token | **minor** | **minor** |
| A bug fix with no API or rule-surface change | **patch** | **patch** |

The throughline post-1.0: **a principle becoming stricter is a breaking change**,
because it can turn a consumer's green build red — it is versioned with exactly the
same gravity as a breaking component API change. That symmetry is the whole point
of lockstep.

## The context cascade does not get its own version

The Phase 3 principle cascade (`resolveManifest` / `selectContextLayers`, the
company → experiment → product layers) is **not** a separate versioned axis. A
context layer is configuration that overrides the base manifest at resolution
time; it ships and versions with whatever consumes it. The base manifest a layer
resolves against is always the one in the package at its pinned version. There is
no "principles v2 with components v0.3" — that mix-and-match was considered and
deliberately rejected as surface area MVDS doesn't need.

## In practice

- **Cutting a release:** the `mvds-release-notes` skill drafts per-PR entries into
  **Unreleased**; closing a release rolls them into a dated SemVer section (see
  [CHANGELOG.md](../CHANGELOG.md)) and tags `vX.Y.Z` on the merge commit.
- **Changing a principle:** edit `principles.config.mjs`, classify the change with
  the table above, and let it ride the next package version. Leave
  `manifest.version` alone unless you changed the manifest's *shape*.
- **Changing the manifest shape:** bump `manifest.version`, and update
  [`principles.types.ts`](../principles.types.ts) and the runner together — this is
  the rare case.
