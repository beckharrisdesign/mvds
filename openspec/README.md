# OpenSpec in MVDS

Bootstrapped from **experiment-hub**’s [`experiment-hub-lite`](https://github.com/beckharrisdesign/experiment-hub) schema, then evolved: the default `mvds-default` schema runs propose → specs → **discovery (eval)** → design (Figma + eval delta) → tasks → apply. The hub copy remains untouched as the archived baseline. A future npm distro may own the shared schema; for now this is a **copy plus a deliberate fork**, adapted for a design-system repo.

**CLI:** `npx openspec` — `@fission-ai/openspec` is a **devDependency**, so `npm install` provides it (in worktrees too) and `package-lock.json` pins the version. Do not call `@latest`: that re-downloads on every invocation and floats the tool that drives this workflow, which is the same currency problem the schema copy has.

**Cursor / Claude:** `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` — stubs in [`.cursor/commands/`](../.cursor/commands/); workflow in [`skills/openspec-*.md`](../skills/).

| Piece | Path |
|---|---|
| Default schema | [`config.yaml`](config.yaml) → `mvds-default` |
| Default schema + templates | [`schemas/mvds-default/`](schemas/mvds-default/) — fork of lite + the discovery eval stage (openspec: adding-eval-gate) |
| Archived hub mirror | [`schemas/experiment-hub-lite/`](schemas/experiment-hub-lite/) — byte-identical, drift-watched; selectable per-change |
| Upstream baseline | [`.upstream/`](../.upstream/README.md) — hub files (schema + skills) at the stamped commit |
| Active changes | [`changes/`](changes/) |
| Promoted capabilities | [`specs/`](specs/) |
| Workflow rule | [`rules/openspec-workflow.mdc`](../rules/openspec-workflow.mdc) |

**MVDS adaptations (vs hub):**

- Preview = **Storybook** + `src/components/site/`, not `experiments/*/prototype/`
- UI = **AGENTS.md** tokens/primitives, not hub Tailwind kits
- Figma = **MVDS Core** (`C20nU0mROzk3Zr0I9BELJF`); library sync only when explicitly asked ([`docs/SYNC.md`](../docs/SYNC.md))
- Only **lite** is copied from the hub — no `bhd-experiment` / full `experiment-hub` schemas yet; `mvds-default` is MVDS's own fork, not a hub schema

**Staying current:** 14 files are mirrored from the hub — this schema, its four templates, and the nine
[`skills/`](../skills/) files (four of which are byte-identical upstream). They are stamped to one hub commit in
[`.upstream/manifest.json`](../.upstream/README.md), with the hub versions vendored beside it.
`npm run check:upstream-drift` re-fetches hub main and reports what moved since.

Two things watch it: a **warn-level PR job** (`upstream-drift` in `ci.yml`) and a **weekly scheduled workflow**
(`upstream-currency`) that opens a GitHub issue with the diff and closes it when the copy is current again — because a
PR annotation only fires in a week you happen to open a PR. Reconcile row by row (port missed hardening, keep
deliberate MVDS divergence), then `node scripts/check-upstream-drift.mjs --update` to re-stamp.

`rules/*.mdc` is deliberately **not** watched: MVDS's rules are rewritten against `AGENTS.md`, so tracking them would
report chosen divergence forever.

**Workflow (mvds-default):** Human anchor → `/opsx:propose` (one artifact per approval) → specs → **discovery** (`0.0 As-is` → `0.5 Eval` → `0.6 Eval Summary` — founder stop before any proposal exists) → design (`1.0` conditioned on the approved summary; iterate Figma per `rules/figma.mdc`; `1.5 Eval Delta` findings ledger, informational) → tasks → `/opsx:apply` → draft PR per AGENTS.md → `/opsx:archive` after merge.

**The eval:** rubric = `principles.config.mjs` records carrying an `evalLens`
(all ten Nielsen heuristics ship with one); runs in an isolated subagent
(surface + rubric only); evaluates the running Storybook story where one
exists, with the Figma page as visual record; 0.5 baseline cached, iterations
re-run only the delta. Findings ledger over scores — nothing gates on a score.
