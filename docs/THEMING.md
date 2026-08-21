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
- `[data-brand="acme"]` — multi-brand: scope a brand to a sub-tree via an
  attribute wrapper. See "Recipe: a second brand on one page" below; shipped
  presets under `themes/` use exactly this mechanism.
- Token names are deliberately **unnamespaced shadcn convention**
  (`--primary`, `--background`, …) for ecosystem compatibility; the trade-off
  (accepted for v0.x) is potential collision with another library using the
  same names — don't mix two shadcn-token systems in one page.

Token catalog: every overridable name and its default lives in one file —
[`src/index.css`](../src/index.css) (shipped as `dist-lib/styles.css` /
`tokens.css`). `:root` = light values, `.dark` = dark values.

## Recipe: rebrand the primary color

Rebranding the base recolors every component that uses the semantic role
(Button, Badge, focus rings). The **gradation scale** (`primary-1…5` /
`secondary-1…5`) is **authored, not derived** — a brand defines its own five
steps per family, per mode, alongside the base (1 = faintest tint against the
mode's background, 5 = strongest; roles: 1–2 tint surfaces, 3 decorative,
4–5 text-safe).

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

That rebrands every semantic-role usage. To bring the gradation steps onto the
brand too, author them in the same blocks:

```css
:root {
  --primary-1: oklch(0.96 0.02 255);   /* faintest tint  — foreground reads on it */
  --primary-2: oklch(0.92 0.04 255);   /* tint surface   — foreground reads on it */
  --primary-3: oklch(0.70 0.10 255);   /* decorative     — borders, gradients */
  --primary-4: oklch(0.44 0.14 255);   /* text-safe on background/card */
  --primary-5: oklch(0.28 0.12 255);   /* strongest, text-safe */
}
.dark {
  /* author the dark five the same way — 1 stays the faintest tint against
     THIS mode's background; usage never flips */
}
```

Check contrast for every pair you chose (the repo gate is WCAG AA —
`npm run check:contrast` validates the defaults' role pairings; your overrides
are your responsibility).


## Recipe: a second brand on one page

A route-level product can carry its own complete brand inside a differently
branded host — no repaint, no component edits. Two steps:

```css
@import "@beckharrisdesign/mvds/styles.css";
@import "@beckharrisdesign/mvds/themes/terracotta.css";
```

```tsx
<Section data-brand="terracotta">…MVDS components…</Section>
```

Everything inside the wrapper wears the preset — semantic roles and the
brand's authored gradation steps (`primary-1…5` / `secondary-1…5`) — in both
modes (`.dark` composes with the wrapper). Everything outside keeps the host
brand. Tokens a preset does not set (status triad, radius, chrome dimensions,
type) inherit from the host.

**Writing your own preset:** copy `themes/terracotta.css` as the template — a
`[data-brand="<name>"]` light block and a `.dark [data-brand="<name>"]` dark
block, plain declarations only. Author all five gradation steps per family in
both blocks (roles: 1–2 tint surfaces · 3 decorative · 4–5 text-safe). In the
MVDS repo, presets under `src/themes/` are held to the same WCAG AA gate as
the defaults (`npm run check:contrast` iterates brands × modes); in a consumer
app the same role pairings are your responsibility.

## Recipe: type voice

Typography themes like color: faces and step sizes are **runtime tokens**,
overridable in plain CSS — no `@theme` block, no Tailwind seam. `--font-sans`
carries the document; `--font-heading` carries `text-display`/`text-h1`…`h4`
and follows `--font-sans` until you point it elsewhere.

```css
/* serif headings, sans body — load the font, set one token */
:root {
  --font-heading: "Fraunces Variable", ui-serif, Georgia, serif;
}

/* adjust a step size — unitless line-height rides along automatically */
:root {
  --text-display-size: 3.5rem;
}

/* a scoped sub-brand carries its own heading face */
[data-brand="terracotta"] {
  --font-heading: "Fraunces Variable", ui-serif, Georgia, serif;
}
```

(Load the font file itself in your app — via `@fontsource-*`, `next/font`, or
your own pipeline; MVDS ships no fonts. With `tokens.css` the same overrides
apply. There are no `font-sans`/`font-heading` utilities — faces are tokens,
applied by the base layer; `font-mono` remains a utility for code.)

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
- **The type ramp's shape** — steps, weights, and tracking are shape, not
  skin. Faces (`--font-sans`, `--font-heading`) and step sizes
  (`--text-<step>-size`) are yours to adjust; collapsing or re-purposing steps
  (`text-h2` styled as body, etc.) breaks the semantic contract.
- **`--breakpoint-*`** — layout primitives' responsive props assume these.
- **Gray ramp rungs** — semantic tokens sit on these lightness positions;
  re-tinting neutrals is better done via `--background`/`--muted`/`--border`.

The reference consumer (`bhd-headless-notion`) carries a real brand layer: primary rebrand (light + dark), font swap, and a
radius tweak — all in the cascade block, zero component edits.
