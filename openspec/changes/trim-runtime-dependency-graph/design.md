# trim-runtime-dependency-graph — design

## Context

The published package resolves 386 transitive packages. 303 of them are the
`shadcn` CLI, present solely to satisfy `src/index.css:16`
(`@import "shadcn/tailwind.css"`), which supplies 95 lines / 1.6 KB of static
CSS. A further 29 come from importing the `radix-ui` umbrella (55 declared
dependencies, every primitive) when `src/` uses six. Removing both lands the tree
at 55.

Discovery took the N/A path: nothing rendered changes, and all eleven `evalLens`
rubric records ask questions about a rendered surface. So the design work here is
not a surface proposal. It is the set of packaging decisions that make the swap
faithful, plus the shape of the gate that keeps it from regressing.

## Goals / Non-Goals

**Goals:**

- Remove `shadcn` from `dependencies` without altering a byte of emitted CSS.
- Keep the three published stylesheet contracts (`styles.css`, `tokens.css`,
  `themes/*`) exactly as they are today.
- Import the six Radix primitives directly and keep `tsup` externals truthful.
- Encode the resulting tree size as an enforced ceiling with a readable failure.

**Non-Goals:**

- Changing what `tokens.css` contains. It does not carry the variant layer today,
  and making it do so is a separate question (see Decision 2).
- Bounding `devDependencies`, auditing licences, or scanning vulnerabilities.
- Replacing Radix, or altering any component API, token, or rendered output.

## User flow / IA

N/A — no user-facing flow. The affected path is a consumer's install and build:
`npm install @beckharrisdesign/mvds` resolves 55 packages instead of 386, then
`@import "@beckharrisdesign/mvds/styles.css"` resolves entirely within the
package.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | **N/A — no UI** |
| As-is page / frame | **N/A — no UI**; discovery 0.0 took the same path |
| Proposed page / frame | **N/A — no UI**; no `01.0 Propose:` page |
| Libraries / version | unchanged — MVDS Core untouched, no sync scheduled |
| Breakpoints | unchanged |
| Status | ready for apply |

**N/A — no UI.** Consistent with discovery. No element is added, altered, or
removed from any surface; this change only moves where identical declarations
resolve from. Per AGENTS.md, no Figma sync is scheduled.

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| *(no 0.5/0.6 eval — discovery N/A path)* | — |
| **Don't-break:** rendered output, light and dark | Decisions 1–3 keep emitted CSS byte-identical; proven by `self-contained-styles` requirement 3 running every story in both modes |
| **Don't-break:** `styles.css` / `tokens.css` / `themes/*` contracts | Decision 2 preserves the `tokens.css` strip behaviour explicitly; Decision 3 makes `styles.css` resolve inside the package |
| **Don't-break:** `npx shadcn add` authoring workflow | `shadcn` moves to `devDependencies`, so `components.json` stays valid and the CLI still runs |
| **Tradeoff preserved:** a vendored copy can go stale | Decision 4 makes the retained devDependency the drift oracle, so staleness is detected without a network fetch |

## Eval Delta (1.5)

**N/A.** Discovery ran no 0.5 pass, so there is no cached baseline to disposition
against and no `0N.5 Eval Delta` page. If design had moved a surface, the correct
response would have been to reopen discovery and run the real baseline rather than
synthesise one here.

## Decisions

### D1 — The vendored CSS is a tracked source file, not inlined

`src/shadcn-variants.css`, imported from `src/index.css` where line 16 sits today.
Keeping it separate preserves the token layer's readability (`src/index.css` is
the documented single source of truth for *tokens*; 95 lines of upstream variant
plumbing would bury that) and gives the drift check in D4 a single file to
compare.

### D2 — `tokens.css` must not gain the variant layer

This is the trap in the change, and it is silent. The `tokens.css` build in
`tsup.config.ts` strips external imports with `!/^@import "[^.]/`, which keys on
the character after the opening quote:

