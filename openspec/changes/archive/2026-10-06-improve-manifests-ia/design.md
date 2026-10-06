# improve-manifests-ia — design

## Context

Discovery's 0.6 Eval Summary (approved 2026-08-28) distilled the 15-finding
baseline into four priorities. Per the founder's direction, this design
proposes **just the changes from the eval, in priority order** — no speculative
restructuring beyond what the findings evidence. The proposal was generated
with the approved 0.6 in context; the manifest *files* themselves are not
restructured here (that split was reserved at proposal time — see
[proposal.md](proposal.md) Not doing).

## Goals / Non-Goals

**Goals:**

- Answer every 0.6 top issue with a concrete surface change (P1–P4 below).
- Keep the surface a pure projection of generated snapshot data.
- Express the manifest taxonomy in layout (groups), not metadata pills.
- Make the enforcement story readable inline on every card.

**Non-Goals:**

- No changes to what any check enforces; no new gates.
- No restructuring of manifest files (`principles.config.mjs` etc. keep their
  shape; the snapshot generator gains fields, not the manifests).
- No landing-page changes beyond the dashboard section (the two anchors land
  on existing sections; vocabulary alignment in sibling sections is recorded
  for apply but limited to copy).
- No Figma library sync.

## User flow / IA

The proposal, in the eval's priority order:

