# OpenSpec in MVDS

Bootstrapped from **experiment-hub**’s [`experiment-hub-lite`](https://github.com/beckharrisdesign/experiment-hub) schema so MVDS changes can use the same propose → specs → design (Figma) → tasks → apply loop. A future npm distro may own the shared schema; for now this is a **copy**, adapted for a design-system repo.

**CLI:** `npx @fission-ai/openspec@latest`

**Cursor / Claude:** `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore` — stubs in [`.cursor/commands/`](../.cursor/commands/); workflow in [`skills/openspec-*.md`](../skills/).

| Piece | Path |
|---|---|
| Default schema | [`config.yaml`](config.yaml) → `experiment-hub-lite` |
| Schema + templates | [`schemas/experiment-hub-lite/`](schemas/experiment-hub-lite/) |
| Upstream baseline | [`schemas/experiment-hub-lite/.upstream/`](schemas/experiment-hub-lite/.upstream/README.md) — hub files at the stamped commit |
| Active changes | [`changes/`](changes/) |
| Promoted capabilities | [`specs/`](specs/) |
| Workflow rule | [`rules/openspec-workflow.mdc`](../rules/openspec-workflow.mdc) |

**MVDS adaptations (vs hub):**

- Preview = **Storybook** + `src/components/site/`, not `experiments/*/prototype/`
- UI = **AGENTS.md** tokens/primitives, not hub Tailwind kits
- Figma = **MVDS Core** (`C20nU0mROzk3Zr0I9BELJF`); library sync only when explicitly asked ([`docs/SYNC.md`](../docs/SYNC.md))
- Only **lite** is copied — no `bhd-experiment` / full `experiment-hub` schemas yet

**Staying current:** the copy is stamped `x-source: experiment-hub@<sha>` in
[`schema.yaml`](schemas/experiment-hub-lite/schema.yaml), with the hub files at that commit vendored under
[`.upstream/`](schemas/experiment-hub-lite/.upstream/README.md). `npm run check:schema-drift` re-fetches hub main and
reports what moved since — warn-level in CI. Reconcile row by row (port missed hardening, keep deliberate MVDS
divergence), then `node scripts/check-schema-drift.mjs --update` to re-stamp.

**Workflow:** Human anchor → `/opsx:propose` (one artifact per approval) → iterate Figma in `design.md` → `/opsx:apply` → draft PR per AGENTS.md → `/opsx:archive` after merge.
