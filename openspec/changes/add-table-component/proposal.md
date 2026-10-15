# Add a Table component

## Human anchor

> "ok lets tackle the table component - this I want to go through a full figma cycle."

> "Avoid hard coded styling where possible, like table col widths that just tripped
> up a parallel build. Account for dynamic content that will have more rows or
> columns or fields than you think."

> "yes to a landing page surface -- its a component and should be represented like
> the others"

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
  4. **The landing page represents it like every other component.** The Component
     library inventory is a filesystem walk (`familyComponents` in the snapshot
     generator), so `Table` appears in the list and the tally the moment the file
     lands — the same representation `Input`, `Select`, `Switch` and `Dropzone`
     get, none of which the landing page renders either. No landing-page layout
     changes.
  5. **The Storybook principles index stops hand-rolling a table.**
     `principles-index.tsx` builds one out of a five-column `Grid` (see Why) and
     renders real rows through `Table` instead — the component used on real data,
     replacing a hand-rolled table. This is a Storybook surface.
  6. It is declared in `figma/components.config.mjs` and manifested in
     `figma/components/table.figma.mjs`, so `check:figma`'s census counts it rather
     than leaving it unclassified.
  7. The full Figma cycle is on the record: `0.0 As is`, `0.5 Eval`,
     `01.0 Propose:`, `01.5 Eval Delta`. Pushing the component set into MVDS Core is
     the last step and happens on the founder's explicit go-ahead (`docs/SYNC.md`),
     not automatically with the code.
- **Not doing:**
  - **No data-grid behaviour** — no sorting, filtering, pagination, row selection,
    column resizing, virtualisation or sticky columns. This is the boundary that
    keeps the change finishable: MVDS is a presentation layer, and that behaviour
    belongs to the consuming app, which can reach for a headless library. (Hence
    the capability is `table`, not `data-table` — see Capabilities.)
  - **No new runtime dependency.** `check:deps` sits at 54/55 with no headroom on
    purpose. If the component cannot be built from what is already installed, that
    is a stop-and-ask, not a ceiling bump.
  - **No responsive table→cards collapse.** Reshaping a table for narrow viewports
    is its own design decision; it is not smuggled in here. (It is, however, the
    live question for `principles-index` at `base` — see Impact.)
  - **No landing-page layout changes at all.** `VerificationPanel` and
    `PrinciplesPanel` render cards on purpose. This change proposes a COMPONENT,
    not a page redesign — the landing page's representation of it is the inventory
    entry, exactly as for every other component it does not render.

## Why

MVDS exists so that intent is encoded. The most data-shaped component in any
application was the one thing the system never encoded — so a parallel build
hand-rolled it, hardcoded the column widths, and the widths broke. The system's
absence authored that bug as surely as the code did.

#129 turned the lesson into two rules: `no-fixed-content-dimensions` (enforced) and
`scale-to-the-data` (judgment). A table is the sharpest possible test of both,
because it is where every state arrives at once — empty, single, many, long, and
wide all live in one component.

**And we have the same bug at home — in Storybook.** `src/components/site/principles-index.tsx`
renders the principles as a five-column `Grid` with a header row of `<span>`s and
one `<Grid>` per row, separated by borders. It is a table in everything but
structure:

- **No table semantics.** No `<table>`, `<thead>`, `<th>`, `<tr>` or `<td>`, so a
  screen reader gets a stack of text with no header-to-cell association and no
  table navigation.
- **Uniform columns, not content-driven ones.** `cols={{ base: 1, lg: 5 }}` gives
  every column an identical fraction, so the long `description (manifest)` prose
  gets exactly the width of the `enforcement` Badge. It is the mirror image of the
  hardcoded-width bug — the width is not pinned in pixels, it is pinned to a ratio
  that ignores the content.
- **It breaks at `base`.** Collapsing to one column stacks the five header labels
  and then stacks each row's five values, so the header/value association is gone
  at exactly the width where you most need it.

That surface now renders **24 principles**, and it is where MVDS displays
`no-fixed-content-dimensions` and `scale-to-the-data` to a reader. Converting it is
the system eating its own cooking.

