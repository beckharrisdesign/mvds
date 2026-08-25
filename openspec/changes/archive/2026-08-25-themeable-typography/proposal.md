# themeable-typography

## Human anchor

> "we should be able to theme typogrpahy, and also provide a good default typography scale. users should be able to adjust it in their own environments." — founder, 2026-08-21, reviewing the heading-font seam "in light of the color scales — where do we derive the typography scales?"

> **Pivot record:** this change began as `heading-font-ramp` (make the ramp's heading steps consume the inert `--font-heading` token). Reviewing its specs against the color-scale architecture, the founder widened it: typography gets the same model color now has — a deliberately authored default scale, themeable through the runtime token layer, adjustable per app and per scoped brand. The original heading-font goal is subsumed as one seam among several. The narrower spec draft is superseded in place and rewritten at the specs stage.

## Outcomes

- **Who:** Consumers and brands giving a product its own type voice — app-wide or on a `data-brand` sub-tree (the hub's REVIEW_QUEUE #14, Fraunces headings for one route-level product, is exactly this shape); agents, for whom the ramp's semantic steps stay the only type API; the founder, whose default scale becomes deliberately authored rather than inherited.
- **Job:** Theme typography the way color is themed — one token overrides a face or a step's size, in plain CSS, at whatever scope — on top of a good default scale that works untouched.
- **Done when:** The type ramp's faces (`--font-sans`, `--font-heading`) and per-step sizes live in the **runtime token layer** (declared in `:root`, consumed via `var()` by the ramp utilities — the same two-layer pattern as color); heading steps render in `--font-heading`; overriding a face or a size in a consumer's own stylesheet — or inside a `data-brand` block — restyles accordingly with zero markup changes; the default render is **pixel-identical** to today (Chromatic zero-diff); the default scale's values are recorded as authored with provenance (reviewed and owned, no longer silently Tailwind's ladder); line-heights stay unitless so they ride size changes automatically; `docs/THEMING.md` gains the type-theming recipe; the type specimen names the slots and tokens; the seam is render-tested so it can never regress to inert.
- **Not doing:** New ramp steps, renamed semantics, or per-mode type values; runtime knobs for weight/tracking (the ramp's *shape* stays contract, per THEMING's "what NOT to override"); shipping any font; a `Text`/`Heading` component; changing the terracotta preset (presets *may* carry a type voice from now on; adding one is a brand decision for later).

## Why

Color runs a two-layer architecture — `@theme inline` maps utilities to `var(--token)`, values live in `:root`/`.dark`/`[data-brand]` — and that runtime layer is precisely what makes color re-brandable by cascade and scopable by wrapper. Typography has no runtime layer at all: sizes are baked literals inside `@theme inline`, both font slots live only there, and `--font-heading` is inert (defined, consumed by nothing). Consequences measured this round: Motion & Muse hand-applied a font utility to every heading; the hub hacked global `h1–h6` rules to get Fraunces; a preset cannot set a heading face at all. And the default sizes, on inspection, are Tailwind's generic ladder wearing semantic names — provenance accreted, not chosen, the same smell the derived color ramps had. The founder's redirect closes the asymmetry: author the default deliberately, and open the same seams color has.

## What changes

- `src/index.css`: per-step size tokens (e.g. `--text-h1-size`) and the two face tokens move to `:root` as plain declarations; `@theme inline` maps ramp utilities to `var()` references; heading steps (`display`, `h1`–`h4`) add `font-family: var(--font-heading)` (defaulting through `--font-sans` — pixel-identical until a brand opts in). Weights, tracking, and unitless line-heights stay authored step constants.
- The default scale is adopted **as the authored default** with provenance recorded in the token layer comment (values reviewed and kept unless the founder redlines them in the design phase — the Figma proposed page is where that call gets made).
- `docs/THEMING.md`: "Recipe: type voice" (swap a face app-wide, serif headings, adjust a step size, scoped per `data-brand`) replacing the build-time `@theme` font recipe; "what NOT to override" updated to name shape (steps, weights, tracking) vs skin (faces, sizes).
- Type specimen names the two slots and the runtime tokens; a render-tested override story asserts computed faces/sizes change through the seam.

## Capabilities

### New Capabilities

- `type-runtime-tokens`: faces and per-step sizes in the runtime token layer — overridable in plain CSS, inherited into `data-brand` scopes, consumed via `var()` by the ramp utilities.
- `default-type-scale`: the deliberately authored default scale — provenance recorded, specimen-documented, default render pixel-identical.

### Modified Capabilities

- (none)

## Impact

- `src/index.css` (type ramp + font slots restructure), `docs/THEMING.md`, type specimen + new override story, Chromatic (zero-diff expectation on defaults is the regression tripwire).
- Presets: `data-brand` blocks can now carry `--font-heading` / size overrides (terracotta unchanged in this change).
- Consumers: Motion & Muse drops its eight `font-heading` utility classes *and* its `@theme inline` override for a plain `:root` one (post-release follow-up, logged in its FINDINGS.md).
- Figma: text styles in the mirror trail until an explicit sync is requested.

## Optional links

- Origin spec draft (superseded in place): `specs/heading-font-ramp/spec.md` — rewritten at the specs stage
- Evidence: `motion-muse` FINDINGS.md gap #2; hub `docs/REVIEW_QUEUE.md` #14; hub `app/globals.css:115-125`
- Architecture parallel: `openspec/changes/archive` — `stepped-scales` (authored steps + runtime layer for color)
- House rules: `AGENTS.md`
