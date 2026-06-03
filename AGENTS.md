# AGENTS.md — house rules for this design system

> Canonical instructions for any AI agent (and human) working in this repo.
> `CLAUDE.md` imports this file. Read it before generating UI.

## What this is

An MVP **design system**. **Code is the single source of truth.** The Figma file
is a **generated, one-way mirror** (code → Figma) — never the other way. Stack:
Vite + React + TS, **Tailwind v4** (CSS-first `@theme`), **shadcn/ui**, Storybook.

The whole point of this repo is that *intent is encoded* — so anything you
generate must follow the system, not generic shadcn/Tailwind habits.

## Golden rules (always / never)

- ✅ **Spacing = multiples & fractions of 8.** Use the layout primitives with px
  props (`<Stack gap={16}>`). ❌ Never raw `flex`/`grid` utilities for layout, and
  ❌ never off-grid spacing (`gap-3`=12px, `gap-5`=20px are forbidden).
- ✅ **Type via the semantic ramp** — `text-display`, `text-h1`…`text-h4`,
  `text-body-lg`, `text-body`, `text-small`, `text-caption`. ❌ Never ad-hoc
  `text-2xl font-bold`.
- ✅ **Color via tokens** — `bg-background`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `border-border`, etc. ❌ Never
  `text-gray-500` / hardcoded hex / `bg-white`.
- ✅ **Add UI components via `npx shadcn@latest add <name>`.** ❌ Never hand-edit
  files in `src/components/ui/` — they are vendored shadcn and must stay updatable.
- ✅ **Every component/primitive gets a co-located `*.stories.tsx`** (see Storybook
  below — it is a required verification gate, not optional docs).
- ✅ **After changing tokens or system components, re-run the Figma sync**
  (`docs/SYNC.md`). ❌ Never assume Code Connect or Figma write-back — this is a
  **Figma Pro** plan; the link is one-way via the Figma MCP.

## Spacing — the 8 grid

Layout spacing is **multiples and fractions of 8** (better pixel density &
antialiasing): `4 (½×8) · 8 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96`. The rule and
the rationale live in [`src/index.css`](src/index.css); the purge-safe class maps
live in [`src/components/layout/scales.ts`](src/components/layout/scales.ts).

Primitive props take **pixels** directly, so `gap={16}` reads as 16px and matches
the `space-16` Figma variable. Tailwind's atomic unit stays 4px so shadcn control
internals keep their optical metrics — the grid governs **layout** spacing.

## Layout primitives

shadcn ships none of these; they are this system's opinionated layout layer
([`src/components/layout/`](src/components/layout), barrel `index.ts`):

| Primitive | Use for | Key props |
|---|---|---|
| `Container` | page/section width + responsive padding | `size` (sm…2xl, prose, full) |
| `Stack` | vertical rhythm | `gap` (px), `align`, `justify` |
| `Inline` | horizontal cluster that wraps (toolbars, tag rows) | `gap` (px), `align`, `justify`, `wrap` |
| `Grid` | responsive columns | `cols`, `sm`/`md`/`lg`, `gap` (px) |
| `Spacer` | fixed gap or flexible push-apart | `size` (px), `axis` |

Compose layouts from these. Example: `<Grid cols={1} md={2} lg={3} gap={16}>`.

## Storybook — first-class verification surface

Storybook is **not just human docs** — it is how components are verified. When you
add or change a component you **must** add/update its story, and it must pass here:

- **Accessibility** — `@storybook/addon-a11y` runs WCAG checks per story.
- **Render / interaction fidelity** — `@storybook/addon-vitest` runs stories as
  tests in real **Chromium via Playwright** (`vite.config.ts` test project).
- **Visual regression** — `@chromatic-com/storybook`.
- **Autodocs** — `@storybook/addon-docs` (`tags: ["autodocs"]`).
- **Agent access** — `@storybook/addon-mcp` lets agents drive Storybook directly.

Story requirements: enumerate every variant/state; exercise both **light and dark**
via the toolbar theme toggle (the decorator in `.storybook/preview.tsx`); import
nothing that bypasses the token layer.

## Code → Figma sync

One-way, re-runnable, **Figma Pro** (no Code Connect / no Variables REST write).
The link runs through the Figma MCP (`use_figma`, plugin-API). Target file:
**MVDS-Test** (`fileKey C20nU0mROzk3Zr0I9BELJF`, team "Beck Harris Design"). Full
workflow + constraints: [`docs/SYNC.md`](docs/SYNC.md).

## Before you call a change done

```bash
npm run build              # tsc + vite — must pass
npm run build-storybook    # stories must compile
npm run storybook          # check a11y panel + light/dark on new stories
```

Then, if you changed tokens or system components, re-run the Figma sync.

## Map of intent

- [`src/index.css`](src/index.css) — token layer: colors (light/dark), 8-grid
  spacing, breakpoints, type ramp. **The single source of truth.**
- [`src/components/layout/`](src/components/layout) — layout primitives + `scales.ts`.
- [`src/components/ui/`](src/components/ui) — vendored shadcn (don't hand-edit).
- [`docs/SYNC.md`](docs/SYNC.md) — code→Figma workflow & Pro-tier constraints.
- [`README.md`](README.md) — overview for humans.
