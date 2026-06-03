# figma-blank-space

A **Minimum Viable Design System** that proves a strong link between shadcn/ui +
Tailwind code and Figma components — with **code as the single source of truth**.

> Built for a **Figma Pro** plan (not Enterprise). The sync is intentionally
> **one-way, code → Figma**, and re-runnable. See [`docs/SYNC.md`](docs/SYNC.md).
>
> **Live Figma mirror:** [MVDS-Test](https://www.figma.com/design/C20nU0mROzk3Zr0I9BELJF/MVDS-Test)

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Components | shadcn/ui (`radix-nova`, CSS variables) |
| Gallery | Storybook (`@storybook/react-vite`) |
| Figma link | Figma MCP `/figma-generate-library` (Plugin API) |

## The keystone

[`src/index.css`](src/index.css) is the **token layer** — the single source of truth.
Edit tokens only there. `:root` is the light mode, `.dark` is the dark mode; these are
the two modes that map to Figma variable modes. Tailwind, Storybook, and the Figma
generator all read this one file.

## Components

The foundation set is intentionally tiny:

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
code-connect/            ← dormant on Pro; activate after an Org/Enterprise upgrade
```
