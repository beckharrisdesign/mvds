# Contributing to MVDS

MVDS is **code-as-source-of-truth** (see [AGENTS.md](AGENTS.md) for the design-system
house rules). This file covers the **delivery workflow** only.

## Branch + PR workflow (required)

- **Never push to `main` directly.** All changes land via pull request, reviewed
  in isolation before merge. (Recommended: enable branch protection on `main`.)
- **One branch → one PR.** Start every change on its own branch off the latest
  `main`; open a dedicated PR for it.
- **PRs are opened, marked _ready for review_, and left for a human to approve and
  merge.** Automation may draft and prepare PRs but never self-merges.

## What runs on every PR

1. **CI gate** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) — `npm run build`
   (tsc + Vite) then `npm test`: every Storybook story in headless Chromium with
   render, interaction, and axe a11y checks, in **both light and dark**. Must be green.
2. **Vercel preview** — a per-PR deployment of the **deploy hub**
   (`npm run build:site` → `dist-site`, configured in [`vercel.json`](vercel.json)): a
   landing page at `/` linking to the sample app at `/app/` and the Storybook gallery
   at `/storybook/`, so reviewers can browse both for the branch in isolation before
   merging. Vercel posts the preview URL on the PR.

## Local gate (run before opening a PR)

```bash
npm run build              # tsc + vite — must pass
npm test                   # stories in headless Chromium + axe, light + dark
```

> Working in a fresh git worktree? Run `npm ci` (and `npx playwright install chromium`)
> inside it first — worktrees don't inherit the parent's `node_modules`, and the
> Storybook/Vitest browser runner needs deps resolvable within the worktree root.

After changing tokens or system components, also re-run the Figma sync
([`docs/SYNC.md`](docs/SYNC.md)).
