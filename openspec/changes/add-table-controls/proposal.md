# Add Table controls — sort, filter, paginate, select

## Human anchor

> "we can't just ignore pagination or sorting and filtering. propose the components
> that allow us to handle that."

That lands on `add-table-component`'s Not-doing list, which read:

> *"No data-grid behaviour — no sorting, filtering, pagination, row selection,
> column resizing, virtualisation or sticky columns."*

The founder is right and that line was wrong — not merely narrow.

## Why

**The old boundary conflated two different things and discarded both.**

| | Belongs to | Status |
| --- | --- | --- |
| **State and logic** — comparators, filter predicates, page math, URL sync, server round-trips | The consuming app. It knows the data, the API and the routing; MVDS cannot. | **Excluded, permanently** |
| **Controls, ARIA and states** — what a sortable header looks like *and announces*, how a page range is phrased, how "no matches" differs from "no records", where a selection count lives | **The design system.** | **This change** |

The second row is the argument for MVDS existing. A sortable header is not a
chevron — it is a `<th>` carrying `aria-sort`, whose label is a button, whose
three-state cycle a screen reader has to be able to follow. Every consumer who
reinvents that gets it wrong, silently, and the a11y gate cannot catch what was
never built. Leaving it out does not keep these behaviours out of products; it
guarantees each product ships its own, worse.

**The seam: MVDS renders state and emits intent; the consumer owns the data.**

That is the same seam `add-table-component` already draws — `Table` renders rows
it does not fetch — just extended to the controls that sit around them.

## Outcomes

- **Who:** Agents and people building list and admin screens out of MVDS, and
  consumers with more rows than fit on one screen.
- **Job:** Let a reader sort, narrow, page through and act on a set of rows —
  without re-deciding the markup, the keyboard model or the ARIA each time.
- **Done when:**
  1. **`TableHead` gains `sortable`** — a prop on the existing part, not a new one.
     The label renders as a button, the `<th>` carries
     `aria-sort="ascending" | "descending" | "none"`, and `onSort` fires. Cycle:
     none → ascending → descending → none. The component never sorts the data.
  2. **`TableToolbar`** — the region above the table, with slots for search,
     filters and actions. Owns layout and spacing; knows nothing about what a
     filter means.
  3. **`TableFilterChips`** — the *applied* filters, each individually removable,
     plus "Clear all". Distinct from the inputs that set them: this is the state a
     reader loses track of.
  4. **`TableResultCount`** — "Showing 12 of 240." Small and load-bearing: it is
     how a reader tells an excerpt from the whole set, which is
     `add-table-component`'s delta finding F6 generalised.
  5. **`TablePagination`** — a `<nav aria-label>` with a range label, prev/next,
     page numbers carrying `aria-current="page"`, and a page-size `Select`. No
     page math.
  6. **`TableSelect` + `TableSelectionBar`** — a leading checkbox column with
     select-all (including the indeterminate state) in the header, and the bar
     that carries the selection count and its bulk actions. Does not own the
     selection set.
  7. **`TableEmpty` splits** — `no-records` and `no-matches` are different facts
     with different remedies; the second needs a "Clear filters" action.
  8. **`TableLoading`** — skeleton rows plus an `aria-live` announcement, because
     once a sort or page control exists the pending state is no longer someone
     else's problem.
  9. Every part has a co-located story covering light **and** dark, and the
     keyboard model is exercised, not just the render.
- **Not doing:**
  - **Comparators, filter predicates, page math, URL sync, server round-trips.**
  - **Virtualisation, column resizing or reordering, sticky columns.**
  - A headless table library as a dependency — see below.

## What changes

- `src/components/ui/table.tsx` — `TableHead` gains `sortable`, `sortDirection`
  and `onSort`; `TableEmpty` gains a variant; `TableLoading` is added.
- `src/components/ui/table-toolbar.tsx`, `table-pagination.tsx`,
  `table-selection.tsx` — the new parts, each with a co-located story.
- `figma/components/` entries so `check:figma`'s census counts them.
- Figma: `0.0 As is` → `01.0 Propose: add-table-controls` → `01.5 Eval Delta`,
  on its own numbered pages per `rules/figma.mdc`.

## Capabilities

### New Capabilities

- `table-controls`: the presentational controls around a `Table` — sorting
  affordance and announcement, filter surface and applied-filter state, result
  count, pagination, and row selection — with the data logic left to the
  consumer.

### Modified Capabilities

- `table` — `TableHead` gains props and `TableEmpty` gains a variant. A real
  spec delta, not just an implementation detail.

## Impact

- **No new runtime dependency, and this was checked rather than assumed.** Every
  part composes from components MVDS already ships: `button`, `input`, `select`,
  `checkbox`, `badge`. `check:deps` stays at **54/55** — no ceiling bump. If a
  part turns out to need one, that is a stop-and-ask.
- **This change depends on `add-table-component`.** The controls wrap a `Table`
  that has to exist first, which is why these are sequenced rather than merged
  (founder's call, 2026-10-15).
- **The spec cap is the other reason they are separate.** `mvds-default` allows
  max 5 `### Requirement:` blocks and `table`'s spec already uses all five.
- **Keyboard and screen-reader behaviour is the deliverable here**, more than the
  pixels. The stories must exercise focus order, the sort cycle, select-all's
  indeterminate state and the live-region announcements — a render test that only
  proves these draw would be a fail-open gate of exactly the kind
  `declarations-must-resolve` exists to catch.
- **The as-is surface is real.** `principles-index` at 24 rows is already past the
  point where a reader wants to sort by enforcement or filter to the enforced
  ones — so the 0.0 capture has somewhere honest to point.

## Optional links

- The change this follows: `openspec/changes/add-table-component/`
- House rules: `AGENTS.md`
- The principles this must embody: `scale-to-the-data`,
  `declarations-must-resolve`, `visibility-of-system-status`,
  `recognition-rather-than-recall`
