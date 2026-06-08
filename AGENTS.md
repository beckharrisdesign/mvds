# AGENTS.md — house rules for MVDS

> Canonical instructions for any AI agent (and human) working in this repo.
> `CLAUDE.md` imports this file. Read it before generating UI.

## What this is

**MVDS — Minimum Viable Design System.** An **agent-first** design system for early
startup prototyping with solid foundational design strategy. **Code is the single
source of truth.** The Figma file is a **generated, one-way mirror** (code → Figma)
— never the other way. Stack: Vite + React + TS, **Tailwind v4** (CSS-first
`@theme`), **shadcn/ui**, Storybook.

MVDS exists so that *intent is encoded* — its reason for being is that you (an
agent) and humans both generate consistent, on-brand UI from it. So anything you
generate must follow the system, not generic shadcn/Tailwind habits.

## Golden rules (always / never)

- ✅ **Spacing = multiples & fractions of 8.** Use the layout primitives with px
  props (`<Stack gap={16}>`). ❌ Never raw `flex`/`grid` utilities for layout, and
  ❌ never off-grid spacing (`gap-3`=12px, `gap-5`=20px are forbidden).
- ✅ **Gap is the ONLY way to space siblings.** Space between elements comes from
  the parent's `gap` (Stack/Inline/Grid) — full stop. ❌ Never use margins to
  create spacing, and ❌ never give a component an outer margin (it owns no
  external space — its parent positions it). Padding is for a component's own
  inner inset (Card, Container), never to separate siblings. So spacing is always
  one number in one place — easy to read, easy to debug. (Only sanctioned margin:
  `mx-auto` to center a Container.)
- ✅ **Type via the semantic ramp** — `text-display`, `text-h1`…`text-h4`,
  `text-body-lg`, `text-body`, `text-small`, `text-caption`. ❌ Never ad-hoc
  `text-2xl font-bold`.
- ✅ **Color via tokens** — `bg-background`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `border-border`, etc. ❌ Never
  `text-gray-500` / hardcoded hex / `bg-white`.
- ✅ **Status / intent via the semantic triad** — `success` (good), `neutral`,
  `destructive` (bad). Use as text (`text-success`), a tint (`bg-success/10`), or
  solid with its foreground (`bg-success text-success-foreground`). ❌ Never
  `text-green-500` / `text-red-500`.
- ♿ **Contrast (WCAG AA):** every token foreground/background pairing must clear
  **4.5:1 in both modes** — including each status color solid with its
  `-foreground`, and `text-success`/`text-destructive` etc. as text on
  `background`. The one exception is `muted-foreground`: AA only on
  `background`/`card`, ❌ never on `bg-muted`. Enforced by `npm run check:contrast`
  (token-level) **and** the a11y gate on stories.
- ✅ **Add UI components via `npx shadcn@latest add <name>`, then tune their
  internals to the 8-grid.** shadcn ships off-grid metrics (`px-2.5`=10, `h-7`=28,
  `gap-1.5`=6); replace them with on-grid values (heights 24/32/40; padding/gap
  from the 8-grid set) — this repo's `ui/` components are MVDS-tuned, not pristine
  shadcn, so **re-apply the tuning after every `add`/update**. (Icon glyph sizes &
  border-radius are dimensions, not spacing — leave them.) Otherwise don't rewrite
  these files freehand.
- ✅ **Every component/primitive is covered by a co-located `*.stories.tsx`** —
  one file per UI component (`button.stories.tsx`), while a cohesive primitive
  family may share one (the layout primitives live in `layout.stories.tsx`). (see
  Storybook below — it is a required verification gate, not optional docs).
- ✅ **Figma is a downstream mirror, synced only on request.** Code is the source
  of truth; the Figma file (MVDS Core) is updated via the Figma MCP **only when
  explicitly asked** — never automatically after a token/component change. ❌ No
  Code Connect (not used, not planned). One-way; see `docs/SYNC.md` and the
  `mvds-figma-token-sync` skill.

## Spacing — the 8 grid

Layout spacing is **multiples and fractions of 8** (better pixel density &
antialiasing): `4 (½×8) · 8 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96`. The rule and
the rationale live in [`src/index.css`](src/index.css); the purge-safe class maps
live in [`src/components/layout/scales.ts`](src/components/layout/scales.ts).

