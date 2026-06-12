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
  `text-muted-foreground`, `bg-primary`, `border-border`, etc. The scale ramps
  are tokens too: `gray-*` / `primary-*` / `secondary-*` (11 steps, 50…950,
  derived from their base token — re-branding `--primary` cascades its ramp).
  ❌ Never a generic Tailwind palette (`text-slate-500`) / hardcoded hex /
  `bg-white`.
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
npm run check:principles   # machine-enforced golden rules (color/margin/flex-grid/story coverage) — must pass
npm test                   # every story in headless Chromium + axe a11y, LIGHT + DARK — must pass
```

`npm test` is the gate: render + interaction + **WCAG color-contrast** checks on
every story, run in **both** modes (`test:light`, then `test:dark` via
`VITE_SB_THEME=dark`). `npm run check:contrast` adds a token-level AA check on every
foreground/background pairing — independent of whether a component renders it. Fix
violations before shipping.

**Golden rules are partly machine-enforced.** `npm run check:principles` is a
manifest-driven gate ([`principles.config.mjs`](principles.config.mjs)) that turns
several golden rules from prose into tests: no hardcoded color (hex / palette / `bg-white`
/ `rgb()`), no margins for spacing (only `mx-auto`), no raw `flex`/`grid` outside the
layout primitives, and one story per UI component (the layout family shares
`layout.stories.tsx`). Principles are **data** — a new rule is a new record — and each
carries a `scope` (vendored `ui/` and specimen stories are carved out where
appropriate). A genuine, justified exception is suppressed inline with a
`// mvds-allow <principle-id> — <reason>` comment on the offending line; bare
`// mvds-allow` suppresses every principle on that line. The same check runs at the
keystroke via the `principle-edit-guard` PostToolUse hook. The manifest is also the
spine of the planned per-context principle cascade (`resolveManifest`,
[`principles.resolve.mjs`](principles.resolve.mjs)) — principles will later vary by
company/experiment/product, so encode rules as data, not as hardcoded checks.

**Isolate experiments.** Never bundle throwaway/experimental edits (a token you're
trying out, a Chromatic probe) into a PR with real changes — put them on their own
branch so they can't merge by accident.

**Pre-1.0: breaking changes are fine; don't hoard compatibility.** MVDS is `v0.x`,
owner-gated, and code is the single source of truth — consumers compose primitives
in their own repos, and new DS surface is the founder's deliberate call. So when a
variant/prop/export is wrong, **remove or rename it outright.** ❌ Never keep a
deprecated alias "for compatibility" (e.g. a `secondary` that just duplicates
`muted`) — back-compat cruft reintroduces the exact bloat we prune, and there are no
external consumers to protect yet. A generic-library reviewer (e.g. Copilot) will
reflexively suggest deprecation shims; that default is **wrong for this repo's
stage** — prefer the clean break.

Figma is synced **only when explicitly asked** — not automatically after a change.

## Branch & PR workflow (always)

Every change rides this lifecycle. The agent owns it end to end — **except the
final approval, which is always the founder's.** Do not skip a step or wait to be
re-asked; this is the standing default for the repo.

1. ✅ **One feature per branch.** Never bundle unrelated changes. Name the branch
   with a convention that describes the change — `feat/…`, `fix/…`, `docs/…`,
   `chore/…` — and carry that name through to the PR. ❌ Never commit straight to
   `main`.
2. ✅ **You create and push the PR** for the branch (`gh pr create`), with the
   branch's naming convention carried into the PR title.
3. ✅ **Write a PR description that has both:** (a) a list of **all** the code
   changes in the PR, and (b) a summary of the **founder's original intent** for
   the change, in the founder's own framing as it was explained to you — the
   *why*, not just the *what*.
4. ✅ **Watch for Copilot review comments/suggestions.** Surface every one to the
   founder for approval first — ❌ never act on them unilaterally — then wait for
   Copilot to resolve them. Evaluate each on its merits against *these* house rules,
   not generic-library defaults (see the pre-1.0 note above — Copilot will suggest
   compat shims and pristine-shadcn habits that this repo rejects).
5. ✅ **Verify what Copilot actually landed — don't trust a "Done" comment.** The
   `copilot-swe-agent` may claim a fix and reference a commit that never reached the
   PR branch. Always confirm against the real branch tip (`git log`/diff the head
   SHA) before treating a suggestion as resolved. **Fold any approved changes back
   into the same PR**, and note the additional commits in the PR description so it
   stays a complete record.
6. ✅ **When all checks come back green, flag the PR as ready to review.** ❌ Never
   approve or merge it yourself — **the founder always gives final approval.**

## Map of intent

- [`src/index.css`](src/index.css) — token layer: colors (light/dark), 8-grid
  spacing, breakpoints, type ramp. **The single source of truth.**
- [`src/components/layout/`](src/components/layout) — layout primitives + `scales.ts`.
- [`src/components/ui/`](src/components/ui) — vendored shadcn (don't hand-edit).
- [`docs/SYNC.md`](docs/SYNC.md) — code→Figma workflow & Pro-tier constraints.
- [`README.md`](README.md) — overview for humans.
