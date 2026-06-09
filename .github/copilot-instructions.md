# Copilot review instructions — MVDS

**Read [`AGENTS.md`](../AGENTS.md) first.** It is the canonical house-rules file for
this repo (humans and every AI tool). Review against *those* rules, not generic
React/Tailwind/shadcn defaults. The notes below are the points reviewers most often
get wrong here.

## What this repo is

MVDS — Minimum Viable Design System. An **agent-first**, **`v0.x`**, **owner-gated**
design system where **code is the single source of truth**. It is **not** a
published, consumer-facing component library. New design-system surface is the
founder's deliberate call; primitives are composed by consumers in *their own* repos.

## Review like this, not like a generic library

- ✅ **Breaking changes are expected and fine.** While `v0.x` with no external
  consumers, removing or renaming a variant/prop/export is correct. ❌ **Do not
  suggest deprecated aliases or back-compat shims** (e.g. keeping a `secondary` that
  just duplicates `muted`) — that reintroduces the bloat we deliberately prune.
- ✅ **These `ui/` components are MVDS-tuned, not pristine shadcn.** Internal spacing
  is on the 8-grid (heights 24/32/40; padding/gap from `4·8·16·24·32·40·48·64·80·96`).
  ❌ Don't suggest reverting to shadcn's off-grid defaults (`px-2.5`=10, `h-7`=28,
  `gap-1.5`=6). Icon glyph sizes and border-radius are dimensions, not spacing — leave
  them.
- ✅ **Color via tokens; status via the semantic triad** (`success`/`neutral`/
  `destructive`). ❌ Never suggest `text-gray-*`, hex, `bg-white`, or `text-green-500`.
- ✅ **Spacing is the parent's `gap` only** (Stack/Inline/Grid). ❌ Don't suggest
  margins to separate siblings, or raw `flex`/`grid` utilities for layout.
- ✅ **A component's interactive affordances must fit everything `asChild` can
  render.** A primitive that supports `asChild` (Slot) may become a `<button>`, `<a>`,
  etc. Prefer element-agnostic `:focus-visible` (it self-gates — a non-focusable
  `<span>` never shows the ring) over scoping to one tag like `[a&]`, which silently
  drops the ring for other focusable targets.

## Still flag normally

Genuine correctness, accessibility (WCAG AA contrast is enforced — see
`npm run check:contrast` and the a11y story gate), security, and logic bugs are all
in scope and welcome. The guidance above is about *not* applying mature-library
conventions that conflict with this repo's stage and philosophy.
