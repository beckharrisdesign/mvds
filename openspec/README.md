# OpenSpec in MVDS

Bootstrapped from **experiment-hub**’s [`experiment-hub-lite`](https://github.com/beckharrisdesign/experiment-hub) schema so MVDS changes can use the same propose → specs → design (Figma) → tasks → apply loop. A future npm distro may own the shared schema; for now this is a **copy**, adapted for a design-system repo.

**CLI:** `npx openspec` — `@fission-ai/openspec` is a **devDependency**, so `npm install` provides it (in worktrees too) and `package-lock.json` pins the version. Do not call `@latest`: that re-downloads on every invocation and floats the tool that drives this workflow, which is the same currency problem the schema copy has.

**Cursor:** `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` — stubs in [`.cursor/commands/`](../.cursor/commands/); workflow in [`skills/openspec-*.md`](../skills/).

**Claude Code:** `/opsx-apply` — [`.claude/skills/opsx-apply/`](../.claude/skills/opsx-apply/SKILL.md). Claude Code discovers `.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat files only, so the flat `skills/*.md` symlinks under `.claude/skills/` are **not** loaded as commands there — they are read by path off the schema's `instruction` fields, which is how the other three phases still work. Only apply has a directory entry point so far, because only apply needed one: it carries the **per-phase model policy** (`model: sonnet`), downshifting mechanical execution while propose / specs / design inherit the founder's selected model. Cursor's `/opsx:apply` and Claude Code's `/opsx-apply` differ by one character — a colon in a skill directory name would collide with the `plugin:skill` namespace syntax.

| Piece | Path |
|---|---|
| Default schema | [`config.yaml`](config.yaml) → `experiment-hub-lite` |
| Schema + templates | [`schemas/experiment-hub-lite/`](schemas/experiment-hub-lite/) |
| Upstream baseline | [`.upstream/`](../.upstream/README.md) — hub files (schema + skills) at the stamped commit |
| Active changes | [`changes/`](changes/) |
| Promoted capabilities | [`specs/`](specs/) |
| Workflow rule | [`rules/openspec-workflow.mdc`](../rules/openspec-workflow.mdc) |

**MVDS adaptations (vs hub):**

- Preview = **Storybook** + `src/components/site/`, not `experiments/*/prototype/`
- UI = **AGENTS.md** tokens/primitives, not hub Tailwind kits
- Figma = **MVDS Core** (`C20nU0mROzk3Zr0I9BELJF`); library sync only when explicitly asked ([`docs/SYNC.md`](../docs/SYNC.md))
- Only **lite** is copied — no `bhd-experiment` / full `experiment-hub` schemas yet

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

**Workflow:** Human anchor → `/opsx:propose` (one artifact per approval) → iterate Figma in `design.md` → `/opsx:apply` → draft PR per AGENTS.md → `/opsx:archive` after merge.
