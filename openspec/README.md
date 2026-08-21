# OpenSpec in MVDS

Bootstrapped from **experiment-hub**’s [`experiment-hub-lite`](https://github.com/beckharrisdesign/experiment-hub) schema so MVDS changes can use the same propose → specs → design (Figma) → tasks → apply loop. A future npm distro may own the shared schema; for now this is a **copy**, adapted for a design-system repo.

**CLI:** `npx openspec` — `@fission-ai/openspec` is a **devDependency**, so `npm install` provides it (in worktrees too) and `package-lock.json` pins the version. Do not call `@latest`: that re-downloads on every invocation and floats the tool that drives this workflow, which is the same currency problem the schema copy has.

**Cursor / Claude:** `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` — stubs in [`.cursor/commands/`](../.cursor/commands/); workflow in [`skills/openspec-*.md`](../skills/).

| Piece | Path |
|---|---|
| Default schema | [`config.yaml`](config.yaml) → `experiment-hub-lite` |
| Schema + templates | [`schemas/experiment-hub-lite/`](schemas/experiment-hub-lite/) |
| Active changes | [`changes/`](changes/) |
| Promoted capabilities | [`specs/`](specs/) |
| Workflow rule | [`rules/openspec-workflow.mdc`](../rules/openspec-workflow.mdc) |

**MVDS adaptations (vs hub):**

- Preview = **Storybook** + `src/components/site/`, not `experiments/*/prototype/`
- UI = **AGENTS.md** tokens/primitives, not hub Tailwind kits
- Figma = **MVDS Core** (`C20nU0mROzk3Zr0I9BELJF`); library sync only when explicitly asked ([`docs/SYNC.md`](../docs/SYNC.md))
- Only **lite** is copied — no `bhd-experiment` / full `experiment-hub` schemas yet

**Workflow:** Human anchor → `/opsx:propose` (one artifact per approval) → iterate Figma in `design.md` → `/opsx:apply` → draft PR per AGENTS.md → `/opsx:archive` after merge.
