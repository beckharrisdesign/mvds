# add-table-component — design

## Context

`principles-index.tsx` hand-rolls a table out of a five-column `Grid`. The eval
(discovery 0.5) found that this is not a styling problem: there is no `<table>`,
so there is no header-to-cell association, and **axe does not flag it** — nothing
claims to be a table, so the a11y gate passes a table nobody can navigate
non-visually. The same absence is what let a parallel build hardcode column
widths: MVDS never encoded the most data-shaped component in any application, so
every consumer invents it.

This design covers the **component** — its parts, how they recombine, what each
data state looks like, and what it does at 480px. It does not touch the landing
page: `Table` is represented there by the generated Component library inventory,
the same way `Input`, `Select`, `Switch` and `Dropzone` are.

## Goals / Non-Goals

**Goals:**

- Real table semantics — `<table>/<thead>/<tbody>/<tr>/<th scope>/<td>` — so the
  a11y gate has something it can actually check.
- Columns sized by content and available space, passing
  `no-fixed-content-dimensions` with **no `mvds-allow`**.
- The five `scale-to-the-data` states each rendered as a decision: empty, one,
  many, long, wide.
- A decided narrow-width behaviour, demonstrated by a story.
- MVDS's own principles index rendering through it.

**Non-Goals:**

- Data-grid behaviour: sorting, filtering, pagination, row selection, column
  resizing, virtualisation, sticky **columns**.
- A responsive table→cards collapse.
- Any new runtime dependency (`check:deps` is 54/55, no headroom on purpose).
- Loading and error states — see **D8**; they are the consumer's, said out loud
  rather than conflated with empty.
- Any landing-page layout change.

## User flow / IA

A consumer declares the column set **once, as data**, and composes the parts:

```
<TableScrollRegion aria-labelledby={captionId}>   ← role="region" tabIndex={0}, max-h, overflow-x-auto
  <Table>                                          ← w-full
    <TableCaption id={captionId}>…</TableCaption>  ← the single authored accessible name
    <TableHeader>                                  ← sticky top-0 bg-background
      <TableRow>{columns.map(c => <TableHead scope="col">…</TableHead>)}</TableRow>
    </TableHeader>
    <TableBody>
      {rows.length === 0
        ? <TableEmpty colSpan={columns.length} title=… hint=… />
        : rows.map(r => <TableRow>{columns.map(c => <TableCell>…</TableCell>)}</TableRow>)}
    </TableBody>
  </Table>
</TableScrollRegion>
```

