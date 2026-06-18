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

### Auth (one-time per machine / CI environment)

The package lives on GitHub Packages (`npm.pkg.github.com`). Add a project-level
`.npmrc` to tell npm where to find `@beckharrisdesign` scoped packages:

```ini
# .npmrc  (commit this file; it has no secrets)
@beckharrisdesign:registry=https://npm.pkg.github.com
```

Then authenticate. For local dev, use a GitHub PAT with `read:packages` scope:

```bash
# one-time login — stores the token in ~/.npmrc
npm login --registry=https://npm.pkg.github.com --scope=@beckharrisdesign
# Username: your GitHub handle
# Password: your PAT (not your GH password)
# Email: your GitHub email
```

For CI (GitHub Actions), `GITHUB_TOKEN` works automatically — no extra secret needed:

```yaml
- uses: actions/setup-node@v5
  with:
    registry-url: "https://npm.pkg.github.com"
    scope: "@beckharrisdesign"
- run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Install the package

```bash
npm install @beckharrisdesign/mvds
```

Pin to a version range in `package.json`:

```jsonc
"dependencies": {
  "@beckharrisdesign/mvds": "^0.1.0"
}
```

> **Local co-development fallback** — if you need to work against an unpublished
> change in a sibling checkout, the old `file:` path still works:
> `"@beckharrisdesign/mvds": "file:../mvds"`. Run `npm run build:lib` in the
> MVDS repo first; use `--install-links` if Turbopack is the bundler.
> Switch back to the version pin before shipping.

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
| `npm install` 404 / `ENEEDAUTH` for `@beckharrisdesign/mvds` | Missing `.npmrc` or not logged in — see §1 Auth setup. |
| Components render but are unstyled | Missing `@source` line for `dist-lib` — Tailwind never generated the component utilities. |
| Component or prop "doesn't exist" / stale behavior | Stale `dist-lib`: `( cd ../mvds && npm run build:lib )` then `npm install` in the consumer. |
| Dark mode never activates | No `.dark` class on a root ancestor — see §3. |
| Wrong font / want a brand font | Inter ships via `styles.css`. Swap recipe: [THEMING.md](./THEMING.md#swap-the-typeface). |
| Build errors on Node 25 | Use Node 22 (see prerequisites). |
| Turbopack: `Module not found` for the package or `@fontsource…/*.woff2` | Symlinked `file:` install + Turbopack don't mix — reinstall with `npm install --install-links` (see §1). |
| `Can't resolve '<some runtime lib>'` from `dist-lib/index.js` | A component dependency missing from MVDS's `dependencies` (they're externalized, not bundled). Fix in MVDS's package.json — that's an MVDS bug, report it. |
