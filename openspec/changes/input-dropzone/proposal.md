# input-dropzone

## Human anchor

> "yes lets propose the fixes 1-3 to start. 4-6 I've had in the back of my mind for a whie and want to get to as well." — the dogfood round the founder ordered with: "ok lts dogfood an experiment! A landing page, for a wellness and fitness coach…" and "I did dogfood the etsy listing kit in the experiment hub with mvds from day 1. lets also look at how that went and what was missing."

## Outcomes

- **Who:** Anyone prototyping on MVDS — the founder, agents, and package consumers. Text capture and file upload are the first interactions almost every experiment ships.
- **Job:** Capture a line of text (email signup, search, a form field) and accept a file (drag / drop / paste / picker) entirely on-system.
- **Done when:** `Input` is exported from the package — shadcn-sourced, tuned to the 8-grid (heights 24/32/40, on-grid padding), composing with the existing `Field` wrapper — with a co-located story passing the light+dark a11y gates; a `Dropzone` pattern (drag/drop/paste zone over a hidden file input, with selected-file affordance and keyboard/SR accessibility) is exported with the same story coverage; both are usable from the published package, so an email-capture form and an upload screen need zero custom controls.
- **Not doing:** Dialog, Tabs, Tooltip, Table, Toast, Spinner (asks 5–6, later changes); form validation or submission machinery; upload transport/progress (Dropzone ends at "files selected, hand them to the app"); multi-step upload management UI.

## Why

Both dogfoods hit this wall independently, on their first screen. Motion & Muse could not build an email-capture form — the #1 landing-page pattern — and fell back to a `mailto:` CTA (`FINDINGS.md` gap #1). The Etsy Listing Kit's core interaction is a file upload, and with nothing to land on it hand-rolled a 30-line dropzone plus its own thumbnail row and button states (`app/etsy-listing-kit/page.tsx:185-214`, `elk.module.css:70-97`). The hub self-nominated the fix (`docs/PACKAGE_CONTRIBUTION_CANDIDATES.md:20`: the dropzone is "a common enough interaction to live in MVDS"). Meanwhile Textarea, Select, Checkbox, Radio, and Switch all exist — the single-line input is the conspicuous absence, and the repo README has said "Add more anytime: `npx shadcn add input …`" since 0.1.

"Minimum viable for prototyping" is the package's name-level promise; it is not met while a sign-up form is impossible.

## What changes

- `npx shadcn@latest add input`, then the standard MVDS tuning pass (8-grid heights/padding per `src/components/ui/CLAUDE.md`), export from `src/index.ts`, co-located `input.stories.tsx` enumerating states (default, disabled, invalid, with `Field`).
- A new `Dropzone` component (drag/drop/paste + hidden `<input type="file">`, focus-visible ring, SR status region) — MVDS-authored since shadcn ships none; story enumerating idle/dragging/selected/disabled.
- Story coverage principles pick both up automatically (`story-coverage-ui`).

## Capabilities

### New Capabilities

- `input`: single-line text input, 8-grid tuned, Field-composable, both modes AA.
- `dropzone`: accessible file-selection pattern (drag / drop / paste / picker) with selected-state affordance.

### Modified Capabilities

- (none)

## Impact

- `src/components/ui/input.tsx` (+ story), new dropzone component (+ story), `src/index.ts` exports, `principles.config.mjs` coverage manifests if scopes need touching, README component inventory.
- Consumers: unblocks email capture (Motion & Muse) and upload screens (ELK-shaped products) on-system.

## Optional links

- Evidence: `motion-muse` repo `FINDINGS.md` (gap #1); hub `app/etsy-listing-kit/elk.module.css:70-97`; hub `docs/PACKAGE_CONTRIBUTION_CANDIDATES.md:20`
- Vendored-ui tuning rules: `src/components/ui/CLAUDE.md`
- House rules: `AGENTS.md`
