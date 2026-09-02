# improve-manifests-ia — tasks

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Dashboard groups manifests by taxonomy: a reader sees "Elements of
      the MVDS" as six cards in the approved order (Principles first), driven
      by declared snapshot data rather than incidental array order.
- [x] 1.2 Every snapshot manifest has a place: each manifest the generator
      emits renders inside one of the six elements with real counts (scales
      inside Token layer; components spec, conventions, and lock inside Figma
      library), and none is omitted.
- [x] 1.3 Enforcement story readable from the dashboard: each card's
      description states what is checked and how (contrast on build, typed
      spacing, principle checks that fail builds, the drift-guarded Figma
      spec), in the founder's approved copy.
- [x] 1.4 Contrast appears within accessibility standards: the Principles
      card states that the golden rules begin with industry standard
      accessibility and usability principles, and the Token layer card names
      the contrast check.
- [x] 1.5 Industry vs founder-authored principles distinguishable: the tally
      carries the split, the expanded list shows all twenty titles, and
      "All 20 with sources" reaches the Design-principles section for
      item-level provenance.

## 2. Preview (Storybook)

- [x] 2.1 `Site/ManifestDashboard` stories render the new section: collapsed
      default, expanded state, and the live snapshot, in light and dark;
      `npm run storybook`.

## 3. Implementation

- [x] 3.1 Snapshot generator (`scripts/generate-manifest-snapshot.mjs`):
      emit the six elements with a declared order and per-element inventory
      lists (token families and steps; components by family; the twenty
      principle titles with automated/by-judgment class; Figma collections,
      component sets, and pages; schemas and stages; skills by kind and rule
      files). Fold scales into the token entry and the three mirror files
      into the Figma-library entry. Drop gates/status fields from this
      section's data (Verification keeps its own).
- [x] 3.2 Rebuild `src/components/site/manifest-dashboard.tsx` as the
      "Elements of the MVDS" section: six full-width default-size `<Card>`s,
      h4 titles, founder-approved copy verbatim (from design.md "Founder copy
      edits on 15.0"), tally line, per-card disclosure with the inventory
      list, and two `<Button>` actions per card (toggle + destination), no
      glyphs. No badges anywhere in the section.
- [x] 3.3 Build to the 15.0 frames exactly: founder copy verbatim, both card
      actions as outline Buttons, no G-finding alterations (rejected by the
      founder — see design.md). CSS-only rendering care: `text-wrap: balance`
      on the heading, `pretty` on descriptions (line breaks only; no words
      change).
- [x] 3.4 Update `src/App.tsx` composition and types
      (`manifest-snapshot.types.ts`), update the fixture, and remove
      dead status/badge code paths outright (pre-1.0 clean break).
- [x] 3.5 Update `manifest-dashboard.stories.tsx`: collapsed, expanded, and
      live-snapshot stories with play assertions on order (Principles
      first), the disclosure toggle, and the absence of badges.

## 4. QA

- [ ] 4.1 Manual walkthrough against §1 outcomes, light and dark, 1024 and
      480 (no mid-unit count-line breaks, no stranded words in the founder
      copy where CSS can prevent it).
- [x] 4.2 `npm run build` · `npm run check:contrast` ·
      `npm run check:principles` · `npm test` (light + dark) all pass.