Primitive props take **pixels** directly, so `gap={16}` reads as 16px and matches
the `space-16` Figma variable. The 8-grid governs **all** spacing — layout *and*
component internals (Button/Card are tuned to it). Tailwind's 4px base is just the
atomic unit; only icon glyph sizes and border-radius are exempt (dimensions, not
spacing).

## Layout primitives

shadcn ships none of these; they are this system's opinionated layout layer
([`src/components/layout/`](src/components/layout), barrel `index.ts`):

| Primitive | Use for | Key props |
|---|---|---|
| `Container` | page/section width + responsive padding | `size` (sm…2xl, prose, full) |
| `Stack` | vertical rhythm | `gap` (px), `align`, `justify` |
| `Inline` | horizontal cluster that wraps (toolbars, tag rows) | `gap` (px), `align`, `justify`, `wrap` |
| `Grid` | the column field (cascades across breakpoints) | `cols` (number or `{base,sm,md,lg,xl,2xl}`), `gap` (px gutter) |
| `GridItem` (alias `Col`) | a Grid child that spans columns | `span` (number or per-breakpoint object), `start` |
| `Spacer` | fixed gap or flexible push-apart | `size` (px), `axis` |

Responsive values use a **per-breakpoint object** (mobile-first): `cols={{ base: 4,
md: 8, lg: 12 }}`, `span={{ base: 4, lg: 6 }}`. Grid/GridItem are the only place
dynamic Tailwind classes are allowed — the `grid-cols-*`/`col-span-*` range is
safelisted via `@source inline(...)` in `src/index.css`. Everywhere else, static
classes only.

Compose layouts from these. Example: `<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>`.

## Storybook — first-class verification surface

Storybook is **not just human docs** — it is how components are verified. When you
add or change a component you **must** add/update its story, and it must pass here:

- **Accessibility** — `@storybook/addon-a11y` runs WCAG checks per story.
- **Render / interaction fidelity** — `@storybook/addon-vitest` runs stories as
  tests in real **Chromium via Playwright** (`vite.config.ts` test project).
- **Visual regression** — `@chromatic-com/storybook`.
- **Autodocs** — `@storybook/addon-docs` (`tags: ["autodocs"]`).
- **Agent access** — `@storybook/addon-mcp` lets agents drive Storybook directly.

**Specimen vs. component stories.** Foundation/specimen stories (palette, scales)
document tokens as data and may render intentionally low-contrast pairings (borders,
muted, swatches) — they scope axe `color-contrast` **off** via
`parameters.a11y.config.rules`. Contrast is enforced in **component** stories (real
usage context) and at the token level by `npm run check:contrast` — never gated on
a reference board.

Story requirements: enumerate every variant/state; exercise both **light and dark**
via the toolbar theme toggle (the decorator in `.storybook/preview.tsx`); import
nothing that bypasses the token layer.

## Code → Figma sync

One-way, re-runnable, **Figma Pro** (no Code Connect / no Variables REST write).
The link runs through the Figma MCP (`use_figma`, plugin-API). Target file: the
**MVDS** Figma file (`fileKey C20nU0mROzk3Zr0I9BELJF`, team "Beck Harris Design").
Full workflow + constraints: [`docs/SYNC.md`](docs/SYNC.md).

## Before you call a change done

```bash
npm run build              # tsc + vite — must pass
npm run check:contrast     # token-level WCAG AA on every pairing, light + dark — must pass
npm test                   # every story in headless Chromium + axe a11y, LIGHT + DARK — must pass
```

`npm test` is the gate: render + interaction + **WCAG color-contrast** checks on
every story, run in **both** modes (`test:light`, then `test:dark` via
`VITE_SB_THEME=dark`). `npm run check:contrast` adds a token-level AA check on every
foreground/background pairing — independent of whether a component renders it. Fix
violations before shipping.

**Isolate experiments.** Never bundle throwaway/experimental edits (a token you're
trying out, a Chromatic probe) into a PR with real changes — put them on their own
branch so they can't merge by accident.

Figma is synced **only when explicitly asked** — not automatically after a change.

## Map of intent

- [`src/index.css`](src/index.css) — token layer: colors (light/dark), 8-grid
  spacing, breakpoints, type ramp. **The single source of truth.**
- [`src/components/layout/`](src/components/layout) — layout primitives + `scales.ts`.
- [`src/components/ui/`](src/components/ui) — vendored shadcn (don't hand-edit).
- [`docs/SYNC.md`](docs/SYNC.md) — code→Figma workflow & Pro-tier constraints.
- [`README.md`](README.md) — overview for humans.
