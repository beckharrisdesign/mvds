# OpenSpec in MVDS

Bootstrapped from **experiment-hub**’s [`experiment-hub-lite`](https://github.com/beckharrisdesign/experiment-hub) schema, then evolved: the default `mvds-default` schema runs propose → specs → **discovery (eval)** → design (Figma + eval delta) → tasks → apply. The hub copy remains untouched as the archived baseline. A future npm distro may own the shared schema; for now this is a **copy plus a deliberate fork**, adapted for a design-system repo.

**CLI:** `npx openspec` — `@fission-ai/openspec` is a **devDependency**, so `npm install` provides it (in worktrees too) and `package-lock.json` pins the version. Do not call `@latest`: that re-downloads on every invocation and floats the tool that drives this workflow, which is the same currency problem the schema copy has.

**Cursor:** `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` — stubs in [`.cursor/commands/`](../.cursor/commands/); workflow in [`skills/openspec-*.md`](../skills/).

**Claude Code:** `/opsx-propose`, `/opsx-apply`, `/opsx-archive`, `/opsx-explore` — one `SKILL.md` per phase under [`.claude/skills/opsx-*/`](../.claude/skills/). Claude Code discovers `.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat files only, so the flat `skills/*.md` symlinks under `.claude/skills/` are **not** loaded as commands there — each directory below is the entry point that makes its phase a real command, and each delegates to the matching [`skills/openspec-*.md`](../skills/) as its single source of truth rather than restating the workflow. Cursor's `/opsx:*` and Claude Code's `/opsx-*` differ by one character — a colon in a skill directory name would collide with the `plugin:skill` namespace syntax.

Two frontmatter fields carry policy across those four:

- **`model:`** — the **per-phase model policy**. Only [`opsx-apply`](../.claude/skills/opsx-apply/SKILL.md) sets it (`model: sonnet`): apply is mechanical execution against an already-approved `tasks.md`, so it downshifts. Propose / explore / archive set nothing and inherit the founder's `/model` choice — they are judgment work (house rules, the Figma gate, reconciling delta specs into `specs/`). The policy only ever *lowers* the model, never raises it.
- **`disable-model-invocation: true`** — founder-triggered only, never auto-loaded. Set on the two side-effectful phases: [`opsx-apply`](../.claude/skills/opsx-apply/SKILL.md) (commits, pushes, opens PRs) and [`opsx-archive`](../.claude/skills/opsx-archive/SKILL.md) (moves the change directory, rewrites promoted specs, and is only correct *after* the PR merges). `opsx-propose` and `opsx-explore` stay auto-loadable — propose only adds files under `changes/<name>/` behind its own human-anchor and one-artifact-per-turn gate, and explore never writes code at all.

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
- Spec artifacts carry a **`## Purpose`** section above `## Outcomes` — the CLI validator requires it, and a promoted spec without one makes `openspec archive` abort (both schemas' [`templates/spec.md`](schemas/mvds-default/templates/spec.md))

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
