# Capability: table

## Purpose

MVDS exports a `Table` built from semantic table elements, whose columns size from
their content rather than from a declared width, and whose empty / single / many /
long / wide states are designed rather than emergent. It ends at presentation —
sorting, filtering, pagination, selection and virtualisation belong to the consuming
app.

## Outcomes

- **Who:** Agents and people generating UI from MVDS, and consumers of the package
  with tabular data to render.
- **Job:** Render rows and columns whose shape they do not control, without
  re-deciding the layout or guessing a width.
- **Done when:** See proposal — `Table` is exported with table semantics,
  content-driven columns, five named data-state stories, a decided narrow-width
  behaviour, and MVDS's own tabular surfaces rendering through it.
- **Not doing:** Data-grid behaviour (sort / filter / paginate / select / resize /
  virtualise); a new runtime dependency; a responsive table→cards collapse.

## ADDED Requirements

### Requirement: One Table renders tabular data with real table semantics

A consumer composes a table from MVDS parts and gets actual table markup, so
assistive technology can navigate it as a table rather than as a stack of text.

**Fails until:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
`TableCell` and `TableCaption` are exported from the package, and the rendered
output is `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th scope>` / `<td>` — not
`div`s with a grid class.

#### Scenario: A screen-reader user navigates by column

- **WHEN** a screen-reader user moves through a rendered `Table`
- **THEN** each cell is announced with its column header, the table's row and column
  counts are available, and the accessible name comes from a caption or
  `aria-label` rather than being absent

### Requirement: Columns size from their content, never from a declared width

Column widths come from the content and the available space, so nobody has to guess
a pixel value for data they have not seen.

**Fails until:** `table.tsx` and its stories pass `npm run check:principles` for
`no-fixed-content-dimensions` with **no `mvds-allow` suppression**, and a cell
holding a value far longer than every other row neither clips its text nor forces
the page into horizontal scroll.

#### Scenario: One cell holds a value much longer than the rest

- **WHEN** a table renders rows where a single cell's value is several times longer
  than the same cell in every other row
- **THEN** the long value stays readable — wrapped, or truncated with the full value
  still reachable — the other columns keep usable widths, and the page itself does
  not scroll sideways

### Requirement: The empty, single, many, long and wide states are each decided

Every state `scale-to-the-data` names renders as something somebody chose, so the
data cannot decide the layout by arriving.

**Fails until:** Named stories cover all five states and pass `npm test` in light
and dark, and the zero-row state renders a message saying what is missing rather
than an empty bordered panel.

#### Scenario: A table arrives with no rows

- **WHEN** a `Table` is rendered with an empty row set
- **THEN** it shows an empty state that says what is absent, keeps its column
  headers legible, and does not render as a blank or collapsed box

#### Scenario: A table arrives with one more column than the design showed

- **WHEN** a consumer adds a column beyond those in the original design
- **THEN** the table absorbs it without any width needing to be re-decided, and no
  column becomes unreadably narrow

### Requirement: The narrow-width behaviour is a decision, not a default

At small viewports the table does something deliberate, because a `<table>` does not
reflow on its own and `scale-to-the-data`'s "wide" case is where that shows.

**Fails until:** At 480px the rendered table neither causes horizontal scrolling of
the page nor leaves its header associations unreachable, and the behaviour chosen
(contained horizontal scroll, a reduced column set, or another decided option) is
recorded in `design.md` and demonstrated by a story.

#### Scenario: A wide table is viewed at S (480px)

- **WHEN** a table with more columns than fit is viewed at 480px
- **THEN** the chosen behaviour applies, the page does not scroll sideways as a
  whole, and a keyboard user can reach the scrollable region if scrolling is the
  chosen behaviour

### Requirement: MVDS renders its own tabular data through Table

The system uses the component it ships, so the table is exercised by real data
rather than only by fixtures.

**Fails until:** `src/components/site/principles-index.tsx` renders its rows through
`Table` and contains no per-row `Grid`, and one landing-page surface (chosen at the
design gate) renders a `Table`; both pass the light and dark a11y gates.

#### Scenario: The principles index renders 24 principles through Table

- **WHEN** the Storybook principles index renders the live manifest
- **THEN** the rows come from `Table` with header cells associated to columns, the
  provenance and enforcement columns stay legible (the `manifest-ia` requirements
  "Principle provenance is legible" and "Each manifest declares its enforcement
  story" are don't-breaks here), and the long `description` column no longer shares
  an identical width fraction with a Badge

#### Scenario: A landing-page surface renders a Table

- **WHEN** a visitor reaches the landing-page surface chosen at the design gate
- **THEN** that surface renders tabular content through `Table`, and the other
  card-based sections are unchanged
