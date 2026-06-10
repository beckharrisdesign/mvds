# Code ↔ Figma sync

**Code is law. Figma is a generated mirror.**

> **Generated Figma file:** ["MVDS Core"](https://www.figma.com/design/C20nU0mROzk3Zr0I9BELJF/MVDS-Test)
> (team: Beck Harris Design). Generated from this repo:
> - `Tokens` variable collection — colors with Light/Dark modes
> - `Scales` variable collection — spacing + breakpoint numbers
> - Type ramp **text styles** (`Type/Display` … `Type/Caption`)
> - `Button` / `Badge` / `Card` component sets (manifests in `figma/components/`)
> - Foundation specimens: Spacing scale, Type ramp, Breakpoints
>
> The sync target's fileKey is `C20nU0mROzk3Zr0I9BELJF`.

This repo is the source of truth. The Figma library is regenerated from the code,
not hand-maintained. On a Figma **Pro** plan this link is **one-way (code → Figma)**
and **re-runnable** — see [Why one-way](#why-one-way-the-pro-tier-reality) below.

```
  src/index.css  ──►  mvds-figma-token-sync      ──►  Figma file (Beck Harris Design)
  (token layer)         (Figma MCP, Plugin API)          · Tokens/Scales variables (light/dark)
                                                         · Type/* text styles
  figma/components/   ─►  mvds-figma-component-sync ──►  · Button/Badge/Card component sets
  *.figma.mjs (authored     (Figma MCP, Plugin API)        (axes = code API, props bound to
   manifests, check:figma)                                  variables; founder publishes = merge)
        ▲
        └── src/components/ui/*.tsx — Storybook renders the same files = live gallery
```

## The loop

1. **Build / edit in code.**
   - Components: `src/components/ui/*.tsx` (add more with `npx shadcn@latest add <name>`).
   - Tokens: **only** in `src/index.css` (`@theme inline`, `:root` = light, `.dark` = dark).
2. **Verify in Storybook** — `npm run storybook`. Stories are co-located (`*.stories.tsx`)
   and are the canonical, diffable surface the Figma generation references.
3. **Sync to Figma (re-runnable, on explicit request only).** Two repo-native skills,
   in order (each loads `/figma-use` first):
   - **`mvds-figma-token-sync`** — tokens: the `Tokens`/`Scales` variable collections
     (light/dark modes) and the `Type/*` text styles, from `src/index.css`.
   - **`mvds-figma-component-sync`** — components: working component sets whose variant
     axes mirror the code API and whose every fill/spacing/text property is **bound** to
     those variables/styles. The spec is the authored manifests (see
     [Component sync](#component-sync) below), gated by `npm run check:figma`.
   - Both are **idempotent** — they reconcile (adopt/update in place) rather than
     duplicating nodes.
4. **Inspect (read-only on Pro).** `get_variable_defs`, `get_design_context`, `get_screenshot`
   to confirm the Figma mirror matches the code.

## Component sync

The component mirror is driven by **authored manifests** — data, reviewed in PRs,
same philosophy as `principles.config.mjs`:

- [`figma/components/*.figma.mjs`](../figma/components) — one per mirrored component:
  variant axes (drift-guarded against the `cva()`/prop-union truth in the source),
  the auto-layout layer tree, and token bindings. Manifests declare **structure +
  exceptions only**.
- [`figma/conventions.mjs`](../figma/conventions.mjs) — the mechanical mapping rules,
  declared once: `bg-primary` → fill bound to variable `primary`; `bg-destructive/10` →
  fill bound to the derived `destructive-tint` variable (alpha in the value per
  mode — never paint-level opacity, which Figma drops when instances re-resolve
  modes); `px-4` → padding bound to `space-16`;
  `text-small` → text style `Type/Small`; Default + Disabled states only
  (disabled = frame opacity 0.5; hover/focus stay code-only).
- [`figma/figma.lock.json`](../figma/figma.lock.json) — machine-recorded Figma node IDs
  (the package-lock analog). Manifests are reviewed intent; the lock is recorded
  reality, updated by the sync and committed so re-syncs update **in place by ID** —
  node identity is what keeps instances in experiment files alive across syncs.
- **`npm run check:figma`** ([`scripts/check-figma-manifest.mjs`](../scripts/check-figma-manifest.mjs),
  also in CI) — fails when a variant is added/renamed/reordered in code without a
  manifest update, so the mirror can't silently fall behind. It also lints every
  `{ var }`/`textStyle` binding against the token layer.

## Review model: publish is the merge gate

Figma **branching** needs Org/Enterprise, so on Pro the component sync uses the
library-publish flow as its branch-and-merge analog:

1. The sync updates component sets **in place** (instances downstream keep working)
   and writes a **Sync Report** — a dated frame in MVDS Core plus matching markdown.
2. The sync **never publishes.** The founder reviews the report and clicks
   **Publish library**, pasting the report as the version description — that click
   is the merge approval. An unpublished sync is an open PR, not a landed change.
3. Files consuming the library get Figma's standard **library-update prompt** and
   accept changes per-file — existing Figma infra controls what folds into
   working assets.

If the team upgrades to Org/Enterprise: create a branch of MVDS Core in the Figma
UI, run the same sync against the branch, and the Sync Report becomes the
branch-review description. Nothing else changes.

## Why one-way: the Pro-tier reality

The user is on **Figma Pro**, not Organization/Enterprise. That gates the "obvious" sync paths:

| Capability | Needs | On Pro |
| --- | --- | --- |
| **Code Connect** (`*.figma.tsx` + Dev Mode code panel) | Org / Enterprise | ❌ unavailable (no roadmap to Pro) |
| **Variables REST *write* API** (`file_variables:write`) | Enterprise (Tier 3) | ❌ 403 |
| **Figma MCP Plugin-API writes** (`/figma-generate-library`, `use_figma`) | any plan | ✅ **this is our link** |
| Read/inspect (`get_variable_defs`, `get_screenshot`) | any plan | ✅ |
| Variable modes per collection | — | 10 max (Pro) — light+dark uses 2 |

So the MCP plugin flow **replaces** Code Connect as the strong link. Designer edits made
directly to Figma variables are **not** auto-pulled back to code — treat Figma as a
downstream artifact.

## Future-proofing (dormant on Pro)

`code-connect/button.figma.tsx` is authored but **inactive** — Code Connect can't publish
on Pro. If this team upgrades to Organization/Enterprise, run the Code Connect CLI to
activate it and Dev Mode will show real component code. Until then it's documentation.

## Quick commands

```bash
npm run dev              # app demo (Card + Button, light/dark toggle)
npm run storybook        # component gallery — the living design system
npm run build            # typecheck + production build
npm run check:figma      # component manifests vs code — must pass before a sync
npm run build-storybook  # static Storybook
# then, in this agent (on explicit request only):
#   mvds-figma-token-sync       (tokens → variables + text styles)
#   mvds-figma-component-sync   (components → bound component sets)
```
