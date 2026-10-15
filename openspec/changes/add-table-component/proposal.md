# Add a Table component

## Human anchor

> "ok lets tackle the table component - this I want to go through a full figma cycle."

> "Avoid hard coded styling where possible, like table col widths that just tripped
> up a parallel build. Account for dynamic content that will have more rows or
> columns or fields than you think."

## Outcomes

- **Who:** Agents and people generating UI from MVDS, and consumers of the package
  who have tabular data to render. MVDS is agent-first — a component that does not
  exist in the system is a component every consumer invents.
- **Job:** Render rows and columns whose shape they do not control, without
  re-deciding the layout each time or guessing a width.
- **Done when:**
  1. `Table` exists in `src/components/ui/` with a co-located story, internals tuned
     to the 8-grid (not pristine shadcn metrics).
  2. Columns size from content. The component and its stories contain **no absolute
     pixel dimension** on a content axis and pass `no-fixed-content-dimensions` with
     **no `mvds-allow` suppression** — a carve-out in this component would be the
     system conceding the exact point.
  3. The story enumerates the five states `scale-to-the-data` names as deliberate
     cases: **empty · one row · many rows · a value longer than any sample · one
     more column than the design showed.**
  4. It is declared in `figma/components.config.mjs` and manifested in
     `figma/components/table.figma.mjs`, so `check:figma`'s census counts it rather
     than leaving it unclassified.
  5. The full Figma cycle is on the record: `0.0 As is`, `0.5 Eval`,
     `01.0 Propose:`, `01.5 Eval Delta`. Pushing the component set into MVDS Core is
     the last step and happens on the founder's explicit go-ahead (`docs/SYNC.md`),
     not automatically with the code.
- **Not doing:**
  - **No data-grid behaviour.** No sorting, filtering, pagination, row selection,
    column resizing, virtualisation or sticky columns. MVDS is a presentation layer;
    that behaviour belongs to the consuming app, which can reach for a headless
    library. This is the boundary that keeps the change finishable.
  - **No new runtime dependency.** `check:deps` sits at 54/55 with no headroom on
    purpose. If the component cannot be built from what is already installed, that
    is a stop-and-ask, not a ceiling bump.
  - **No responsive table→cards collapse.** Reshaping a table for narrow viewports
    is its own design decision; it is not smuggled in here.
  - **No landing-page surface** for the new component beyond its Storybook story.

## Why

MVDS exists so that intent is encoded. The most data-shaped component in any
application was the one thing the system never encoded — so a parallel build
hand-rolled it, hardcoded the column widths, and the widths broke. The system's
absence authored that bug as surely as the code did.

#129 turned the lesson into two rules: `no-fixed-content-dimensions` (enforced) and
`scale-to-the-data` (judgment). A table is the sharpest possible test of both,
because it is where every state arrives at once — empty, single, many, long, and
wide all live in one component. Shipping those principles without shipping the
component they were written about leaves the rules enforced and the gap open.

Going through the full Figma cycle is the second half of the ask. A table is also
the component most likely to be *designed* badly rather than coded badly: column
rhythm, header weight, alignment of numerals, row separation, and what the empty
state actually says are design calls, not implementation details. Running the eval
and eval-delta pages against the rubric is how those calls get made on the record
rather than in passing.

## What changes

- `src/components/ui/table.tsx` — added via `npx shadcn@latest add table`, then
  tuned to the 8-grid per AGENTS.md (shadcn ships off-grid padding; heights and
  insets come from the 8-grid set). Column sizing comes from the table layout and
  intrinsic keywords, never a declared width.
- `src/components/ui/table.stories.tsx` — every variant and state, light **and**
  dark, plus the five data states above as named stories.
- `figma/components/table.figma.mjs` and a `figma/components.config.mjs` entry —
  axes extracted from whatever the code actually exposes, so `check:figma` compares
  a declared mirror against a real source.
- Figma pages in the HF working file per `rules/figma.mdc`: as-is, eval, propose,
  eval delta.

## Capabilities

### New Capabilities

- `data-table`: presenting tabular data with content-driven column sizing and
  explicit empty / single / many / long / wide states.

### Modified Capabilities

None.

## Impact

- **The gates will force the bookkeeping, which is the point.** A new file under
  `src/components/ui/` trips `check:principles`' story-coverage rule until the story
  exists, and `check:figma`'s coverage census until the component is classified in
  `components.config.mjs`. Neither is a chore to route around.
- **`no-fixed-content-dimensions` applies to this PR's own diff.** If the component
  needs a suppression to pass, the design is wrong, not the rule.
- **Chromatic will need new baselines** for every new story.
- **Open input needed at discovery (0.0 As-is):** there is no existing MVDS table to
  evaluate, so the as-is surface has to come from somewhere. The candidates are the
  hand-rolled table from the parallel build (which the founder has and this session
  does not) or stock shadcn `Table` as an untuned baseline. Worth settling before
  discovery runs, because it decides what the 0.5 Eval findings are *about*.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md` — "Let content size itself", "Design for n, not for the
  mock", and the shadcn-tuning rule
- The principles this component must embody: `no-fixed-content-dimensions` and
  `scale-to-the-data` in `principles.config.mjs`
