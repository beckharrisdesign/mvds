# `.upstream/` — the hub baseline. Do not edit.

Verbatim copies of
[`beckharrisdesign/experiment-hub`](https://github.com/beckharrisdesign/experiment-hub)
`openspec/schemas/experiment-hub-lite/` at the commit named by `x-source:` in
[`../schema.yaml`](../schema.yaml).

These files exist for one job: they are the fixed point that separates the two
kinds of difference between MVDS's copy and the hub's original.

| Comparison | Meaning |
| --- | --- |
| **upstream HEAD vs baseline** | what the hub changed since we copied — **the signal** |
| **local vs baseline** | our deliberate adaptations — expected, should persist |

Without the baseline those two are indistinguishable, and a drift check needs a
hand-maintained allowlist of every adapted line (~40 of ~100 in `schema.yaml`)
to avoid screaming on every run. With it, an empty upstream-vs-baseline diff
means the copy is current — no allowlist, no false positives.

## Working with it

```bash
npm run check:schema-drift          # is the copy behind? (warn-level)
node scripts/check-schema-drift.mjs --diff     # show what moved upstream
node scripts/check-schema-drift.mjs --update   # re-stamp after reconciling
```

`--update` moves the marker — it rewrites these files and the `x-source` line to
the new hub commit. It does **not** decide what MVDS adopts. Reconcile the real
files in [`..`](..) by hand first, porting missed hardening and consciously
leaving deliberate divergence (Storybook over `experiments/*/prototype/`, npm
not pnpm, MVDS tokens and `AGENTS.md`, MVDS Core Figma, no Code Connect, draft
PRs, `feat|fix|docs|chore/` branches).

## Why a copy at all

MVDS bootstrapped `experiment-hub-lite` rather than depending on it — see
[`../../../README.md`](../../../README.md). A published
`@beckharrisdesign/openspec-schemas` would remove the duplication, but two
repos do not justify it; revisit on a third consumer.