**Two corrections, recorded rather than quietly fixed (2026-10-15).**

*First:* an earlier draft claimed principles-index was ON the landing page. It is
not — `PrinciplesIndex` is imported nowhere but its own story. The mistake was
reading `src/components/site/` as "the landing page" without opening `App.tsx`.

*Second, and the one that matters:* having found that, this proposal then went
looking for landing-page content to convert and nominated `VerificationPanel`'s
gates. Founder: **"we're proposing a new component, not proposing the landing page
layout."** Correct — that was scope drift. Most MVDS components (`Input`, `Select`,
`Switch`, `Dropzone`) never appear on the landing page; they are represented by the
generated Component library inventory, and so is this one, for free. The design
gate's job here is the COMPONENT: its parts, its states, and its narrow-width
behaviour.

Going through the full Figma cycle is the second half of the ask. A table is the
component most likely to be *designed* badly rather than coded badly: column
rhythm, header weight, numeral alignment, row separation, and what the empty state
actually says are design calls, not implementation details. The eval and eval-delta
pages are how those get made on the record rather than in passing.

## What changes

- `src/components/ui/table.tsx` — added via `npx shadcn@latest add table`, then
  tuned to the 8-grid per AGENTS.md (shadcn ships off-grid padding; insets come
  from the 8-grid set). Column sizing comes from table layout and intrinsic
  keywords, never a declared width.
- `src/components/ui/table.stories.tsx` — every variant and state, light **and**
  dark, plus the five data states above as named stories.
- `src/components/site/principles-index.tsx` — the hand-rolled `Grid` table becomes
  a real `Table`.
- `figma/components/table.figma.mjs` and a `figma/components.config.mjs` entry —
  axes extracted from whatever the code actually exposes, so `check:figma` compares
  a declared mirror against a real source.
- Figma pages in the HF working file per `rules/figma.mdc`: as-is, eval, propose,
  eval delta.

## Capabilities

### New Capabilities

- `table`: presenting tabular data with content-driven column sizing and explicit
  empty / single / many / long / wide states.

  **Named `table`, not `data-table`, deliberately.** "Data table" is a term of art
  for the thing the Not-doing list excludes — shadcn's own *Data Table* page is
  TanStack Table with sorting, filtering and pagination. Calling the capability
  `data-table` would contradict the scope in the same document and would invite a
  future reader to build exactly what this change rules out. It also matches the
  existing component capabilities in `openspec/specs/`, which are bare singular
  names: `input`, `dropzone`.

### Modified Capabilities

- `manifest-ia` — the principles index changes its rendering, not its content.
  Confirm at specs whether this is a real spec delta or just an implementation
  detail of a capability whose requirements are unchanged.

## Impact

- **The gates will force the bookkeeping, which is the point.** A new file under
  `src/components/ui/` trips `check:principles`' story-coverage rule until the story
  exists, and `check:figma`'s coverage census until the component is classified in
  `components.config.mjs`.
- **`no-fixed-content-dimensions` applies to this PR's own diff.** If the component
  needs a suppression to pass, the design is wrong, not the rule.
- **Converting `principles-index` changes a shipped surface.** Expect Chromatic
  baselines for its stories, and the a11y gate now runs over real table semantics —
  which should be an improvement, but it is a change to a page that is currently
  green.
- **The narrow-width question gets real.** Today the index collapses to one column
  at `base`. A `<table>` does not collapse by itself, and table→cards is explicitly
  out of scope — so design must say what the index does at S (480px): horizontal
  scroll within the table, a reduced column set, or something else. **This is the
  main open design decision and belongs in the 01.0 Propose frames.**
- **0.0 As-is surface:** `principles-index` as it ships today — a real MVDS
  surface, with a running story to evaluate (the schema prefers the story as the
  eval target and the Figma page as the visual record). If the landing-page
  candidate is `VerificationPanel`, its current card grid is captured as-is too.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md` — "Let content size itself", "Design for n, not for the
  mock", and the shadcn-tuning rule
- The principles this component must embody: `no-fixed-content-dimensions` and
  `scale-to-the-data` in `principles.config.mjs`
