# landing-edit-pass — design

## Context

The founder's edit pass on the landing page, driven visually: she edited the
As-Is HF frames directly, iterated to `02.0 Propose: landing page edit pass -
manual edits`, and approved that iteration at the 0.6 checkpoint. This design
formalizes her `02.0` frame into implementable, on-system terms — generated
with the approved 0.6 Eval Summary in context — as the `v2` frames beside her
sketch. Hero and header ship from main (`site-language-refresh`, today) per
the anchor.

## Goals / Non-Goals

**Goals:**

- The rendered page is exactly the founder's composition: header → dark hero
  band → Elements of the MVDS (light) → Quick start (dark band, two named
  paths) → footer.
- Every 0.6 top issue is explicitly answered (table below).
- Everything stays on-system: the dark bands are the dark token scope, not
  hand-painted fills; copy holds to `site-voice`.

**Non-Goals:**

- Hero or header changes (they ship from main verbatim, minus the header's
  dead `#figma-mirror` anchor button).
- The sixteen section-internal follow-up findings recorded in 0.6.
- Deleting the hidden sections' components or stories; Figma Core sync;
  S 480 propose frames (the change is IA + section styling; the layout
  primitives already reflow, and stories cover both modes).

## User flow / IA

Single page, five bands: light header chrome · dark hero (identity + the six
elements named + five destination buttons) · light Elements section (the six
cards, scannable) · dark Quick start (two named paths: "Start from a package"
with the two install steps; "Or start from a working app") · light footer.
Principles, verification, and the Figma mirror do not render; their components
and stories stay in the repo.

## Visual design / Figma

| Item | Value |
| --- | --- |
| Primary file URL | <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB> — scratch HF "MVDS explore: landing-edit-pass" (MVDS Core `C20nU0mROzk3Zr0I9BELJF` referenced by variable/style/component key) |
| As-is page / frame | `0.0 As is` (<https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=16-2>) — `L 1024 / light` + `L 1024 / dark` mirror main `ad93e7f`; S pair mirrors `c84e494` (noted) |
| Proposed page / frame | `02.0 Propose: landing page edit pass - manual edits` (<https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=83-299>) — founder frame 83:300 (authoritative intent, untouched) + **`L 1024 / light / v2`** (89:299) + **`L 1024 / dark / v2`** (90:299), the formalized proposal. Prior iteration `01.0` retained untouched. |
| Libraries / version | MVDS Core Tokens/Scales/Type by key; Button/Badge instances from Core component sets; `@beckharrisdesign/mvds@0.4.0`. Dark bands = explicit Dark mode on the section frames (the Figma analog of the code's dark scope). |
| Breakpoints | L · 1024px (S · 480px handled by the existing responsive primitives; no S propose frames this change) |
| Status | ready for founder review at this checkpoint |

## Eval Summary → Proposal

| 0.6 item | How the proposal addresses it |
| --- | --- |
| S5 — fifth element named two ways | The card renames to **"OpenSpec schemas"**, matching the pinned hero checklist verbatim (v2 frames show it; `manifest-dashboard.tsx` element name + `COPY` key follow). |
| S3 — version badge on the dark hero | The band is the real dark token scope, so the badge renders its dark-mode success tint — the pairing `check:contrast` already holds to AA. The founder frame's hand-picked fills are replaced by scope resolution (this is what made the badge illegible in the sketch). |
| Dead `#principles` target | The Principles card's second action becomes **`principles.config.mjs`**, linking the manifest source file — restoring the second-button-is-the-source pattern shared by all six cards (also dissolves S9's near-duplicate labels). No in-page anchor remains. |
| Storybook prod resolution | Apply-time verification only: `STORYBOOK_HREF` resolves `/storybook/` in production builds; dev's `localhost:6006` is expected. |
| S8 + S18 — long-card runts | Copy rewrites end the starter paragraph on a longer clause, and both cards' paragraphs get `text-pretty` verified (with a no-break join on the final two words if rendering still strands one). |
| Dark bookend bands (02.0) | Hero + package `<Section>`s carry the dark scope class so every token inside resolves from the dark block, both page modes, zero hand-painted color — `scoped-theming`'s mode mechanics, applied to mode rather than brand. |
| Full-sentence copy (founder direction) | Quick start captions and starter paragraph rewritten as full sentences (drafts below, in the v2 frames verbatim); `site-voice` governs. |

**Don't-breaks touched:** none violated — hero/header content ships from main;
hidden sections keep components + stories; no dead anchors remain (the header
Figma anchor button and the `#principles` target both go); the band rhythm
replaces the old alternate-stripes rule per the amended spec.

## Copy (exact strings, founder-approved register)

- Step 1 caption: "The package installs from the public registry, with no
  .npmrc, login, or token."
