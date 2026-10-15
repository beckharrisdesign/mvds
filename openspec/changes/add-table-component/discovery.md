# add-table-component — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | `Intro/Design principles — Default` (24 live rows) and `Site/VerificationPanel — Live` (5 live gates) |
| Figma `0.0 As is` page | <https://www.figma.com/design/CqgZ5tesr6qApnKiAadhVb> — HF file "MVDS explore: add-table-component". Frames: `0.0 As is — Intro/Design principles (Storybook, light)` (1200×917) and `0.0 As is — Site/VerificationPanel (landing page, light)` (1200×519). Every fill and stroke is bound to an MVDS Core variable **imported by key** (10 colour variables, 5 text styles) — no hand-mirrored hex, per `rules/figma.mdc`. |
| Scope note | **Only `PrinciplesIndex` is in scope** — a Storybook surface that hand-rolls a table out of a five-column `Grid`, which is what this change's component replaces. `VerificationPanel` was *also* captured and evaluated here, and that was scope drift: founder, mid-discovery — **"we're proposing a new component, not proposing the landing page layout."** Its capture and findings are kept because they are real and several were verified against source, but **this change does not touch it**. They are carried below as input to a separate change. |

**What the as-is capture shows at a glance.** In the principles frame, the
`description (manifest)` column and the `enforcement` column receive an identical
width fraction, so a 190-character description wraps to six lines beside a
60-pixel badge sitting in ~85% whitespace. That is the hardcoded-width bug's twin:
the width is not pinned in pixels, it is pinned to a ratio that ignores content.

## Eval (0.5)

> Produced by an isolated subagent — surfaces + rubric only, with AGENTS.md,
> `openspec/` and git history explicitly withheld so no proposal rationale could
> reach it. Rubric = every `principles.config.mjs` record carrying an `evalLens`
> (14 of 24). Scores are summary colour only; the findings are the artifact. This
> baseline is **cached** — proposal iterations re-run only the Delta (1.5).

28 findings returned. The 15 below are the ones that bear on this change or are
severe enough to require a decision. **Findings 1, 2, 8 and 21 were independently
re-verified against source before being recorded** — an agent's findings are
claims, not facts.

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | Status is a sentence — *"3 of these ran against commit f03d873 while this page was built"*. `generatedAt` and `dirty` exist in the snapshot and neither is a prop. The live snapshot is **`dirty: true`**. | `visibility-of-system-status` | The panel asserts currency while shipping a stamp from a dirty tree; a stale snapshot reads identically to a fresh one. **Verified.** | high |
| F2 | `passing = gates.filter(g => g.status.level === "success").length` counts the 2 `ci` gates whose `result` is literally *"Required on every pull request."* Badge reads **5/5 green**. | `declarations-must-resolve` | "5/5 green" declares two never-executed gates as passing. The prose directly below draws the distinction the headline number destroys. **Verified in source.** | high |
| F3 | At 0 gates, `passing === gates.length` is `0 === 0` → `<Badge variant="success">0/0 green</Badge>` over an empty grid. | `scale-to-the-data` | Total gate loss renders as a green all-clear — the worst failure mode a verification surface has. | high |
| F4 | `rows.map(...)` with no zero branch: 0 principles renders a bordered box containing only five caption labels. | `scale-to-the-data` | Empty panel, indistinguishable from a load failure, with no statement of what is missing. | high |
| F5 | `sortPrinciplesForIndex` returns `[...founder, ...external]` from two independent filters; any third `source.kind` is silently dropped, and the table shows no total. | `declarations-must-resolve` | A principle vanishes with no error and no gap: 24 of 25 looks exactly like 25 of 25. | high |
| F6 | `cols={{ base: 1, lg: 5 }}` — below `lg` the header collapses to five stacked labels followed by 24 rows of five stacked, **unlabelled** values. | `scale-to-the-data` / `recognition-rather-than-recall` | On phone and tablet the table is 120 orphaned values under one stranded block of column names. The header does not merely stop helping; it labels nothing adjacent to it. | high |
| F7 | Header and cells are bare `<span>` / `<code>` in a `Grid` — no `<th>`, `<td>`, `role="table"` or any header-to-cell association. | `consistency-and-standards` | Assistive tech reads 5 labels then 120 detached strings. **axe does not flag it** — nothing claims to be a table — so the a11y gate passes a table nobody can navigate non-visually. | high |
| F8 | Five of ten `PrincipleRecord` fields are accepted and never rendered: `rationale`, `fix`, `severity`, `checkKind`, `docs`. | `outputs-need-readers` | The one thing a reader needs on seeing a rule — how to comply (`fix`) — is in the data and withheld. **Verified: `severity` is the constant `"error"` across all 24 records**, including the 14 `judgment` ones. | high |
| F9 | `verification-panel.stories` uses `as unknown as ManifestSnapshot`; `principles-index.stories` uses the ordinary cast for the same data. | `error-prevention` | The double cast erases the only compile-time comparison between generated JSON and the `Gate` contract, in the one place it was checkable. | high |
| F10 | `VERIFIED_AT_COPY[gate.verifiedAt]` and `<Badge variant={gate.status.level}>` are unguarded pass-throughs of JSON strings. | `error-prevention` | A new `verifiedAt` renders a bare `·`; an unknown `status.level` renders an unstyled badge. Both fail silently. | high |
| F11 | For the 2 `ci` gates one fact appears three times per card in three vocabularies: badge `enforced in CI`, result *"Required on every pull request."*, footnote `· required to merge`. | `aesthetic-and-minimalist-design` | 40% of cards spend their most prominent line on zero information. | medium |
| F17 | `break-all` on ids up to 33 chars in a 1-of-5 column breaks at any character rather than at the hyphens. | `no-runts` | Ids fragment mid-word, stranding 2–3 character pieces — on the column whose most frequent use is being copied into a `// mvds-allow <id>` comment. | medium |
| F21 | The hand-written `FIXTURE` has drifted from the generator: *"64 files clear 7 enabled MVDS principles"* vs live *"75 files clear 10 enforced…"* — different counts **and** different wording. | `declarations-must-resolve` | Autodocs publishes invented gate results as the canonical example, with `commit: "abc1234"` rendered inside *"…ran against commit abc1234 while this page was built"*. A fabricated measurement in the grammar of a real one. **Verified.** | medium |
| F22 | `cols={5}` is declared twice — header and row — against two independently maintained cell lists. | `error-prevention` | A sixth field needs three coordinated edits; a mismatch misaligns every row and fails nothing. The rubric's "one more column" case is unmade. | medium |
| F24 | No story leaves today's volume: one `Default` at 24 rows; three gate stories all at exactly 3 gates. | `scale-to-the-data` | F3, F4, F6 and F22 are invisible to the a11y/render gate because no story puts the components in those states. | medium |