`columns` has three readers — header cells, body cells, and `TableEmpty`'s
`colSpan`. That is the whole of **D4**, and it is what makes "one more column"
a single edit.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | <https://www.figma.com/design/CqgZ5tesr6qApnKiAadhVb> — HF scratch file "MVDS explore: add-table-component" |
| As-is page / frame | `0.0 As is` → `0.0 As is — Intro/Design principles (Storybook, light)` (`3:26`, 1200×917) |
| Proposed page | `01.0 Propose: add-table-component` |
| Proposed frames | `01.0 Propose — Table: parts + anatomy` (`17:2`) · `01.0 Propose — Table: compositions` (`18:2`) · `01.0 Propose — Table: the five data states` (`20:5`) · `01.0 Propose — Intro/Design principles as Table (L 1024+)` (`7:26`) · `01.0 Propose — Table: the empty state (0 rows)` (`7:77`) · `01.0 Propose — Narrow width S=480px (the decision)` (`8:20`) |
| Libraries / version | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`) — `Color/*` and `Typography/*` variables imported **by key** via `importVariableByKeyAsync`; `Type/Heading 1·2`, `Type/Body`, `Type/Small`, `Type/Caption` text styles imported by key. No hand-mirrored hex. |
| Breakpoints | S · 480px (`8:20`) / L · 1024px (`7:26`, and all specimen boards at 1200) — BHD Content Types |
| Status | draft — at the design gate, awaiting founder review |

**What the three new boards carry.** `17:2` renders the seven parts twice: once
assembled into a working specimen with the parts annotated in place, and once
each in isolation with its HTML element and its spec line (inset, ramp step,
token). `18:2` shows the parts recombining — minimum, named, empty body, numeric
column, row hover — each composition adding exactly one thing and saying which
decision that thing is. `20:5` renders all five data states at full width using
**real records** from `principles.config.mjs`, including the actual
190-character longest description rather than a placeholder.

**Known fidelity caveat, recorded rather than discovered later.** Figma
auto-layout sizes each row independently, so hugging columns in these specimens
do not share one width the way `table-layout: auto` does in the browser. The
boards pin specimen column widths **only** to fake that shared sizing. The
shipped table will align better than the mock, not worse — but the mock is not
evidence about real column behaviour, and nothing downstream should read it as
such. Column behaviour is settled by the stories in `20:5`'s shipped form, not
by these frames.

No Code Connect row: MVDS does not use Code Connect (`AGENTS.md`).

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| **1 · A table must actually be a table (F7)** | `<table>/<thead>/<tbody>/<tr>/<th scope="col">/<td>`, rendered in `17:2`'s assembled specimen with each element named. The a11y gate gains something to check: `scope`, row/column counts, and an accessible name that resolves. |
| **2 · Columns must earn their width (F6, and the as-is capture)** | **D1 + D2.** The table is `w-full` so slack exists at all; prose columns take `max-w-[60ch]` / `min-w-[16ch]`; the id column takes `max-w-[32ch]` + `wrap-anywhere`. A 190-character description and a 60-pixel badge no longer share a width fraction — shown in `20:5`'s *long* state. |
| **3 · Zero is a state, not an absence (F3, F4)** | **D8.** `TableEmpty` renders inside `<tbody>` with the headers still above it, a title and one line, at `py-32`. Rendered in `18:2` composition C and `20:5` state 0. (F3 is the VerificationPanel's green "0/0 green" — out of scope, see below.) |
| **4 · Narrow width must be decided (F6)** | **D3 + D10.** Contained horizontal scroll: `overflow-x-auto` in a keyboard-reachable `role="region"`, header sticky to its top edge, scroll shadows showing there is more. The page never scrolls sideways; the header is never severed from its values. Frame `8:20`. |
| **5 · The column set must live in one place (F22)** | **D4.** `columns` is authored once and read three times — header, body, `colSpan`. The baseline finding moved the count from `grid-template` to `colSpan`; this removes it instead. Shown in `20:5`'s *wide* state. |
| **6 · Stories must leave today's volume (F24)** | **D9.** Five named stories at 0 / 1 / 50 / a 190-char value / six columns, each **derived from the real manifest** rather than from a hand-written fixture — which is also what stops the F21 drift class from recurring in this component. |

**Don't-breaks this proposal touches:**

- `manifest-ia` — "Principle provenance is legible" survives as a per-row
  `source` column (`MVDS` / `NN/g H…`); "Each manifest declares its enforcement
  story" survives as the `enforcement` badge column. Both visible in `7:26`.
- **No `mvds-allow` anywhere in the component.** `w-full`, `ch` measures and
  `max-h` are intrinsic keywords and content-relative maxima — the shapes
  `no-fixed-content-dimensions` explicitly sanctions — not pixel guesses.
- Light **and** dark both gate; `check:contrast` stays green. **D6** is how:
  body cells never use `muted-foreground`, so the hovered `bg-muted` row cannot
  produce the one pairing AGENTS.md exempts from AA.
- No new runtime dependency. Nothing here needs one.

## Decisions

**D1 · The table fills its container.** `<table class="w-full">`. Without it
`table-layout: auto` shrink-wraps to content, so with short values the table
sits narrow and left inside its region and the "prose absorbs the slack"
behaviour never happens — and nothing fails loudly when it doesn't.

**D2 · Measure ceilings and floors, not widths.** Prose columns
`max-w-[60ch] min-w-[16ch]`; id column `max-w-[32ch]` with `wrap-anywhere`.
`ch` is content-relative — a measure, which the house rule names as the right
answer. `wrap-anywhere` replaces today's `break-all`: it breaks at the hyphens
first, so ids stop fragmenting mid-token on the column whose most frequent use
is being copied into `// mvds-allow <id>`.

**D3 · Sticky header, scrolling body.** The region takes a `max-h` (a max, not
a height) and `<thead>` is `sticky top-0 bg-background`. At 50 rows every cell
keeps its column name past the first screenful. Sticky **columns** stay
excluded — a sticky header row is a reading affordance, not grid behaviour.

**D4 · The column set is data, authored once.** Three readers, one declaration.

**D5 · One authored accessible name.** `TableCaption` is the name; the scroll
region points at it with `aria-labelledby` rather than carrying an independently
authored `aria-label`. Two consumers, one string, so they cannot disagree and
a screen reader does not hear the same title twice.

**D6 · Body cells never use `muted-foreground`.** Row hover is `bg-muted`, and
`muted-foreground` on `bg-muted` is the single token pairing AGENTS.md exempts
from AA. Keeping body text at `foreground` makes the hover state safe by
construction rather than by review. Header cells use `muted-foreground` and do
not hover.

**D7 · The scroll region shows that it scrolls.** CSS-only scroll shadows
(`background-attachment: local` gradients in `--background`), which appear only
when there is more content in that direction and vanish at the ends. No JS, and
no permanent affordance on a table that fits.

**D8 · Empty means zero rows.** `TableEmpty` takes its title and line from the
consumer — MVDS ships no copy naming a mechanism that can drift. Loading and
failed-to-load are the consumer's states and are out of scope; saying so is the
decision, because rendering all three identically tells a reader the set is
empty when the fetch actually failed.

**D9 · The n-stories derive from the real manifest.** 0 / 1 / 50 / long / wide
are slices, repeats and extensions of real `principles.config.mjs` records. The
*long* story uses the actual longest description (`outputs-need-readers`, 190
characters), measured, not estimated.

**D10 · Narrow width: contained horizontal scroll** — the spec's required
decision. Not a cards collapse (out of scope), and not a one-column stack (that
is precisely the as-is bug). The region scrolls; the page does not.

**Deliberately preserved, with the cost named:**

- **`tabIndex={0}` on the region unconditionally.** It is a focus stop that does
  nothing at widths where the table fits. Making it conditional would add a
  second declaration with nothing checking it, which is this repo's signature
  defect in miniature. Accepted cost.
- **No copy affordance on the id column.** Copying an id into a
  `// mvds-allow` comment is still a manual text selection. Within scope that is
  a behaviour, not presentation.
- **No founder/adopted grouping heading.** The `source` column makes provenance
  visible per row; a grouping heading and a count are a separate change.

## Eval Delta (1.5)

> Status: **re-running.** The first delta pass judged the `01.0` boards as they
> stood before the parts / compositions / data-states boards were built, so its
> verdict does not describe the page now at the gate. Rather than present a
> stale judgement as current, the delta is being re-run against the revised
> page; this section is filled from that run before the gate is called.

## Risks / Trade-offs

- **Converting `principles-index` changes a green surface.** Expect Chromatic
  baselines for its stories, and the a11y gate now runs over real table
  semantics for the first time. That should be an improvement, but it is a
  change to a page that currently passes.
- **Sticky + scroll shadows interact.** A sticky `<thead>` needs an opaque
  background or the body shows through it; `background-attachment: local`
  shadows on the same container need care not to sit under the sticky row. Both
  are cheap to get wrong and cheap to catch — but only if a story renders the
  scrolled state, not just the top of it.
- **`ch` units depend on the font.** `max-w-[60ch]` resolves against the
  element's own font, so a column in a different face gets a different measure.
  Acceptable here because the ramp is one family, but it is a dependency worth
  knowing.
- **The mock is not evidence about column behaviour.** See the fidelity caveat
  above. Anyone reading these frames for width intent is reading the one thing
  they cannot show.
- **Out of scope but real.** Seven VerificationPanel findings (F1, F2, F3, F9,
  F10, F11, F21) and two principles-index data findings (F5 — a third
  `source.kind` is dropped silently; F8 — five record fields accepted and never
  rendered, with `severity` constant at `"error"` across all 24 records) are
  untouched by this change. F2 in particular is the repo's signature defect on
  the surface whose whole job is to be the opposite. They want their own change.

## Status

draft — at the design gate
