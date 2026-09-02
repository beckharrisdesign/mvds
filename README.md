# MVDS — Minimum Viable Design System

An **opinionated design system that doesn’t drift** — built for both human and
agentic founders. MVDS turns intent into reusable primitives and machine-enforced
constraints — so every new experiment starts with strong principles, and stays
that way. Its elements: principles, the token layer, the component library, the
Figma library, OpenSpec schemas, and skills.

Under the hood it proves a strong link between shadcn/ui + Tailwind code and Figma
components, with **code as the single source of truth**.

> Built for a **Figma Pro** plan (not Enterprise). The sync is intentionally
> **one-way, code → Figma**, and re-runnable. See [`docs/SYNC.md`](docs/SYNC.md).
>
> **Live Figma mirror:** [MVDS Core](https://www.figma.com/design/C20nU0mROzk3Zr0I9BELJF/MVDS-Core?node-id=0-1&t=w5EqXarr3p4eYxpC-1) (public view-only)

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Components | shadcn/ui (`radix-nova`, CSS variables) |
| Gallery | Storybook 10 (`@storybook/react-vite`) |
| Figma link | Figma MCP `/figma-generate-library` (Plugin API) |

## The keystone

[`src/index.css`](src/index.css) is the **token layer** — the single source of truth.
Edit tokens only there. `:root` is the light mode, `.dark` is the dark mode; these are
the two modes that map to Figma variable modes. Tailwind, Storybook, and the Figma
generator all read this one file.

## Foundations (app DNA)

The scales and layout primitives that sit *beneath* components:

- **Spacing scale** — 8-point grid (multiples of 8, with 4 as the only half-step);
  primitive props take px values directly (`gap={16}`). Tailwind's 4px atomic unit
  is kept so shadcn control internals keep their optical metrics.
- **Typography ramp** — semantic `text-display` → `text-caption`, each carrying
  size + line-height + weight + tracking (defined in [`src/index.css`](src/index.css)).
- **Breakpoints** — `sm`/`md`/`lg`/`xl`/`2xl`, used by the Container and `@container` queries.
- **Layout primitives** ([`src/components/layout/`](src/components/layout)) — `Container`,
  `Stack`, `Inline`, `Grid`/`GridItem` (responsive cols), `Spacer`, `Section`,
  `Layer`, `Chrome`. Thin typed Tailwind wrappers whose props snap to the
  spacing/breakpoint scales. *shadcn ships none of these — this is the
  deliberate, opinionated layout layer.*

See them under **Foundations/** in Storybook.

## Components

Deliberately small, but complete enough that a first screen needs zero custom
controls:

- **Controls** (`src/components/ui/`, shadcn-sourced + MVDS-tuned) — `Button`,
  `Badge`, `Card`, `Label`, `Input`, `Textarea`, `Select`, `Checkbox`,
  `RadioGroup`, `Switch`.
- **Form patterns** (`src/components/forms/`, MVDS-authored) — `Field` (the
  label/help/error scaffold every control plugs into) and `Dropzone`
  (drag / drop / paste / picker file selection).
- **Blocks** (`src/components/blocks/`) — `Hero`, `Callout`, `Blockquote`,
  `MediaFrame`.

Add more anytime: `npx shadcn@latest add dialog tabs …` — then re-apply the
8-grid tuning pass (`src/components/ui/CLAUDE.md`).

## Getting started

```bash
npm install
npm run dev              # the MVDS site — landing page + manifest dashboard, light/dark toggle
npm run storybook        # the living component gallery at http://localhost:6006
```

`npm install` also provides the repo's dev CLIs — notably `npx openspec` for the
propose → design → apply loop in [`openspec/`](openspec/README.md). Working in a
**git worktree**? Run `npm install` inside it; it needs its own `node_modules`.

## Using MVDS in an app

Published to the **public npm registry** — no `.npmrc`, no login, no token.
Two steps:

**1. Install:**
```bash
npm install @beckharrisdesign/mvds
```

**2. Wire the CSS** (in your global stylesheet, e.g. `app/globals.css`):
```css
@import "@beckharrisdesign/mvds/styles.css";
@source "../node_modules/@beckharrisdesign/mvds/dist-lib/**/*.js";
@source "../**/*.{ts,tsx}";
```
> The `@source` line pointing at `dist-lib` is the one people forget — without it
> Tailwind never generates the components' utilities and they render unstyled.

Or skip the wiring entirely and copy [`examples/starter/`](examples/starter) — a
complete working app. CI builds it against the published package on every PR
(`npm run verify:consumer`), so those instructions are verified, not just written.

Then import components:
```tsx
import { Button, Card, Input, Field, Dropzone, Stack, Inline, Grid, Container } from "@beckharrisdesign/mvds"
```

Full ingestion runbook (auth, dark mode, theming, troubleshooting):
[`docs/CONSUMING.md`](docs/CONSUMING.md). Brand overrides (colors, font, radius):
[`docs/THEMING.md`](docs/THEMING.md). Reference consumer: `bhd-headless-notion`.

## The code → Figma sync

```bash
# 1. build / edit components in src/components/ui/*  (tokens in src/index.css)
# 2. verify in Storybook
# 3. push to Figma — in this agent, run:
/figma-generate-library
```

Full workflow, Pro-tier constraints, and the future-proofing notes live in
[`docs/SYNC.md`](docs/SYNC.md).

## Project layout

```
src/
  index.css              ← TOKEN LAYER (source of truth: @theme + :root + .dark)
  components/ui/         ← shadcn-sourced controls, MVDS-tuned (+ co-located stories)
  components/forms/      ← Field + Dropzone (MVDS-authored form patterns)
  components/layout/     ← the layout primitives + scales.ts
  components/blocks/     ← Hero, Callout, Blockquote, MediaFrame
  components/site/       ← the landing page's sections (hero, principles, gates)
  lib/utils.ts           ← cn() helper
  App.tsx                ← the site: landing page + manifest dashboard
.storybook/              ← Storybook config (preview imports the token layer)
docs/SYNC.md             ← the re-runnable code → Figma workflow
docs/CONSUMING.md        ← install + wire MVDS into an app (agent-followable)
docs/THEMING.md          ← brand a consumer app via the token cascade
docs/VERIFICATION.md     ← How we enforce (plan → code → test → out in the world)
code-connect/            ← dormant on Pro; activate after an Org/Enterprise upgrade
```