**Per-rubric summary colour** (indicative only — gates nothing): red on
`visibility-of-system-status`, `consistency-and-standards`, `error-prevention`,
`recognition-rather-than-recall`, `help-and-documentation`, `scale-to-the-data`,
`declarations-must-resolve`, `outputs-need-readers`. Amber on
`match-system-and-real-world`, `flexibility-and-efficiency-of-use`,
`aesthetic-and-minimalist-design`, `error-recovery`, `no-runts`. Green (largely
N/A — read-only surfaces) on `user-control-and-freedom`.

**Figma `0.5 Eval` page:** <https://www.figma.com/design/CqgZ5tesr6qApnKiAadhVb> —
frames `0.5 Eval — Intro/Design principles (pinned)` and
`0.5 Eval — Site/VerificationPanel (pinned)`, with 9 numbered pins anchored to the
node each finding is about, plus the `0.5 Eval — findings ledger` board. Annotation
layer only: the duplicated frames keep their Core variable bindings, and the
markdown above stays canonical.

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

**Top issues to fix** (this change answers these):

1. **A table must actually be a table — F7.** Header-to-cell association is the
   component's reason for existing, and the current gate cannot see its absence.
2. **Columns must earn their width — F6, and the as-is capture shows it.** A
   190-character description and a 60-pixel badge cannot hold the same fraction.
3. **Zero is a state, not an absence — F3, F4.** Both surfaces render emptiness as
   either a green all-clear or a blank bordered box.
4. **Narrow width must be decided, not defaulted — F6.** The present collapse
   severs every header from its value at exactly the width where a reader needs it.
5. **The column set must live in one place — F22.** Three coordinated edits with no
   check is how the "one more column" case stays unmade.
6. **Stories must leave today's volume — F24.** Four of these findings are
   invisible to a green gate purely because no story reaches those states.

**Tradeoffs worth preserving:**

- **The founder-then-adopted sort order.** Deliberate, and the table must keep it
  (F15 asks for a visible grouping, which is an improvement, not a reversal).
- **The `nn##-` display id** alongside the stable machine id — the id column's
  real job is being copied into `// mvds-allow <id>`, so the machine id stays.
- **Cards stay cards.** `VerificationPanel` and `PrinciplesPanel` render cards on
  purpose and are out of scope entirely — the landing page represents this
  component through the generated inventory, as it does for every component it
  does not render.
- **Restraint.** Neither surface is decorated. The amber on
  `aesthetic-and-minimalist-design` is about repetition, not ornament.

**Don't-breaks:**

- `manifest-ia` — "Principle provenance is legible" and "Each manifest declares its
  enforcement story" must survive the conversion.
- Light **and** dark both pass the a11y gate; `check:contrast` stays green.
- The component itself must pass `no-fixed-content-dimensions` with **no
  `mvds-allow`** — a suppression here would concede the point.
- No new runtime dependency (`check:deps` is 54/55).

**Out of scope, and the founder should see it anyway.** Seven findings belong to
`VerificationPanel`, which this change does not touch at all. They are correctness
and honesty bugs that a Table would not fix and that must not be smuggled into a
component PR:

- **F1, F2, F21** — the panel titled *"Verified, not asserted"* asserts. It reports
  **5/5 green** while two of those gates never ran, narrates a commit from a
  `dirty: true` tree, and ships a fixture whose invented numbers render in the
  grammar of real ones.
- **F5, F9, F10** — a silent row drop on an unrecognised `source.kind`, and two
  unguarded JSON pass-throughs behind a cast that erases the one compile-time check.

These want their own change. F2 in particular is the repo's own signature defect —
a declaration that resolves to nothing — on the surface whose entire job is to be
the opposite.

## Status

ready for founder review
