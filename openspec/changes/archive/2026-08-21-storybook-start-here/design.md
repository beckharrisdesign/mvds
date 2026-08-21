## Context

Explore file iterated 0.0 → 06.0. Founder approved **06.0** copy for How we enforce and the Intro IA (human title before id; How we enforce in Storybook). Landing stays marketing; Storybook is the technical surface.

## Goals / Non-Goals

**Goals:**

- Storybook Intro matching explore IA and 06.0 prose.
- Live principles (titles in manifest) with table-style index for technical readers.
- Reuse PackageDocs for Get started; keep VERIFICATION.md as twin.

**Non-Goals:**

- Sync to MVDS Core Figma.
- Replace landing PrinciplesPanel with the table (landing may keep cards; Storybook is deeper).
- Rename machine principle `id`s (display-only `nn##-` for NN/g rows).

## User flow / IA

```
INTRO
  Start here
  Design principles
  How we enforce
  Get started
SPECIMENS
  Foundations / Blocks / UI
```

Sidebar = TOC (no in-page TOC).

## Visual design / Figma

| Item             | Value |
| ---------------- | ----- |
| Primary file URL | https://www.figma.com/design/2XFLXbbmgwPrh6MGdMRdHF |
| Frames in scope  | **06.0** How we enforce (approved copy); **04.0** principles column order (human title → id); Intro nav across 05.0/06.0 |
| Libraries        | Compose with MVDS tokens/primitives in code — explore file is scratch, not Core |
| Breakpoints      | Storybook canvas (docs-width); layout primitives responsive as elsewhere |
| Status           | **ready for apply** — design phase complete |

## Decisions

- Add `title` on each principle record (source of truth for human title).
- NN/g **display** ids (`nn01-…`) derived for Storybook readability; machine `id` unchanged for `mvds-allow` / gate.
- How we enforce is a site component fed by structured copy aligned to `docs/VERIFICATION.md`.
- Get started = `PackageDocs` under Intro title (specimen Site story stays `!dev`).

## Risks / Trade-offs

- Dual surfaces (landing cards vs Storybook table) can drift — both read the same snapshot.
- OpenSpec bootstrap lands in the same PR as this change (founder: part of bootstrap).
