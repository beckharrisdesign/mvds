# Capability: landing-page-ia

## Purpose

The landing page's information architecture as a held surface: which sections
render, in what order, and the rule that de-scoped sections are unrendered
rather than deleted — kept in the repo with story coverage so they can return
by re-insertion, not re-build.

## Outcomes

See [proposal.md](../../proposal.md) Outcomes — identity first (Elements of the
MVDS directly under the hero), install path second, evidence sections off the
page; hero exactly as `site-language-refresh` shipped it.

## ADDED Requirements

### Requirement: Elements of the MVDS renders directly under the hero

Coming off the hero, the next thing a visitor sees is the six-element
description of the system.

**Fails until:** the section following the hero `<Section>` in `App.tsx` is
`ElementsOfMvds`.

The landing page SHALL render `ElementsOfMvds` as the first content section
after the hero.

#### Scenario: Elements section follows the hero

- **WHEN** the landing page renders
- **THEN** the section immediately after the hero is "Elements of the MVDS",
  before any other content section

### Requirement: Evidence sections are unrendered but retained

The principles, verification, and Figma-mirror sections are off the page — and
still in the repo, story-covered, ready to return by re-insertion.

**Fails until:** `App.tsx` renders none of `PrinciplesPanel`,
`VerificationPanel`, `FigmaMirror`, while all three components and their
co-located stories still exist.

The landing page SHALL NOT render the principles, verification, or Figma-mirror
sections, and the repo SHALL keep their components with story coverage.

#### Scenario: Hidden sections do not render

- **WHEN** the landing page renders
- **THEN** no "Design principles", "Verified, not asserted", or "The Figma
  mirror" section appears in the document

#### Scenario: Hidden section components keep story coverage

- **WHEN** `npm run check:principles` runs
- **THEN** `story-coverage-site` passes with `PrinciplesPanel`,
  `VerificationPanel`, and `FigmaMirror` still present and story-covered

### Requirement: Quick start offers two named paths

The install section is the "Quick start" heading over two named, parallel
paths: a "Start from a package" card holding the two install steps (with the
full-install-guide link inside it), then the "Or start from a working app"
starter card. No package-name head or lead paragraph above. Captions and the
starter paragraph read as full sentences (founder direction — no dash-splice
register; `site-voice` governs).

**Fails until:** `PackageDocs` renders no intro head; its content is the
"Quick start" heading followed by the "Start from a package" card and the
starter card.

The package section SHALL render the "Quick start" heading, then a
"Start from a package" card containing the two install steps and the full
install guide link, then the "Or start from a working app" starter card.

#### Scenario: Quick start offers two named paths

- **WHEN** the package section renders
- **THEN** its content is the "Quick start" heading, the "Start from a
  package" card (two steps + guide link), and the starter card — with no
  `@beckharrisdesign/mvds` head or lead paragraph

### Requirement: Header carries no dead anchors

With the Figma-mirror section unrendered, the header button targeting
`#figma-mirror` goes with it.

**Fails until:** the header renders no link to `#figma-mirror`.

The header SHALL NOT render a link whose target section does not render.

#### Scenario: Header has no Figma anchor button

- **WHEN** the landing page renders
- **THEN** the header shows theme toggle, GitHub, and Storybook actions, and no
  "Figma" button

### Requirement: Dark bookend bands

The hero and Quick start sections render as dark-scoped bands while the
header, Elements, and footer stay on the page surface — the founder's `02.0`
rhythm, implemented with the shipped `scoped-theming` mechanism so every
token pairing inside the bands resolves from the dark scope and stays
AA-checked.

**Fails until:** the hero and package `<Section>`s carry the dark scope in
`App.tsx` and render dark in light mode.

The hero and Quick start sections SHALL render on the dark scope in light
mode, with all contained tokens resolving per scope.

#### Scenario: Dark bookend bands

- **WHEN** the landing page renders in light mode
- **THEN** the hero and Quick start sections render as dark bands, the
  header, Elements, and footer render light, and `npm run check:contrast`
  passes