- Step 2 caption: "These lines go in your global stylesheet." (drops the
  "three lines" count that S14 flagged against the wrapped render)
- Starter paragraph: "examples/starter is a complete consuming app, with dark
  mode wired and the brand override stubbed. It is written to the same golden
  rules the principles gate enforces here. CI installs the published package
  into it and builds it on every pull request, so it is known-good rather than
  merely written down."
- Card headings: "Start from a package" / "Or start from a working app".
- Element card title: "OpenSpec schemas" (was "Workflow schemas").

## Eval Delta (1.5)

> Same rubric, isolated subagent, run against the `v2` frames. Every 0.5
> baseline finding dispositioned. Informational — regressions are highlighted
> here, never auto-blocking. Figma mirror: `02.5 Eval Delta` page —
> <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=91-299>.

| 0.5 finding | Disposition | Note |
| --- | --- | --- |
| S2 header glyphs | addressed | Header pills glyph-free, destination-titled; the Figma anchor button is gone. |
| S3 badge contrast | addressed | The dark band is the real dark scope; the success tint resolves per mode and reads clearly. |
| S5 fifth element name | addressed | Card renamed "OpenSpec schemas"; all six checklist items now match card titles verbatim. |
| S9 sources button | addressed | "principles.config.mjs" restores the path-button pattern across all six cards. |
| S14 line-count caption | addressed | Count-free caption ("These lines go in your global stylesheet."). |
| S18 "down." runt | addressed | Rewritten paragraph ends on a full clause. |
| S1, S4, S6, S7, S8, S10, S11, S12, S13, S15, S16, S17, S19, S20 | deliberately preserved | All fourteen live in kept-section internals or hero/header chrome — recorded in 0.6 as follow-up-change scope. (S8's "fail builds." runt: `text-pretty`/no-break join verified at apply; the static frame still shows it.) |
| — regressed | none | |

**New findings from the delta run:**

- **N1 (high) / N2 (medium) — v2 frame artifacts, already fixed:** "Starter
  app" rendered disabled-looking and the starter paragraph rendered all-mono.
  Both were formalization slips in the Figma frames, not the proposal — code
  renders the real `Button` component and sans prose with one code span. The
  frames now bind `primary`/`primary-foreground` and Inter + mono-span, and
  render correctly in both modes.
- **N3 (low)** — arrow glyphs persist in the quick start ("Full install guide
  →", "Open the starter →") while the header went glyph-free. Shipped copy;
  belongs to the follow-up family with S2/S19.
- **N4 (medium)** — the `@source` line wraps mid-path with no copy affordance,
  compounding S15/S16. Follow-up scope (copy affordances are a component-level
  addition, not IA).
- **N5 (low)** — in light mode the toggle visibly changes only the light
  bands. Accepted trade-off of the stable dark-bookend rhythm; noted in
  Risks.

## Decisions

1. **Dark bands via scope, not paint.** `<Section className="dark">` (the dark
   token block applies to the subtree; composes with the root mode toggle).
   In dark mode the bands remain dark — a stable rhythm, not an inversion.
2. **"OpenSpec schemas" wins** as the fifth element's name; the hero is pinned
   by the anchor and the manifest id (`schemas`) doesn't change.
3. **`principles.config.mjs` replaces "All 20 with sources"** — one source
   button per card, all six following the same pattern, linking the pinned
   commit like the other path buttons.
4. **Starter card and its "Open the starter" button stay as shipped** — the
   S19 naming spread is a follow-up-change item, not this one.
5. **No S 480 propose frames.** The change alters section order, band scope,
   and one section's internal structure — all built from reflowing layout
   primitives; `npm test` exercises both modes and Chromatic catches visual
   regressions.

## Risks / Trade-offs

- **A dark band inside light mode is new surface for the contrast gate** in
  practice: every pairing used inside the bands already passes AA in dark
  mode per `check:contrast`, but component stories rendering inside a scoped
  band aren't separately axe-checked. Mitigation: the App-level story renders
  the composed page and runs in both modes in CI.
- **`.dark` as a class on a Section** relies on the token layer's `.dark`
  selector applying to subtrees (it does — it is how scoped theming's mode
  composition works), but the `principle-edit-guard` will be watching: no raw
  colors are introduced, so `check:principles` stays green.
- **The founder frame vs v2 frames drift** if she edits `02.0` again after
  approval — v2 is the implementation source; further founder edits ride a
  new iteration page per convention.
- **The mode toggle reads quieter (N5):** with stable dark bookends, toggling
  modes visibly changes only the light bands. Accepted as the cost of the
  band rhythm; if it grates in practice, inverting the bands per mode is a
  one-line scope change later.
