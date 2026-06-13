# MVDS — Minimum Viable Design System

An **agent-first design system** for early startup prototyping with solid
foundational design strategy. It encodes intent in code — tokens, an 8-point
spacing grid, a type ramp, and layout primitives — so both people and LLM agents
generate consistent, on-brand UI from day one.

Under the hood it proves a strong link between shadcn/ui + Tailwind code and Figma
components, with **code as the single source of truth**.

> Built for a **Figma Pro** plan (not Enterprise). The sync is intentionally
> **one-way, code → Figma**, and re-runnable. See [`docs/SYNC.md`](docs/SYNC.md).
>
> **Live Figma mirror:** [MVDS · Figma](https://www.figma.com/design/C20nU0mROzk3Zr0I9BELJF/MVDS-Test)

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
  `Stack`, `Inline`, `Grid` (responsive cols), `Spacer`. Thin typed Tailwind wrappers
  whose props snap to the spacing/breakpoint scales. *shadcn ships none of these — this
  is the deliberate, opinionated layout layer.*

See them under **Foundations/** in Storybook.

## Components

The component set is intentionally tiny:

- **Button** — variant-driven atom (`variant` × `size` → Figma component properties).
- **Card** — composite molecule; the `WithButton` story nests a Button to prove
  composition survives the trip into Figma.

Add more anytime: `npx shadcn@latest add input badge dialog …`

## Getting started

```bash
npm install
npm run dev              # demo app — Card + Button, with a light/dark toggle
npm run storybook        # the living component gallery at http://localhost:6006
```

## Using MVDS in an app

MVDS is consumed as a package (`@beckharrisdesign/mvds`) — install, import the
styles, `@source` the dist, done. The full ingestion runbook (written so an
agent can follow it cold) is [`docs/CONSUMING.md`](docs/CONSUMING.md); putting
a brand on it — colors, type, dark mode — is [`docs/THEMING.md`](docs/THEMING.md).
Reference consumer: the `bhd-headless-notion` sibling repo.

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
  components/ui/
    button.tsx  button.stories.tsx
    card.tsx    card.stories.tsx
  lib/utils.ts           ← cn() helper
  App.tsx                ← demo composition
.storybook/              ← Storybook config (preview imports the token layer)
docs/SYNC.md             ← the re-runnable code → Figma workflow
docs/CONSUMING.md        ← install + wire MVDS into an app (agent-followable)
docs/THEMING.md          ← brand a consumer app via the token cascade
code-connect/            ← dormant on Pro; activate after an Org/Enterprise upgrade
```
