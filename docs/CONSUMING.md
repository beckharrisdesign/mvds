# Consuming MVDS in an app

The ingestion runbook. Written so a human — or an agent with no other context —
can wire `@beckharrisdesign/mvds` into an app from this document alone.
Reference consumer: [`bhd-headless-notion`](../../bhd-headless-notion) (sibling
repo), a Next.js 15 + Tailwind v4 site.

## Prerequisites

| Requirement | Version | Why |
| --- | --- | --- |
| React / React-DOM | ^19 | peer dependency |
| Tailwind CSS | ^4 (`@tailwindcss/postcss`) | components are styled with Tailwind utilities; tokens use v4 CSS-first `@theme` |
| Node | 22 | Next 14/15 toolchains are unhappy on Node 25 (`export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`) |

No `tailwind.config.js` is needed — Tailwind v4 is configured entirely from CSS.

## 1. Install

**Local (today — no registry yet):** from a sibling checkout of this repo:

```bash
# build the package artifacts the consumer will import
( cd ../mvds && npm run build:lib )
```

```jsonc
// consumer package.json
"dependencies": {
  "@beckharrisdesign/mvds": "file:../mvds"
}
```

Then pick an install mode — this matters:

| Mode | Command | Behavior | Use when |
| --- | --- | --- | --- |
| **Symlink** (npm default) | `npm install` | `node_modules/@beckharrisdesign/mvds` → live checkout. Live dev loop, but CSS/font assets resolve through the symlink's real path — **breaks Next builds with Turbopack** (Next ≥16 default). | Active co-development, webpack-based builds (the reference consumer). |
| **Copy** | `npm install --install-links` | Packs the package in (respects `files`), hoists its deps into the consumer tree. Survives Turbopack. Refresh after MVDS changes: rebuild lib, then `npm install @beckharrisdesign/mvds --install-links` again. | One-shot ingestion, Turbopack builds, anything CI-like. |

> Either way the consumer sees whatever `dist-lib/` was last built — **after any
> MVDS change: re-run `npm run build:lib` in `../mvds`** (symlink mode picks it
> up immediately; copy mode needs the reinstall). Symlink consumers can automate
> the rebuild with a `predev`/`prebuild` script (see the reference consumer's
> `package.json`). Once published to a registry, this whole section becomes
> `npm install @beckharrisdesign/mvds` + version bumps.

## 2. Wire the CSS (the three lines that matter)

In the app's global stylesheet (e.g. `app/globals.css`):

```css
/* 1. the token layer + Tailwind + base styles + font, all-in-one */
@import "@beckharrisdesign/mvds/styles.css";

/* 2. let Tailwind scan the installed package so component utilities are generated */
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";

/* 3. and the app's own files */
@source "../**/*.{ts,tsx}";
```

Adjust the relative paths to wherever the stylesheet lives. **Without line 2 the
components render unstyled** — Tailwind only emits utilities it can see used.

### `styles.css` vs `tokens.css`

| Entry | Contains | Use when |
| --- | --- | --- |
| `@beckharrisdesign/mvds/styles.css` | `@import "tailwindcss"` + animations + shadcn base + Inter font + the token layer | Default. The app delegates its styling foundation to MVDS. |
| `@beckharrisdesign/mvds/tokens.css` | The token layer only — no external imports, no font | The app brings its own `@import "tailwindcss"`, reset, and font, and wants only MVDS tokens/theme. |

With `tokens.css`, import Tailwind yourself first:

```css
@import "tailwindcss";
@import "@beckharrisdesign/mvds/tokens.css";
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";
```

## 3. Dark mode contract

Components switch on a **`.dark` class on a root ancestor** (custom variant
`&:is(.dark *)`), not on `prefers-color-scheme`. Minimal wiring:

```tsx
// static: <html className="dark">
// or follow the OS, before paint (Next.js app/layout.tsx <head> or inline script):
document.documentElement.classList.toggle(
  "dark",
  window.matchMedia("(prefers-color-scheme: dark)").matches
);
```

No `.dark` wiring = permanently light mode. That's valid, but decide it on
purpose.

## 4. Use the components

```tsx
import {
  Button, Badge, Card, CardHeader, CardTitle, CardContent,
  Container, Stack, Inline, Grid, GridItem, Spacer,
  Field, Label, cn,
} from "@beckharrisdesign/mvds";
```

The full public surface is [`src/index.ts`](../src/index.ts); props and golden
rules are in [`AGENTS.md`](../AGENTS.md) (8-grid spacing, semantic type ramp,
no hardcoded colors).

## The three-layer model

Never hand-merge a base component. Customization has exactly three layers:

1. **Base components → the package.** Live in `node_modules`, update via
   rebuild/version bump.
2. **Token / brand overrides → the cascade.** Redefine MVDS tokens *after* the
   import in the app's global CSS — they win without touching any component.
   See [THEMING.md](./THEMING.md).
3. **Component overrides → composition.** Wrap MVDS primitives in a local
   component (e.g. the reference consumer's `components/project-card.tsx`).
   Base updates still flow through.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Components render but are unstyled | Missing `@source` line for `dist-lib` — Tailwind never generated the component utilities. |
| Component or prop "doesn't exist" / stale behavior | Stale `dist-lib`: `( cd ../mvds && npm run build:lib )` then `npm install` in the consumer. |
| Dark mode never activates | No `.dark` class on a root ancestor — see §3. |
| Wrong font / want a brand font | Inter ships via `styles.css`. Swap recipe: [THEMING.md](./THEMING.md#swap-the-typeface). |
| Build errors on Node 25 | Use Node 22 (see prerequisites). |
| Turbopack: `Module not found` for the package or `@fontsource…/*.woff2` | Symlinked `file:` install + Turbopack don't mix — reinstall with `npm install --install-links` (see §1). |
| `Can't resolve '<some runtime lib>'` from `dist-lib/index.js` | A component dependency missing from MVDS's `dependencies` (they're externalized, not bundled). Fix in MVDS's package.json — that's an MVDS bug, report it. |
