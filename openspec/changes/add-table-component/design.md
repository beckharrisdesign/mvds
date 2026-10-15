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

- Sort / filter / paginate / select **controls** — deferred to
  `add-table-controls` (founder direction, 2026-10-15: *"we can't just ignore
  pagination or sorting and filtering."*). The boundary was drawn in the wrong
  place: state and logic stay out permanently, but the controls, their ARIA and
  their states belong to the system. See that change's proposal.
- Data-grid internals, permanently: virtualisation, column resizing or
  reordering, sticky **columns**, server sync.
- A responsive table→cards collapse.
- Any new runtime dependency (`check:deps` is 54/55, no headroom on purpose).
- Loading and error states — see **D8**. Flagged as time-limited: the moment
  `add-table-controls` ships a sort or page control, the pending state stops
  being someone else's problem, and `TableEmpty` has to split into *no records*
  vs *no matches*. D8 holds for this change only.
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
| Proposed page | `03.0 Propose: add-table-component update` — **the current iteration: the component itself, light and dark, on MVDS Core.** `02.0` (anatomy, compositions, data states, the real surface, 480px, in-context samples) and `01.0` are retained untouched per `rules/figma.mdc` ("one page per step; never overwrite a prior page"). See the correction note below. |
| Proposed frames | **`03.0`:** `Table: component (light)` (`46:48`) · `Table: component (dark)` (`46:422`, the same board under the Tokens collection's Dark mode) · `Tokens the Table uses` (`46:342`). **`02.0`:** `Table: parts + anatomy` (`17:2`) · `Table: compositions` (`18:2`) · `Table: the five data states` (`20:5`) · `Intro/Design principles as Table (L 1024+)` (`23:2`) · `Table: the empty state (0 rows)` (`27:2`) · `Narrow width S=480px (the decision)` (`23:101`) · `Table in context: samples` (`39:4`) |
| Libraries / version | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`), bound **by key** via `importVariableByKeyAsync` / `importStyleByKeyAsync` / `importComponentSetByKeyAsync`. On `03.0`: **Tokens** (`Color/*`, `Typography/text-small-size`, `Typography/font-sans`) and **Scales** (`Spacing/space-4·8·16·32·40`) variables on every fill, stroke, inset and gap; `Type/Heading 2·4`, `Type/Body`, `Type/Small` text styles; the **Core `Badge` component set** (`925f5b9b…`) as instances. Read back from the file after the build: 0 unbound solid fills, 0 unbound paddings or gaps, 0 text nodes without a style or a bound size. `02.0` bound colours and two text styles only — its insets were literal numbers and its badges hand-drawn. |
| Delta page | `01.5 Eval Delta` — pinned duplicates of all six propose frames plus `01.5 Eval Delta — disposition ledger` (`31:599`) |
| Samples | `02.0 Propose — Table in context: samples` (`39:4`) — billing history, team & access, a component API reference, and a plan comparison. Sample data is invented and flagged as such on the board; only the principles board renders the live manifest. |
| Breakpoints | S · 480px (`23:101`) / L · 1024px (`23:2`, and all specimen boards at 1200) — BHD Content Types |
| Status | iterating — `03.0` built 2026-10-15 on founder direction ("show me the component first, in light and dark mode … in the typography and spacing scales we've defined already. If we need tokens for tables, I need to know about them"); awaiting founder review. See **Tokens** below. |

**What the three new boards carry.** `17:2` renders the seven parts twice: once
assembled into a working specimen with the parts annotated in place, and once
each in isolation with its HTML element and its spec line (inset, ramp step,
token). `18:2` shows the parts recombining — minimum, named, empty body, numeric
column, row hover — each composition adding exactly one thing and saying which
decision that thing is. `20:5` renders all five data states at full width using
**real records** from `principles.config.mjs`, including the actual
190-character longest description rather than a placeholder.

**What `03.0` corrects in `02.0`, found by using the real library instead of
drawing it.** Three things only surfaced because the boards now bind to Core
rather than imitate it: (1) the hand-drawn badges carried 4px of vertical
padding where the Core `Badge` is 2px, and sat flush to the cell inset rather
than on the text's line box — the founder caught the visible result ("the
padding around text and the padding around badges is different"), now **D13**;
(2) `02.0` bound no spacing at all — `px-16 py-8` were literal numbers, so a
Scales change would never have reached them; (3) **D11** named a "solid
`neutral`" badge that does not exist — Core's `neutral` is the status triad,
which is exactly the health-state reading D11 rejects. `03.0` uses `muted` /
`outline`. One build defect was caught by read-back rather than by eye: every
frame `createAutoLayout` makes ships a default white fill, invisible on a light
board and a white box on the dark one; 86 were cleared before the dark clone
was cut, and the page now has **zero** unbound solid fills.

**Known fidelity caveat, recorded rather than discovered later.** Figma
auto-layout sizes each row independently, so hugging columns in these specimens
do not share one width the way `table-layout: auto` does in the browser. The
boards pin specimen column widths **only** to fake that shared sizing. The
shipped table will align better than the mock, not worse — but the mock is not
evidence about real column behaviour, and nothing downstream should read it as
such. Column behaviour is settled by the stories in `20:5`'s shipped form, not
by these frames.

**Page-naming correction (founder direction, 2026-10-15):** *"these proposal
turns should be iterating on page name."* Correct — `rules/figma.mdc` says one
page per step, never overwrite a prior page, and the delta-fix pass edited
`01.0` in place instead. Three frames on it were deleted and rebuilt rather than
superseded, so their original state is **not recoverable** from the file; what
`01.0` looked like before the delta survives only in the `01.5 Eval Delta`
page's pinned duplicates and in the geometry quoted in the Eval Delta section
below. The current iteration is `02.0`, a note recording this sits on `01.0`,
and each further iteration gets its own numbered page.

No Code Connect row: MVDS does not use Code Connect (`AGENTS.md`).

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| **1 · A table must actually be a table (F7)** | `<table>/<thead>/<tbody>/<tr>/<th scope="col">/<td>`, rendered in `17:2`'s assembled specimen with each element named. The a11y gate gains something to check: `scope`, row/column counts, and an accessible name that resolves. |
| **2 · Columns must earn their width (F6, and the as-is capture)** | **D1 + D2.** The table is `w-full` so slack exists at all; prose columns take `max-w-[60ch]` / `min-w-[16ch]`; the id column takes `max-w-[32ch]` + `wrap-anywhere`. A 190-character description and a 60-pixel badge no longer share a width fraction — shown in `20:5`'s *long* state. |
| **3 · Zero is a state, not an absence (F3, F4)** | **D8.** `TableEmpty` renders inside `<tbody>` with the headers still above it, a title and one line, at `py-32`. Rendered in `18:2` composition C and `20:5` state 0. (F3 is the VerificationPanel's green "0/0 green" — out of scope, see below.) |
| **4 · Narrow width must be decided (F6)** | **D3 + D10.** Contained horizontal scroll: `overflow-x-auto` in a keyboard-reachable `role="region"`, header sticky to its top edge, scroll shadows showing there is more. The page never scrolls sideways; the header is never severed from its values. Frame `23:101`. |
| **5 · The column set must live in one place (F22)** | **D4.** `columns` is authored once and read three times — header, body, `colSpan`. The baseline finding moved the count from `grid-template` to `colSpan`; this removes it instead. Shown in `20:5`'s *wide* state. |
| **6 · Stories must leave today's volume (F24)** | **D9.** Five named stories at 0 / 1 / 50 / a 190-char value / six columns, each **derived from the real manifest** rather than from a hand-written fixture — which is also what stops the F21 drift class from recurring in this component. |

**Don't-breaks this proposal touches:**

- `manifest-ia` — "Principle provenance is legible" survives as a per-row
  `source` column (`MVDS` / `NN/g H…`); "Each manifest declares its enforcement
  story" survives as the `enforcement` badge column. Both visible in `23:2`.
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

**D5 · One authored accessible name, and it is required.** `TableCaption` is
the name; the scroll region points at it with `aria-labelledby` rather than
carrying an independently authored `aria-label`. Two consumers, one string, so
they cannot disagree and a screen reader does not hear the same title twice.
**Corrected after the delta:** the name is not optional. The type takes a
caption **or** an `aria-label` and refuses both-absent — otherwise the default
composition produces a keyboard-focusable `role="region"` whose
`aria-labelledby` resolves to nothing, which is an unnamed landmark and a worse
outcome than the markup it replaced.

**D6 · Body cells never use `muted-foreground`, and hover never reaches the
header.** Row hover is `bg-muted`, and `muted-foreground` on `bg-muted` is the
single token pairing AGENTS.md exempts from AA. Keeping body text at
`foreground` makes the hover state safe by construction. **Corrected after the
delta:** `hover:bg-muted` applies to `tbody` rows **only**. Header cells do use
`muted-foreground`, so a hover that reached the header row would produce exactly
the failing pairing — the first draft prevented that with a sentence on a card,
which is prevention by prose, not by construction.

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

**D11 · Enforcement is a category, not a health state — so no green, and no
triad.** The `enforced` badge is `Badge variant="muted"`; `guiding` is
`variant="outline"`. A green badge in this repo means a gate passed, and whether
a principle is machine-checkable is a different fact from whether it currently
passes — a fact this table does not report and could not back up. **Corrected
on `03.0`:** the first draft said "solid `neutral`", a variant Core does not
have; `neutral` is the semantic triad's middle step, which would make
enforcement read as a health state after all. `muted` is the tone variant for
labels with no status meaning, which is what this is.

**D13 · One inset per cell; inline content sits on the first line box.** Every
`TableCell` and `TableHead` is `py-8 px-16`, and that is the only number. Text
fills a line box (`text-body` × 1.6 = 25.6px) with its leading inside it; a
`Badge` is inline, so it is centred on that same first line rather than pushed
to the inset. That is what makes a badge beside a name read as the same inset
as the name — the founder's finding on the `02.0` samples board, where the
hand-drawn badge sat flush to the inset at 4px of its own padding. Cells are
`align-top`, so a two-line identity cell keeps its badge on the name's line,
not floating between the name and the e-mail. The browser does the centring
for free (an inline-level box aligns to the line's baseline); the `03.0` board
draws it explicitly as a 26px line-box frame so the mock shows the rule rather
than approximates it. The shipped story for the identity row measures it.

**D12 · The principles index renders four columns, not five.** The first draft
carried both the principle `title` and its `description`, which restate one
record twice, doubled every row height, and halved how many of the 24 records
fit on a screen. `title` goes; `id`, `what it says`, `enforcement` and `source`
stay.

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

## Tokens

Founder direction, 2026-10-15: *"if we need tokens for tables, I need to know
about them."* This is the census, read back from the `03.0` boards after the
build, not from the plan. **Every token the component uses exists in MVDS Core
today. No new token is proposed. Three questions are open, each the founder's
call, and one of them could become a token.**

| Token | Bound where | Status |
| --- | --- | --- |
| `Color/background` | Table surface · `TableHeader` (sticky, opaque) | exists |
| `Color/foreground` | `TableCell` text · `TableEmpty` title | exists |
| `Color/muted-foreground` | `TableCaption` · `TableHead` · `TableEmpty` line | exists |
| `Color/muted` | `tbody` `TableRow` `:hover` | exists |
| `Color/border` | `TableRow` 1px bottom rule | exists |
| `Badge` `variant=muted` / `outline` | enforcement column (D11) | exists, component |
| `Spacing/space-8` | `TableHead` + `TableCell` padding-y | exists |
| `Spacing/space-16` | `TableHead` + `TableCell` padding-x · `TableCaption` padding | exists |
| `Spacing/space-32` | `TableEmpty` padding-y | exists |
| `Spacing/space-4` | `TableEmpty` gap, title to line | exists |
| `Type/Body` | `TableCell` · `TableEmpty` title | exists |
| `Type/Small` | `TableCaption` · `TableEmpty` line | exists |
| `Typography/text-small-size` + `font-sans` | `TableHead`, weight set by hand (open 1) | exists |
| `Type/Caption` | via the `Badge` instance | exists |
| 1lh of `text-body` (25.6px) | the line box inline content centres on (D13) | derived from the ramp, not a token |

**Open questions — founder's call.** Recorded here and on the `46:342` board.

1. **`TableHead` is `text-small font-semibold`, and Core has no Semi Bold Small
   text style.** The mock binds the size and family variables and sets the
   weight by hand. Either add a `Type/Small Semibold` style to Core (a text
   style, not a token; it would ride the next token sync), or accept
   weight-by-hand as the rule for table headers. *Recommendation: accept
   weight-by-hand. `font-semibold` on a ramp step is how Button and Card
   headings already work in code; a dedicated style would be the first
   weight-only style in Core and would need a sync rule of its own.*
2. **The sticky header needs an opaque surface, and the surface is not always
   `background`.** On `03.0` it is `Color/background`. A table inside a `Card`
   sits on `Color/card`, which equals `background` in light mode and differs in
   dark (`0.205` vs `0.145`), so a sticky header would show a seam as the body
   scrolls under it. Either **(a)** Table is constrained to `background`
   surfaces and the story says so, or **(b)** a scoped custom property
   `--table-surface`, defaulting to `var(--background)` and set to
   `var(--card)` by `Card`, is **the one new token this component would need**.
   *Recommendation: (b). It is a declaration with a reader (`TableHeader`),
   one line in `Card`, and it is how scoped theming already works in this
   repo; (a) is a constraint nothing enforces.*
3. **The scroll-edge affordance (D7) needs a colour to fade from.** Proposed:
   `Color/border` fading to transparent — an edge, drawn in the token that
   already means "edge" — so no new token. The alternative is a dedicated
   `--scroll-edge` token. *Recommendation: `border`. It is on the AA-exempt
   decorative side already, and it reads identically in both modes because
   dark `border` is already a white alpha.*

## Eval Delta (1.5)

> Re-run of the 0.5 rubric against the `01.0` boards, in an isolated context
> holding the surfaces and `principles.config.mjs` only — no proposal
> rationale, no prior findings, no git history. **16 findings, 4 of them High.**
> The first delta pass was discarded rather than reported: it judged the boards
> before the parts / compositions / data-states boards existed.

**Four findings were verified before being accepted, not taken on the report's
word** — the house rule is that an agent's findings are claims:

- **F3** — `nn01-visibility-of-system-status` appeared as an id. Checked:
  **no** record id carries an `nn` prefix and there is **no** display-id field
  on the record at all. Confirmed; the id was invented.
- **F8** — the data-states board asserted *"Every specimen below uses real
  records"* while its `files` and `added later →` columns matched no field.
  Checked: record fields are `check, description, docs, enabled, evalLens, fix,
  id, rationale, scope, severity, source, title`. Confirmed — **a claim of mine
  that resolved to nothing, on a board about honesty.**
- **F12** — `judgment` on the real surface, `guiding` everywhere else. Checked:
  `check.kind` is `guiding`. Confirmed.
- **F1 / F2** — read out of the file directly rather than from the report. On
  the old `7:26` the `id` header sat at x=521 over values at x=432–468, so the
  header labelled nothing beneath it. The old `8:20` rendered exactly three
  columns (`principle`, `id`, `enforcement`) while its own text read *"Rejected:
  reducing the column set at S"* — **the board demonstrated the option it
  rejects.** Both confirmed.

| # | What the delta found | Rubric item | Disposition | What changed |
| --- | --- | --- | --- | --- |
| F1 | Header row sat over nothing on the one board showing real use | `consistency-and-standards` | **addressed** | Board rebuilt (`23:2`) with shared column widths; alignment verified by screenshot. The Figma fidelity caveat is now stated on the board, not only in this file. |
| F2 | The 480px board showed the column reduction it says it rejects | `declarations-must-resolve` | **addressed** | Rebuilt (`23:101`): all four columns present, clipped by a 480px viewport, with a proportional scrollbar. |
| F3 | An id that resolves to no record | `declarations-must-resolve` | **addressed** | Real machine ids. Verified against source. |
| F4 | Scroll region clipped with no affordance — two truncated letters were the cue | `recognition-rather-than-recall` | **addressed** | Persistent scrollbar rendered on the board; CSS-only edge shadow is **D7**. |
| F5 | The 50-rows state asserted a max-height and sticky header but showed neither | `visibility-of-system-status` | **addressed** | Specimen reparented into a clipped 240px viewport with a proportional thumb. The prose stand-in is deleted — the frame performs the behaviour. |
| F6 | Real surface rendered 5 of 24 records, no count, no overflow cue | `scale-to-the-data` | **addressed** | Caption reads *24 records · 8 shown*. |
| F7 | Empty copy asserted a cause it cannot know | `error-recovery` | **addressed** | Copy is *"Nothing matched."* **D8** now says out loud that loading and failed-to-load are the consumer's states, and the board carries that note. |
| F8 | "Real records" claim while two columns were invented | `declarations-must-resolve` | **addressed** | Claim corrected to name which columns are real and why the wide case needs a field the manifest does not have. The columns stay synthetic — deliberately, and now said so. |
| F9 | Row hover made the one AA-failing pairing reachable on the header | `error-prevention` | **addressed** | **D6** corrected: hover is `tbody`-only. Structural, not a sentence. |
| F10 | `aria-labelledby` pointed at a caption two real boards omitted | `error-prevention` | **addressed** | **D5** corrected: caption **or** `aria-label` required by the type. Captions added to both real-use boards. |
| F11 | `principle` and `what it says` restate one record twice | `aesthetic-and-minimalist-design` | **addressed** | **D12**: the `title` column goes. |
| F12 | `judgment` vs `guiding` | `consistency-and-standards` | **addressed** | One vocabulary, matching `check.kind`. |
| F13 | `enforced` painted green, which here means "a gate passed" | `match-system-and-real-world` | **addressed** | **D11**: solid neutral = has a machine check, outlined = none. |
| F14 | Runts, loudest on a display heading | `no-runts` | **partly addressed** | Heading constrained. Body-copy runts inside specimens persist — an artifact of the mock's pinned widths, not of the component. |
| F15 | Two different empty messages, one naming no file | `help-and-documentation` | **addressed** | Unified. |
| F16 | `TableCaption` declared essential, used in 1 of 5 compositions and neither real board | `outputs-need-readers` | **addressed** | Rendered on both real-use boards; required by the type (F10). Composition A still ships without one **by design** — that is the `aria-label` path, not an omission. |

**Rubric items the delta found clear:** `flexibility-and-efficiency-of-use`
(the excluded behaviours are named and their home given, so the plain path is
not buried by a half-built accelerator). **N/A:** `user-control-and-freedom` —
a presentational table has nothing to undo or cancel.

**What this section is and is not.** It records what the delta found and what
changed in response. It is **not** a re-judgement of the result: the fixes came
after the run. The fixes themselves are evidenced — F3, F8 and F12 against
source; F1, F2 and F5 by reading geometry, column counts and screenshots out of
the file — but a further delta would be needed to judge the boards as they now
stand. Calling that is the founder's at this gate.

**Carried forward, untouched by this change.** From the 0.5 baseline: **F5**
(the sort helper drops a third `source.kind` silently) and **F8** (five record
fields accepted and never rendered, with `severity` constant at `"error"`
across all 24 records), plus the seven VerificationPanel findings. These are
data and correctness bugs a Table does not fix, and they want their own change.

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
  they cannot show. This is not theoretical: the delta's two highest findings
  were both boards whose annotation claimed an outcome the frame did not
  produce — the repo's own fail-open defect, committed in Figma instead of in
  code, by me. The caveat now lives on the boards themselves for that reason.
- **Out of scope but real.** Seven VerificationPanel findings (F1, F2, F3, F9,
  F10, F11, F21) and two principles-index data findings (F5 — a third
  `source.kind` is dropped silently; F8 — five record fields accepted and never
  rendered, with `severity` constant at `"error"` across all 24 records) are
  untouched by this change. F2 in particular is the repo's signature defect on
  the surface whose whole job is to be the opposite. They want their own change.

## Status

iterating — `03.0` built for founder review; three token questions open