| Line | Today |
| --- | --- |
| `@import "shadcn/tailwind.css";` | **stripped** |
| `@import "./shadcn-variants.css";` | **kept** |

A naive vendoring therefore flips `tokens.css` from *excluding* the variant layer
to *including* it — a change to a published export's contract, made by accident,
while the stated goal is zero behaviour delta.

**Decision:** extend the strip rule so the vendored import is dropped too, keeping
`tokens.css` byte-identical to what ships today. The filter stops being "strip
bare specifiers" and becomes "strip the external/vendored layer", expressed as an
explicit list so the intent is readable rather than inferred from a regex.

Whether `tokens.css` *ought* to carry the variants is a real question — a consumer
using `tokens.css` with MVDS components arguably needs `data-open:` and friends
registered. It is also out of scope here, and the proposal's "Not doing" already
excludes it. Worth its own change.

### D3 — `tsup` must copy the vendored file into `dist-lib/`

`onSuccess` currently copies `src/index.css` → `dist-lib/styles.css` and nothing
else from the CSS layer. A relative import that is not copied resolves in the repo
and fails in the published package — the kind of break that passes every local
gate and surfaces only on a consumer's install. The copy step is added alongside
the existing `themes/*` copy, and `verify:consumer` is the existing script
positioned to catch it.

### D4 — The retained devDependency is the drift oracle

`shadcn` does not leave the repo, it moves to `devDependencies`. So CI already has
`node_modules/shadcn/dist/tailwind.css` on disk, and drift detection is a byte
comparison against it — no network fetch, no stamped commit, no vendored baseline
copy.

This is deliberately *not* the `.upstream/` pattern. That machinery exists because
the hub files have no npm presence and must be fetched from git at a stamped
commit. Here the upstream is a package already installed at a lockfile-pinned
version, which makes the simpler mechanism the more reliable one. The provenance
header records the package and version; the check reports a diff when the
installed copy moves.

### D5 — The ceiling is 55, with no headroom

> **Corrected during apply (2026-10-05).** This section first said 54, from a
> probe that resolved `dependencies` plus `react`/`react-dom` but omitted the
> `tailwindcss` peer. The spec's stated methodology is `dependencies` + **peers**,
> under which the real figures are 386 → 55; `tailwindcss` contributes exactly
> itself (one package, no dependencies) to both ends, so every delta and
> percentage in this change is unaffected. The ceiling constant is 55.


The exact measured post-change count. The next dependency addition fails
`check:deps` and requires raising the ceiling in the same PR, which is the point:
growth becomes a reviewable line in a diff rather than a silent accumulation.
Headroom would reintroduce exactly the slack that let a 302-package CLI sit in
`dependencies` through a release.

### D6 — The bin-only rule is narrow on purpose

`check:deps` flags a package in `dependencies` that declares `bin` **and** has no
`import`/`require`/`@import` referencing it anywhere under `src/`. Both conditions
are required. That catches this bug's exact shape without trying to adjudicate
dependency choices in general, and keeps false positives near zero — a CLI the
source genuinely imports still passes.

## Risks / Trade-offs

- **Unfaithful copy.** The whole N/A rests on the vendored 95 lines being exact.
  Mitigated by D4's byte comparison and by requirement 3's full gate run in light
  and dark, with visual-regression coverage as the proof.
- **`tokens.css` regression.** D2 is the specific guard. If it is missed, the
  export silently grows and no existing check notices, because no current test
  asserts `tokens.css` contents. Worth an assertion in the apply step.
- **Published-only breakage.** D3's failure mode is invisible locally. `verify:consumer`
  is the existing guard and should run before release.
- **Ceiling friction.** D5 will interrupt the next legitimate dependency addition.
  That is the intended cost; the alternative is a budget that never fires.
- **Scoped-Radix drift.** Six scoped packages now version independently rather
  than moving together under the umbrella. Lockfile-pinned, and the six are stable
  primitives, but it is more version surface than one entry.
