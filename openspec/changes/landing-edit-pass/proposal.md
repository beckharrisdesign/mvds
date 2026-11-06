# Proposal: landing-edit-pass

## Human anchor

> "I want my elements of mvds section right under the hero section, and the rest
> hidden according to this version of the as is that I altered. I changed the
> hero today - leave whatever is in main alone."

Founder, 2026-09-02, working in the As-Is HF file
(`MVDS explore: landing-edit-pass`, frame `L 1024 / light`). The altered frame
is the source for what stays and what goes.

## Outcomes

- **Who:** Visitors landing on the MVDS site — peers and prospective consumers
  deciding what MVDS is, and agents orienting before generating UI. The founder,
  who wants the page to lead with the system's shape rather than its receipts.
- **Job:** Coming off the hero, see the six elements that make up MVDS
  immediately — then the install path — without scrolling through principles
  cards, gate results, and Figma previews to get there.
- **Done when:** The rendered content is exactly hero → Elements of the MVDS →
  Quick start, matching the founder sketch frame (the authoritative surface):
  the Design principles, Verified-not-asserted, and Figma-mirror sections no
  longer render, and the package section starts at "Quick start" — its
  `@beckharrisdesign/mvds` intro head is gone, while the "Or start from a
  working app" starter card stays (founder decision 2026-09-02, matching the
  frame). The hero renders exactly as main has it after
  `site-language-refresh`. All four gates pass.
- **Not doing:** No hero changes of any kind (copy, layout, or props — today's
  `site-language-refresh` version ships untouched). No deletion of the
  section components or their stories — `PrinciplesPanel`, `VerificationPanel`,
  `FigmaMirror`, and the package intro remain in the repo with story coverage;
  only `App.tsx` stops rendering them ("hidden", per the anchor — not removed,
  so they can return without re-building). No header or footer changes, no
  token or component-library changes, no Figma Core sync.

## Why

The landing page accreted five content sections in shipped order — principles,
verification, package, Figma mirror, elements — with "Elements of the MVDS"
(the section that says what the system *is*) arriving last, below roughly
4,500px of receipts. The founder's edit pass on the As-Is HF frame inverts
that: identity first, install path second, evidence sections off the page for
now. This is an IA judgment recorded visually in the altered frame; the change
transcribes it into code.

## What changes

Per the founder's `02.0` iteration (the authoritative frame):

- `src/App.tsx` — reorder `<main>`: `ElementsOfMvds` moves directly under the
  hero section; the `PrinciplesPanel`, `VerificationPanel`, and `FigmaMirror`
  sections (and the `#figma-mirror` header button that targets the removed
  anchor) stop rendering.
- **Dark bookend bands** — the hero and Quick start sections render on the
  dark scope while header, Elements, and footer stay on the page surface,
  using the shipped `scoped-theming` mechanism (tokens resolve per scope; the
  contrast gate already holds AA per mode).
- `src/components/site/package-docs.tsx` — drop the intro head; restructure
  the section as two named paths: a **"Start from a package"** card wrapping
  the two install steps (with "Full install guide" moved inside the card)
  above the retained **"Or start from a working app"** starter card.
- **Quick start copy** — captions and the starter paragraph rewritten as full
  sentences (founder direction: no dash-splice register), holding to the
  `site-voice` spec.
- Stories for the changed surfaces updated to match (App-level composition and
  `package-docs` story states).

## Capabilities

### New Capabilities

- `landing-page-ia`: the landing page's section order and render set — what
  renders, in what order, and that hidden sections are unrendered rather than
  deleted.

### Modified Capabilities

- None. (`site-voice` governs the rewritten Quick start copy — this change
  complies with it rather than amending it; `scoped-theming` is consumed
  as-shipped for the dark bands.)

## Impact

- Site only — no exported package surface changes, no tokens, no `ui/`.
- The three hidden sections keep their components and co-located stories, so
  `story-coverage-site` still passes and the sections stay one `<Section>`
  re-insert away from returning.
- The As-Is HF file gains the founder-altered frame as the design source of
  truth for this change; discovery (0.0/0.5/0.6) runs against it next.

## Optional links

- `02.0 Propose` page — founder manual edits, the authoritative surface: <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=83-299>
- Prior iteration `01.0` sketch frame (retained untouched per convention): <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=46-191>
- `01.0 Propose` page (sketch + v1 frames + S-pins/ledger): <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=46-190>
- `0.0 As is` page (restored to mirror main): <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=16-2>
- House rules: `AGENTS.md`
- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
