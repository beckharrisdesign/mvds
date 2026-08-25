# `.upstream/` — the hub baseline. Do not edit.

Verbatim copies of files MVDS mirrors from
[`beckharrisdesign/experiment-hub`](https://github.com/beckharrisdesign/experiment-hub),
at the commit named in [`manifest.json`](manifest.json). Paths mirror the hub's,
which are the same as ours: `.upstream/skills/prd-writer.md` is the hub's
`skills/prd-writer.md`, ours is `skills/prd-writer.md`.

These files exist for one job: they are the fixed point that separates the two
kinds of difference between our copies and the hub's originals.

| Comparison | Meaning |
| --- | --- |
| **upstream HEAD vs baseline** | what the hub changed since we copied — **the signal** |
| **local vs baseline** | our deliberate adaptations — expected, should persist |

Without the baseline those two are indistinguishable, and a drift check needs a
hand-maintained allowlist of every adapted line (~40 of ~100 in `schema.yaml`)
to avoid screaming on every run. With it, an empty upstream-vs-baseline diff
means the copy is current — no allowlist, no false positives. It also means a
hub commit that touches nothing we mirror is correctly reported as *no drift*,
rather than a false alarm from comparing commit ids.

## What is watched

14 files, listed in [`manifest.json`](manifest.json) — the
`experiment-hub-lite` schema, its four templates, and nine `skills/*.md`. Skills
are where duplication is near-total: four are byte-identical to the hub's
(1,469 lines), two differ by two lines. Adding a file to the watch list is one
line in the manifest plus `--update` to fetch its baseline.

**`rules/*.mdc` is deliberately excluded.** MVDS's rules are effectively
rewritten against `AGENTS.md` (`figma.mdc` ~117 changed lines,
`openspec-workflow.mdc` ~80, `github-workflow.mdc` ~61). Watching them would
report divergence we chose on purpose, every run, forever — and a check that
always complains is a check nobody reads.

## Working with it

```bash
npm run check:upstream-drift                        # is the copy behind?
node scripts/check-upstream-drift.mjs --diff        # show what moved upstream
node scripts/check-upstream-drift.mjs --update      # re-stamp after reconciling
```

Two things watch it automatically: the warn-level `upstream-drift` job on every
PR, and the weekly `upstream-currency` workflow, which opens a GitHub issue
carrying the diff and closes it when the copy is current again. The scheduled one
is the one that matters — a PR annotation only fires in a week someone opens a
PR.

`--update` **moves the marker**: it rewrites these files, `manifest.json`, and
the `x-source` line in `schema.yaml` to the new hub commit. It does **not**
decide what MVDS adopts. Reconcile the real files by hand first, porting missed
hardening and consciously leaving deliberate divergence (Storybook over
`experiments/*/prototype/`, npm not pnpm, MVDS tokens and `AGENTS.md`, MVDS Core
Figma, no Code Connect, draft PRs, `feat|fix|docs|chore/` branches).

One divergence lives in the watched files themselves: the `spec.md` template and
the schema's `specs` instruction add a **`## Purpose`** section the hub's copy has
no equivalent for. It is not taste — `openspec validate` errors on a promoted spec
without it, which aborts `openspec archive`. Port it upstream if the hub hits the
same wall; until then, keep it when reconciling.

## Why a copy at all

MVDS bootstrapped `experiment-hub-lite` rather than depending on it — see
[`../openspec/README.md`](../openspec/README.md). A published
`@beckharrisdesign/openspec-schemas` would remove the duplication (the four
byte-identical skills would ride along), but two repos do not justify it;
revisit on a third consumer.