- **P1 — Status vocabulary (F1, F2).** Four expressions with a declared
  contract: `success` tint = a machine-verified claim ("synced 72/72",
  "light/dark parity"); `neutral` tint = trailing by design ("29 commits
  behind", "not synced", "synced 134/137", "snapshot from uncommitted tree");
  `outline "declarative"` = nothing to sync — no longer dressed as a status;
  `destructive` reserved for genuine code-vs-mirror disagreement, rendered
  only when drift exists. The legend describes exactly this in full
  sentences: *"A green badge means a gate verified the claim. Gray means the
  mirror trails by design. Red would mean code and mirror genuinely disagree.
  Declarative means there is nothing to sync."*
- **P2 — Taxonomy as layout (F3, F4, F15).** Three titled groups replace the
  flat grid: **Source of truth** (Token layer, Spacing scale) first,
  **Enforcement** (Principles — compacted to counts + provenance + anchor to
  the Design-principles section; the 20-row id dump is gone), **Figma mirror**
  (Component manifests with its item list two-column at L, Conventions, Figma
  lock stacked beside it). Cards hug their height — no `h-full` stretching,
  no dead space. The `kind` pill is deleted; the group header carries the
  classification. Proposed L frame: 1487px vs the as-is 2259px.
- **P3 — Enforcement story inline (F5, F6, F7, F10).** Every card carries a
  visible "Checked by …" / "Declarative — no gate …" line naming the gate and
  when it runs (`check:contrast`, `check:principles` + edit-guard hook,
  `check:figma`, sync skills); all former tooltip-only `status.detail` text is
  inline. One vocabulary: **automated / by judgment** (the word "guiding"
  leaves the surface). Item-row status badges sit in a fixed right-aligned
  column on the name row at every width.
- **P4 — Links and magnitude (F12, F13).** All six manifest paths are links to
  the file on GitHub (`↗`); the Principles card anchors to the
  Design-principles section and the Figma-lock card to the Figma-mirror
  section (`↑`); the header meta gains "mirror 29 commits behind".
- **P5 — Mechanical fixes in apply (F8, F9, F11, F14).** Pluralized counts
  ("1 variant"); `text-wrap: balance` on the h2 and `pretty` on paragraphs;
  parity defined inline ("Parity = every surface token pairs across modes;
  dark carries 36 overrides, the rest inherit"); dirty badge reworded to
  "snapshot from uncommitted tree".

### Iteration 02.0 — card simplification (founder direction)

> "there's a lot of slop on these cards. lets try to simplify to a title, a
> status, a single call to action that gives us all the underying detail. I
> do rather like the tallies and the explanation of where its checked."

Card anatomy reduced to four elements: **title + status badge · the
checked-by line · the tally pills · one CTA to the underlying detail**
(source file ↗, or for Principles the section anchor ↑). Dropped:
description paragraphs, side notes, and the 17-row component item list —
its one signal survives as a "3 not synced" tally. The D2/D6 decisions are
baked in ("Mirror state" group; parity stays green), the legend defines all
four badge classes including green, and the meta line wraps at 480. Frame
heights: L 967px (01.0: 1487; as-is: 2259).

### Iteration 03.0 — component-true density (founder direction)

> "Are we using our own MVDS Core components here? Everything feels small and
> crammed together. lets shift all of these up the spacing scale."

02.0 had inherited the as-is dashboard's density (`Card size="sm"`,
caption-size metas). 03.0 adopts **Card's default anatomy** from code — 16px
paddings and gaps, `text-h4` titles (CardTitle's own default) — and steps
every spacing value one step up the scale: card gaps 8→16, grid 16→24,
groups 24→32; gate lines and CTAs caption→small; group headers h4→h3.
Badges keep Badge's own spec. All values bound to Core Spacing variables and
text styles. L frame: 1230px. Apply note: the dashboard uses `<Card>`
(default size) and `<Badge>` directly; the `size="sm"` override and the
downscaled title go away.

### Iteration 04.0 — one job per badge (founder direction)

> "its also very badge happy - and they don't make any sense as a system."

03.0 had roughly 25 pills doing three jobs: status, category, and plain
data. 04.0 gives Badge one job. A badge reports a state that can change, on
the semantic triad. Green means its gate is passing. Gray means the mirror
trails by design. Red would mean genuine disagreement. Consequences:
tallies render as a plain text line; "declarative" is no longer a badge
(cards with nothing to report carry none); "enforced" and "light/dark
parity" become "passing", matching the verification panel's status
vocabulary; the dirty-tree note joins the meta line as text. Four badges
remain on the whole frame. The legend states the rule in full sentences.

### Iteration 05.0 — full-width cards, badges for mirror state only, scales merged (founder direction)

> "each of these cards should be full width of their container. And we can
> take the 'Passing' badge off entirely. We don't need a separate card for
> spacing - technically those scales are supposed to be tokens too and its
> super random to call them out separately"

Every card spans its container at every width; no side-by-side columns.
The green "passing" badge is removed. A badge now only reports mirror
state: "134/137 synced" and "29 commits behind" are the two badges on the
frame, and the legend drops its green sentence. The Spacing scale card is
gone. The scales are tokens, so the Token layer card absorbs them: "10
spacing steps" joins its tally and its gate line adds the sentence
"Spacing steps are typed into the primitives' px props, so off-grid
spacing is a compile error." Five cards remain. Apply notes: the snapshot
generator folds the scales entry into the token-layer card, which keeps
the truthful-inventory requirement satisfied (every manifest has a home;
the scales' home is the Token layer card). Passing gates stay visible in
the Verification section, which already owns that job.

### Iteration 06.0 — ecosystem description, not status dashboard (founder direction)

> "we're just listing out the elements of the MVDS ecosystem by what they
> do. Either they are the source of truth, the enforcement layer, or the
> mirror layer. we dont' need to show how far or ahead they are, or if they
> pass, or if we'vedone 145 out of 146. Just describe these pieces as if an
> outside audience were reading it, and talk about how they work together."

The section's job changes. It describes the MVDS ecosystem for an outside
reader instead of reporting live status. Three groups carry the founder's
own layer names: Source of truth, Enforcement layer, Mirror layer. Every
progress metric leaves the section: no badges at all, no sync ratios, no
commits-behind, no dirty-tree note. The meta line keeps only generation
provenance. Each card is a title, a short description of what the piece
does and how it connects to the other layers, an inventory tally, and one
CTA. Inventory counts stay because they describe size, not progress. Live
gate status remains the Verification section's job, and mirror sync state
stays visible in the Figma mirror section. Spec check: the enforcement
story is carried descriptively in each card's sentences, provenance is
carried in the Principles description and its anchor, and every manifest
keeps a rendered home.

### Iteration 07.0 — component library joins Source of truth (founder direction)

> "why isn't the component library in code also a source of truth? tokens
> are half the story, but the primitives and the way we assemble things is
> also a source of truth yes?"

Source of truth gains a second card: the Component library
(`src/components`). Tokens are the vocabulary and the component library is
the grammar; both are code and both are the truth the other layers read.
The card describes the primitives, the gap-only composition model, the
8-grid tuning, and the Storybook verification, with a real inventory
tally: 9 layout primitives, 10 ui components, 4 blocks, 2 form components.
The intro now states the model as "one token file and one component
library that everything else reads." The Mirror layer's Component
manifests card reads correctly as the mirror spec derived from these code
components. The "Generated · commit" meta line is removed entirely at the
founder's direction; the page footer already carries the commit, so
provenance stays on the page without decorating this section. Apply note:
the snapshot generator gains a component-library entry counting the four
families from `src/components`.

### Iteration 08.0 — principles join Source of truth, two layers (founder direction)

> "and really the design principles are a source of truth too - a living
> source but one that enacts checks and fails builds."

The taxonomy settles at two layers. **Source of truth** holds the Token
layer, the Component library, and the Principles. **Mirror layer** holds
the Component manifests, Conventions, and the Figma lock. Enforcement
stops being a group and becomes what the sources do, stated on each card:
the token card names its contrast check and typed spacing, and the
Principles card reads "the source is alive: its records enact the checks
that fail builds." The intro states the whole model in four sentences:
a source of truth and a mirror. Apply note: the snapshot's `group` field
carries the two-layer taxonomy.

### Iteration 09.0 — mirror layer collapsed to one card (founder direction)

> "it feels like we've broken the figma mirror down one degree of
> granularity more than the other parts to pad its numbers. is a manifest
> of all components and all principles something baked into the figma
> layer?"

The three mirror cards were internals of one machine, so they become one
card: **Figma mirror**. Its description names the internals in plain
sentences: a spec declares what appears, a conventions file binds the same
tokens the code uses, a lock records what was written so syncs update in
place, and a build check keeps the spec honest. The tally merges their
real counts. The CTA links the `figma/` directory. Four cards remain
across two layers. (Principles are not part of the mirror; they are
code-only, which is consistent with their move to Source of truth.)
Apply note: the snapshot generator merges the three mirror manifests into
one rendered entry; each file still exists and is counted, so the
truthful-inventory requirement holds with the mirror entry as their home.

### Iteration 10.0 — Elements of the MVDS (founder direction)

> "a Figma Mirror is also part of this yes? Just because the code is the
> main source of truth doesn't mean we need to highlight that Figma isn't
> in every sentence. Why not just call this section 'Elements of the MVDS'
> and outline all of them. They work together, so lets talk about them
> together"

The section heading becomes **"Elements of the MVDS"**. The group headers
go: four peer cards in one list, and the intro carries the relationships
in four sentences (tokens define, components compose, principles enact
checks, the mirror carries it all into design). Code-is-truth is stated once, in the intro, and not re-litigated per
card. Apply note: the section heading and the removal of group rendering
land in the dashboard component; the snapshot's four entries render as a
flat list.

### Iteration 11.0 — drop "mirror", Figma library as shared language (founder direction)

> "this language is still really missing the point of having a figma
> library that stays in sync with the code -- don't use the word mirror at
> all. It exists so that the design and code always match and you can
> iterate in either and have the common language for the code to
> understand what you've just asked it. Mirroring is a red herring."

The word "mirror" leaves the surface entirely. The card is named **Figma
library** and framed as shared language: design and code always match, you
can iterate in either, and the shared names mean the system understands
what you asked for. Apply note: "mirror" leaves all reader-facing copy in
this section (internal file names like `figma.lock.json` and the
`check:figma` command keep their names); the landing page's separate
Figma-preview section keeps its own naming decision out of this change's
scope, recorded as a vocabulary follow-up.

**Process rule (founder direction):** every direction lands as a new
numbered iteration page, copy-only changes included; no in-place edits to
a prior iteration's frames. Applied from 11.0 on (11.0 was cut from the
in-place 10.0 amendment and 10.0 rebuilt to its pre-amendment state so
the page history reads true).

### Iteration 12.0 — Principles expanded state (founder direction)

> "show a state of the principles section where we expand the list and see
> all the principles very simply laid out."

The Principles card gains a disclosure. Expanded, it lists all twenty
principles by their human titles in two columns at L and one at S, with
"Hide the list ↑" as the collapse affordance. No ids, no meta, no badges.
Apply note: the collapsed CTA becomes the toggle ("All 20 principles with
sources" expands in place); titles come from the snapshot's principle
records.

### Iteration 13.0 — Harness section (founder direction)

> "lets also author a Harness section where we also very simply explain
> what skills and schemas exist to support these efforts. We can refer to
> the Experiment Hub as one of those elements we leverage."

A new landing section, "Harness", in the same card anatomy: an intro
("agents do the work, the schemas hold them to the founder's process, the
skills carry the house rules"), a Workflow schemas card (the five-stage
loop, the eval gate, adapted from the Experiment Hub), and a Skills card
(entry points, voice skills, sync skills). Real tallies: 2 schemas, 5
stages; 4 workflow entry points, 4 voice skills, 3 MVDS skills, 3 rule
files. Scope note: this widens the proposal's original "dashboard section
only" boundary at the founder's direction; the snapshot generator gains
harness entries (schemas and skills counted from the repo) so this section
stays a projection of generated data like the others.

### Iteration 14.0 — six elements, every card expandable (founder direction)

> "lets include workflow schemas and skills as elements of the MVDS, not a
> separate section. Lets consider each of these cards to have an expandable
> section for fully listing the things we're descirbign, and the ability to
> toggle that list open and closed."

The Harness section dissolves into the elements. One section, six cards:
Token layer, Component library, Principles, Figma library, Workflow
schemas, Skills. Every card gains a disclosure that fully lists what its
tally counts, in labeled terse lines (token families and steps, components
by family, the twenty principle titles, the Figma collections and
component sets, the schemas and stages, the skills by kind). Two links sit
side by side on each card: the toggle ("Show the full list ↓" / "Hide the
list ↑") and the underlying-detail link. Frames show collapsed and
expanded at L plus collapsed at S; every list line is real repo inventory.
Apply note: expand state is per-card component state; list content comes
from the snapshot generator, which now also inventories schemas, skills,
and rules.

### Iteration 15.0 — Buttons replace text links (founder direction)

> "we missed my ask to swap this style of link with a button and drop the
> icon. This is super awkward."

The two card actions render as MVDS Buttons, `variant="outline"`
`size="default"` (32px height, 16px padding, radius-lg, border and
background bound to tokens), with no arrow glyphs: "Show the full list" /
"Hide the list" and the destination ("src/index.css", "All 20 with
sources"). This also lands the design-advisor guideline that calls to
action inside cards are Button components, not text links. Frames:
L collapsed, L expanded, S collapsed.

### Founder copy edits on 15.0 (canonical)

The founder edited the 15.0 frames directly; this records those edits as
the canonical copy, propagated to all three frames.

**Order:** Principles · Token layer · Component library · Figma library ·
Workflow schemas · Skills.

**Intro:** "Six elements make up MVDS, and they work together as one
system that can be accessed by human and agent alike."

**Principles:** "The golden rules begin with industry standard
accessibility and usability principles by default, and can then be
extended by individual users to include development, content, product,
and business values. Principles are stored as data alongside the rest of
MVDS, and where possible they cascade into implementation through unit
tests and other automated checks. Design principle checks can — and
should — fail builds."

**Token layer:** "Colors, type, spacing, and radius live in one CSS file,
and every surface in the system reads from it."

**Component library:** "The primitives and components that consumers
compose with."

Figma library, Workflow schemas, and Skills keep their prior copy. The
Principles rewrite also lands vocabulary this change had left open: the
principles are framed as accessibility and usability standards first
(where the contrast check conceptually lives) plus user-extended values —
the anchor's "accessibility standards deserve integration" resolved by
founder copy rather than a separate manifest.

### Copy rule (founder direction)

> "the content and language is way to em dash happy -- try to use full
> sentences or button style terse phrases, but not in between"

Surface copy is either a full sentence or a terse label. No em-dash or
elliptical hybrids. Applied to the legend, all six gate lines, and the
principles CTA (now "All 20 principles with sources ↑"). This rule carries
into the implemented copy at apply and into snapshot-generated text.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | <https://www.figma.com/design/4wjZheQYLfBAVQ8nWn1YRR> — "HF MVDS Manifests IA" (scratch/HF; MVDS Core is not written) |
| As-is page / frame | `0.0 As is` — `L 1024 / light` · `L 1024 / dark` · `S 480 / light` · `S 480 / dark` (from discovery) |
| Proposed page / frame | `15.0 Propose: improve-manifests-ia update 14` — six elements, Button actions, collapsed + expanded states (01.0–14.0 kept as history) |
| Eval pages | `0.5 Eval` · `01.5 Eval Delta` (history) · `02.5 Eval Delta` (latest run; 11.5 runs on look-approval) |
| Libraries / version | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`) Tokens (Light/Dark) + Scales + text styles, imported by key; `boundVariables` verified non-null. No hand-mirrored values. |
| Breakpoints | S · 480px / L · 1024px |
| Status | approved 2026-08-28 — ready for apply |

Dark frames: a default-white-fill defect on inner containers (D1,
founder-caught) was fixed across all pages; dark verified clean.

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| 1. Fix the status vocabulary | Four-class badge contract (success = machine-verified, neutral = trailing by design, outline = declarative, destructive = genuine drift) + rewritten legend that names what actually renders. Don't-break honored: "trails by design ≠ drift" is now *more* visible, not less. |
| 2. Make the taxonomy visible | Three titled groups in role order (Source of truth → Enforcement → Figma mirror); kind pill deleted; cards hug height; Principles compacted; section 34% shorter at L. |
| 3. Surface the enforcement story accessibly | Inline "Checked by / Declarative" line per card naming gate + when it runs; tooltips eliminated; one vocabulary (automated / by judgment); fixed badge column. The gates↔manifests gap is bridged on the card, without moving the Verification section. |
| 4. Link summary to detail | Path links ↗ to GitHub, two anchors ↑ to existing sections, drift magnitude in the header meta. |

Don't-breaks touched: none violated — the surface stays a pure projection of
the snapshot (new fields: enforcement line, founder-authored count, per-item
sync reasons come from the generator, not hand-written copy).

## Eval Delta (15.5 — final, run at design approval)

> Isolated subagent, same rubric, run against the approved `15.0` frames
> (collapsed, expanded, S). 0.5 baseline cached. Figma: `15.5 Eval Delta`.
> Earlier deltas (01.5, 02.5) stand as history.

**Baseline dispositions:** F3, F4, F6, F7, F8, F10, F11, F12, F15
addressed. F1, F2, F5, F13, F14 obsolete by design: the status display
they concerned moved to the Verification and Figma-preview sections at
the founder's direction. F9 partial: the 480 h2 runt is fixed, but body
runts remain ("builds." at 1024, "alike." at 480) and 480 count lines
break mid-unit ("2 form / components").

**Per-rubric:** 6 green (visibility, user-control, flexibility, aesthetic,
error-recovery, help-and-documentation) · 5 yellow, each held by a queued
apply item below · 0 red. Baseline was 2 red / 7 yellow / 2 green.

**New findings (G) — rejected by the founder, none queued:**

The 15.5 run reported four findings on wording and button treatment (G1
marker in the expanded list, G2 external-link affordance, G3 softening
"always match", G4 mirroring the toggle noun). The founder rejected all
four: the copy was hand-crafted this iteration and is not to be altered
outside founder review. Apply builds to the 15.0 frames exactly as
approved, with the founder's copy verbatim and both actions as outline
Buttons.

**Process note (for the eval-gate workflow):** a final delta run against
founder-crafted copy is problematic. The rubric cannot distinguish
deliberate authored voice from defects, so at this stage it mostly
critiques wording the founder just approved — findings that arrive after
the approval they were meant to inform, aimed at text the eval has no
standing to change. The informational-only rule contained it (nothing
blocked, founder dispositioned), but future changes should either run the
final delta before the founder's copy pass, or scope late deltas to
structure and rendering and exempt authored copy.

**Apply queue:** the P5 mechanicals from the approved design that do not
touch wording — `text-wrap: balance` on the heading and `pretty` on
descriptions (line-break rendering only; every word stays the founder's).

## Decisions

**Decided by the founder, 2026-08-28 (at design approval):**

- [x] **D2 — green badge contract: (A) a gate-verified claim.** Superseded
      by the stronger 04.0 rule: a badge reports a changeable state, green
      means its gate is passing, and facts like parity live in the tally
      text instead. The dirty-tree note is meta text, not a badge.
- [x] **D6 — name collision: (A) dashboard group renames to "Mirror
      state".** The page's Figma-mirror section keeps its name; the lock
      card's anchor becomes unambiguous. (B anchor-reword-only and C
      accept-collision declined.)
- [x] **Per-principle provenance: (A) lives in the Design-principles
      section.** Dashboard card keeps summary counts + anchor; per-principle
      source chips render in the section it links to; no duplicate list
      returns to the dashboard (F4 fix preserved).

1. **Taxonomy is layout, not metadata.** Group headers ("Source of truth",
   "Enforcement", "Mirror state" per D6) replace the kind pill. The snapshot
   gains a `group` field per manifest; the dashboard renders groups from data
   — array order stops being load-bearing (spec: deliberate taxonomy).
2. **Badge contract.** success = machine-verified claim · neutral = expected
   non-final state · outline "declarative" = nothing to sync · destructive =
   genuine drift, rendered only when real. Encoded in
   `manifest-snapshot.types.ts` as documentation of the level semantics.
3. **Enforcement line is generated.** The snapshot gains per-manifest
   `enforcement` text (gate command + when it runs + mode); the dashboard
   renders it as a visible caption. This is the anchor's "look at the manifest
   and understand what the system is checking for and how" landing on the
   surface — consolidation of the checks themselves onto the manifests stays
   a follow-up change.
4. **One enforcement vocabulary: automated / by judgment.** Sibling sections
   align copy in apply (PrinciplesPanel "judgment" already matches; the
   dashboard drops "guiding").
5. **Principles card shows provenance, not items.** "10 externally sourced ·
   10 founder-authored" (founder-authored count added to the generator);
   detail lives in the Design-principles section, one anchor away (spec:
   provenance legible — summary + per-principle at the section it links to).
6. **Links style:** paths use the site link pattern (underline + primary-4,
   `↗` external / `↑` in-page), matching sibling sections' outbound links.

## Risks / Trade-offs

- **Principles card no longer lists ids on the dashboard.** Per-principle
  provenance now lives only in the Design-principles section; the spec
  scenario "provenance legible at the item level" is satisfied *there*
  (apply adds source chips per principle if the section lacks them — verify
  during apply). If the founder wants ids on the dashboard too, that is a
  frame iteration (`02.0`), not a blocker.
- **Component manifests keeps all 17 rows** (two-column at L). It is the one
  card whose items are the section's unique payload; if it reads as heavy
  next to its compacted neighbors, a future change can move per-component
  state to the Figma-mirror section.
- **Snapshot schema grows** (group, enforcement, founder-authored count,
  per-item reasons). All generator-derived; no hand-maintained prose beyond
  the legend paragraph.
