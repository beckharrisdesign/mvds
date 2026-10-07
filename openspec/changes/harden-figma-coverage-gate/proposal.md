## Human anchor

> "ok 1 -- and then lets resolve check:figma in a way that will be resilient over time"

## Outcomes

- **Who:** the founder reading `npm run check:figma` as the code↔Figma drift
  guard, and any agent that trusts a green result before running a sync.
- **Job:** know that a passing `check:figma` means the **whole** mirror is
  accounted for — not that a hand-picked subset of it is internally consistent.
- **Done when:** a component that exists in code under a mirrorable path, but is
  neither manifested nor explicitly excluded with a reason, **fails** the gate;
  a component recorded in `figma/figma.lock.json` with no manifest **fails** the
  gate; the mirrorable scope and its exclusions are **data** carrying reasons,
  not paths hardcoded in the script; and Input and Dropzone are manifested, so
  the gate's count is derived from reality rather than from a list.
- **Not doing:** growing the mirror. Declared coverage goes from 17 to 19 and
  stops there, and no component gains a variant. The native auto-layout
  primitives (Stack, Inline, Grid, GridItem, Container, Spacer) **stay native**
  on the existing rationale — Chrome/Section/Layer are visual surfaces so they
  earn component corollaries, while pure-arrangement primitives would mirror as
  empty frames; they get a one-line exclusion record, never a mirror. Also not
  doing: `src/components/site/` (landing-page surface, not DS surface); any
  Figma write or sync (one-way, and only when asked); the lock-schema split of
  token vs component baselines (Copilot's option B on
  beckharrisdesign/mvds#113 — deferred there, still deferred).

## Why

`scripts/check-figma-manifest.mjs` enumerates `componentManifests` from
`figma/components.config.mjs` — a hand-maintained array. It validates each
declared manifest's axes against its source rigorously, but it never asks the
inverse question: *is every component that should be mirrored actually in this
array?* Enrollment is opt-in, so a component ships to both code and Figma while
staying invisible to the guard. That is how the gate reports `✓ 17 component
manifest(s) match their code sources` while the lock records **19**.

This is the same fail-open shape the repo keeps catching in review: a check whose
scope is derived from the thing under test rather than from an independent source
of truth. `check:deps` is the counter-example that works — a ceiling with no
headroom, failing closed by construction.

Measured today: 25 candidate component files across `ui/`, `forms/`, `blocks/`
and `layout/`; 17 manifested with **zero** unresolvable `code.file` joins; 8
unclassified, splitting into 2 genuine gaps (`input.tsx`, `dropzone.tsx`) and 6
deliberate native primitives. Notably the sync skill's prose out-of-scope list
names **five** primitives while the filesystem holds **six** —
`layout/grid-item.tsx` is absent from it. A hand-maintained list had already
drifted, which is the argument for deriving the enumeration rather than curating
it.

## What changes

- The gate gains a **coverage pass** that walks the mirrorable scope, joins each
  component file to a manifest via the existing `code.file` field, and errors on
  any file that is neither manifested nor carried by an explicit exclusion
  record. Three states, no fourth.
- The gate gains a **lock reconciliation** pass: a component set recorded in
  `figma.lock.json` with no manifest is an error (the mirror holds something
  nobody declared); a manifest with no lock entry is a warning (legitimate
  not-yet-synced state).
- The mirrorable scope and the exclusions move into **data** alongside the
  manifests — include/exclude globs plus per-exclusion reasons, mirroring the
  `principles.config.mjs` shape that AGENTS.md calls the spine.
- `Input` and `Dropzone` manifests are authored, bringing declared coverage to
  19 and matching the lock. Safe to author: the sync skill adopts an existing
  component set by name rather than rebuilding it.

## Capabilities

### New Capabilities

- `figma-coverage-gate`: every component in the mirrorable scope is either
  mirrored or explicitly and reasonedly not, and the recorded Figma mirror
  agrees with the declared manifests — enforced, not documented.

### Modified Capabilities

None. The promoted `input` and `dropzone` specs describe the components
themselves; this change adds their Figma mirror coverage without altering their
behaviour.

## Impact

- `scripts/check-figma-manifest.mjs` — new coverage + reconciliation passes.
- `figma/components.config.mjs` (+ a new manifest per missing component under
  `figma/components/`) — gains the scope and exclusion data.
- `npm run check:figma` becomes a gate that can fail on *absence*, so it will
  fail the first time a new component lands unclassified. That is the intent:
  the failure arrives while the author still has the context to classify it.
- No runtime or published-package surface changes; no dependency changes.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md`
- Verification model: `docs/VERIFICATION.md`
