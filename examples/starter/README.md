# MVDS starter

A minimal, working app that consumes `@beckharrisdesign/mvds` from the public
npm registry. **Copy this directory** to start a new experiment.

CI builds this exact app against the *published* package on every PR
(`npm run verify:consumer` in the MVDS repo), so if these instructions are in
this file, they worked on a clean machine today.

## Run it

```bash
npm install
npm run dev
```

No `.npmrc`, no login, no token. The package is public.

## What's actually load-bearing

Only two things make this an MVDS app. Everything else is a stock Vite + React
+ TypeScript project.

**1. The dependency** — [`package.json`](package.json):

```json
"@beckharrisdesign/mvds": "^0.3.0"
```

**2. Three lines of CSS** — [`src/styles.css`](src/styles.css):

```css
@import "@beckharrisdesign/mvds/styles.css";
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";
@source "./**/*.{ts,tsx}";
```

The `@source` line pointing at `dist-lib` is the one people forget. Tailwind
only emits utilities it can *see used* — without it the components render, but
completely unstyled.

Tailwind v4 needs no `tailwind.config.js`; it is wired as a Vite plugin in
[`vite.config.ts`](vite.config.ts) and configured entirely from the token layer
that arrives with the import.

## Dark mode

Components switch on a **`.dark` class on a root ancestor**, never on
`prefers-color-scheme` directly. [`src/main.tsx`](src/main.tsx) follows the OS
once before first paint; the header button toggles it live. Remove that call and
the app is permanently light — a valid choice, but make it on purpose.

## Re-branding

Redefine MVDS tokens *after* the import and they win through the cascade — no
component is touched, and the `primary-*` / `secondary-*` ramps re-derive from
the new base automatically. There is a commented-out example at the bottom of
[`src/styles.css`](src/styles.css); the full recipes are in
[`docs/THEMING.md`](../../docs/THEMING.md).

## The rules this app follows

[`src/App.tsx`](src/App.tsx) is written to the MVDS golden rules, and the MVDS
principles gate checks this directory alongside `src/` — so what you copy is
already compliant:

- spacing comes only from a parent's `gap`, on the 8-grid (`gap={16}`)
- layout comes only from `Stack` / `Inline` / `Grid` / `Section` / `Container`
- type comes only from the semantic ramp (`text-h1` … `text-caption`)
- color comes only from tokens (`bg-background`, `text-muted-foreground`)

The full house rules are in [`AGENTS.md`](../../AGENTS.md); the complete
ingestion runbook (Next.js, CI, troubleshooting) is in
[`docs/CONSUMING.md`](../../docs/CONSUMING.md).
