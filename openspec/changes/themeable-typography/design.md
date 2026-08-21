# themeable-typography — design

## Context

Specs approved 2026-08-21 (type-runtime-tokens explicitly; default-type-scale
with "adopt current values"). A build spike on this branch settled the two
mechanism questions before any frame was drawn — both results are recorded as
decisions below, not assumptions.

## Goals / Non-Goals

**Goals:**

- Faces and per-step sizes in the runtime token layer, consumed via `var()` —
  overridable in plain CSS, inherited into `data-brand` scopes.
- Heading steps render `--font-heading`; default render pixel-identical.
- Default scale adopted as authored, provenance recorded.

**Non-Goals:**

- Runtime weight/tracking knobs; per-mode type values; new/renamed steps;
  shipping a font; changing terracotta (presets *may* carry a type voice —
  a later brand decision); Figma text-style sync (mirror trails until asked).

## User flow / IA

Agent/consumer decision flow unchanged: pick a semantic step. Theming flow is
new and plain-CSS only:

```css
:root { --font-heading: "Fraunces Variable", ui-serif, serif; }        /* app-wide */
[data-brand="terracotta"] { --font-heading: "Fraunces Variable", ui-serif, serif; } /* scoped */
:root { --text-display-size: 3.5rem; }                                  /* a step size */
```

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/xzz4w9gU5eHUKrVpaEMzPh (scratch: "MVDS explore: themeable-typography") |
| As-is page / frame    | `0.0 As is` — "The ramp as shipped": all nine steps rendered at current values, annotated with the four findings (baked literals, Tailwind-ladder provenance, build-time-only font slots, inert `--font-heading`) |
| Proposed page / frames| `01.0 Propose: themeable-typography` — "Same steps, runtime seams, authored default" (per-step runtime size token + face-slot column; mechanism note with spike results); "Adjusting type in your own environment" (app-wide serif + display-size override demo, and a scoped `data-brand` wrapper whose heading wears its own face beside a sans host — serif rendered in Playfair Display as a stand-in) |
| Libraries / version   | Values mirror `src/index.css` (`@beckharrisdesign/mvds@0.3.0` line); scratch file, not MVDS Core |
| Breakpoints           | Storybook canvas — token/specimen change, no S/L delta |
| Status                | iterating — first pass for founder review |

## Decisions

1. **Sizes: `var()`-backed theme values — spike-verified.** `@theme inline
   --text-h1: var(--text-h1-size)` emits `.text-h1 { font-size:
   var(--text-h1-size); … }`, so a `:root` (or `data-brand`) declaration is the
   live seam. One runtime token per step, named `--text-<step>-size`.
   Line-heights stay unitless step constants and ride size changes for free;
   weights/tracking stay baked (shape).
2. **Heading face: a zero-specificity base rule — spike-verified negative.**
   Tailwind v4 has **no** `--text-*--font-family` modifier (the spike emitted
   nothing for it), so heading steps get their face via
   `:where(.text-display, .text-h1, .text-h2, .text-h3, .text-h4)
   { font-family: var(--font-heading); }` in the base layer. `:where()` keeps
   specificity at zero so any utility (e.g. `font-sans`) still overrides.
3. **Public token names are `--font-sans` / `--font-heading`,** declared in
   `:root` with the stack and `var(--font-sans)` respectively; `@theme inline`
   maps the `font-sans`/`font-heading` utilities to `var()` references so both
   the utilities and the base rule read the runtime layer. Risk: the theme key
   and runtime token share a name (unlike color's `--color-x`/`--x` split) —
   if Tailwind's inliner chokes on the self-reference, fallback naming is
   `--face-sans`/`--face-heading` for the runtime pair (apply verifies; specs
   name the public API, not the internal wiring).
4. **Default scale adopted as authored.** Values keep today's numbers; the
   token-layer comment records provenance ("reviewed and adopted as the MVDS
   default scale, 2026-08-21 — descended from Tailwind's ladder, now owned
   here"). Founder chose adoption over re-authoring; the proposed Figma page is
   the standing surface to redline values later as its own change.
5. **THEMING.md's font recipe moves from `@theme` to plain CSS** — the old
   build-time recipe is replaced (consumers on `tokens.css` + own pipeline get
   the same seam since the tokens are ordinary custom properties). "What NOT
   to override" gains the shape/skin boundary: steps, weights, tracking =
   shape; faces, sizes = skin.
6. **Render-test story** (`src/foundations/`): wrapper sets `--font-heading`
   and one step-size token inline via `style`; play asserts computed
   font-family and font-size change for the targets and stay put for body copy
   and untouched steps, light + dark.

## Risks / Trade-offs

- **Chromatic zero-diff on every story is the tripwire** — the restructure
  must change seams, not output. Any diff is a bug in the wiring.
- The `:where()` base rule styles utility class names from the base layer —
  unusual layering, but zero-specificity makes it inert to overrides; the
  render-test story pins it.
- Decision 3's shared-name risk (theme key vs runtime token) is contained by
  the fallback naming and verified at apply before anything else builds on it.
- Consumers using `tokens.css` without Tailwind get the size/face tokens but
  not the ramp utilities — unchanged from today's contract.
