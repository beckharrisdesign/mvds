# Theming MVDS from a consumer app

How to put a brand on MVDS **without touching any component**. The cascade is
the API: redefine token values *after* the styles import in the app's global
CSS, and every component — plus the derived color ramps — follows.

Prerequisite: the app is wired per [CONSUMING.md](./CONSUMING.md).

## The mechanism

```css
@import "@beckharrisdesign/mvds/styles.css";
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";
@source "../**/*.{ts,tsx}";

/* ── Per-site brand layer — wins because it comes after the import ── */
:root {
  /* light-mode token overrides */
}
.dark {
  /* dark-mode token overrides */
}
```

- `:root` / `.dark` — single-brand site (light + dark values).
- `[data-brand="acme"]` / `[data-brand="acme"].dark` — multi-brand: scope each
  brand's overrides to an attribute on `<html>`/`<body>` and switch brands by
  switching the attribute.
- Token names are deliberately **unnamespaced shadcn convention**
  (`--primary`, `--background`, …) for ecosystem compatibility; the trade-off
  (accepted for v0.x) is potential collision with another library using the
  same names — don't mix two shadcn-token systems in one page.

Token catalog: every overridable name and its default lives in one file —
[`src/index.css`](../src/index.css) (shipped as `dist-lib/styles.css` /
`tokens.css`). `:root` = light values, `.dark` = dark values.

## Recipe: rebrand the primary color

The 11-step `primary-*` ramp is **derived from `--primary` with CSS relative
color** — each step pins a lightness rung and inherits the base's chroma and
hue. Recolor one token, the entire ramp recolors itself. Same for
`--secondary`.

```css
:root {
  --primary: oklch(0.45 0.16 255);          /* brand blue */
  --primary-foreground: oklch(0.985 0 0);   /* text on primary — keep AA contrast */
}
.dark {
  --primary: oklch(0.72 0.14 255);          /* lighter for dark surfaces */
  --primary-foreground: oklch(0.205 0 0);
}
```

That's the whole rebrand: Button, Badge, focus rings, and all `primary-50…950`
utilities update. Check contrast for the pair you chose (the repo gate is
WCAG AA — `npm run check:contrast` validates the defaults; your overrides are
your responsibility).

## Recipe: swap the typeface

`--font-sans` defaults to `'Inter Variable', ui-sans-serif, system-ui,
sans-serif`; `--font-heading` follows `--font-sans` unless overridden. Two
steps — load the font in the app, point the token at it:

```tsx
// Next.js: app/layout.tsx
import { Fraunces } from "next/font/google";
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-brand" });
// <html className={fraunces.variable}>
```

```css
@theme inline {
  --font-sans: var(--font-brand), ui-sans-serif, system-ui, sans-serif;
}
```

(Re-declaring inside `@theme inline` keeps Tailwind's `font-sans` utility in
sync. With `tokens.css` + your own font pipeline, the same override applies.)

## Recipe: shape, depth, motion

```css
:root {
  --radius: 0.5rem;        /* whole corner ramp re-derives: sm/md/lg/xl */
  --elevation-md: 0 2px 4px -1px oklch(0 0 0 / 0.10);  /* per-mode in :root/.dark */
}
@theme static {
  --duration-base: 200ms;  /* motion: duration-fast/base/slow + easings */
}
```

## What NOT to override

These are the system's structure, not its skin (see
[`AGENTS.md`](../AGENTS.md) golden rules):

- **`--spacing`** — the 4px atomic unit under the 8-point grid. Changing it
  silently breaks every on-grid component dimension.
- **The type ramp's shape** — adjusting a size is fine; collapsing or
  re-purposing steps (`text-h2` styled as body, etc.) breaks the semantic
  contract.
- **`--breakpoint-*`** — layout primitives' responsive props assume these.
- **Gray ramp rungs** — semantic tokens sit on these lightness positions;
  re-tinting neutrals is better done via `--background`/`--muted`/`--border`.

The reference consumer (`bhd-headless-notion`) carries a real brand layer: primary rebrand (light + dark), font swap, and a
radius tweak — all in the cascade block, zero component edits.
