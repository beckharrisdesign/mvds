# site-language-refresh — tasks

> Apply target is the approved design's **04.0** state. The hero code on this
> branch already carries the earlier (superseded) copy — apply updates it to
> 04.0, it does not start from main.

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Hero speaks the canonical framing — h1 "An opinionated design system that doesn’t drift."; supporting paragraph in the founder's iterated wording ending "…so every new experiment starts with strong principles, and stays that way."; the expressions row reads Starter app · Storybook · Figma · GitHub · npm (the page itself is the first expression, no button).
- [x] 1.2 Proof line reads as a checklist — a list labeled "The elements of MVDS" with exactly six checked items: Principles, Token layer, Component library, Figma library, OpenSpec schemas, Skills; the expressions row sits directly below it.
- [x] 1.3 README opener matches the site — the opening paragraph carries the same framing, and the getting-started / project-layout lines describe the site, not the retired demo app.

## 2. Preview (Storybook)

- [x] 2.1 `Site/SiteHero` story renders the 04.0 hero (checklist + expressions row) in light and dark; `npm run storybook`.

## 3. Implementation

- [x] 3.1 `src/components/site/site-hero.tsx` — supporting copy to the founder's iterated wording ("built for both human and agentic founders … starts with strong principles", spaced em dash); checklist items to the six elements, list label "The elements of MVDS"; runt guards re-checked for the new copy.
- [x] 3.2 `site-hero.tsx` — CTA row becomes the expressions row: five `Button variant="default"` (primary) destination-titled buttons — Starter app · Storybook · Figma · GitHub · npm — wired to starter URL, Storybook, MVDS Core Figma share, repo, npm.
- [x] 3.3 `src/App.tsx` — header buttons icon-free and reordered to match the expressions order: Dark mode · Storybook · Figma · GitHub (arrows dropped per the founder link rule).
- [x] 3.4 `site-hero.stories.tsx` — assert six list items under "The elements of MVDS", the five expression button names in order, and no ↗/→ glyphs.
- [x] 3.5 `README.md` — opener updated to the iterated supporting copy and the six elements (replacing the earlier five-item proof list).

## 4. QA

- [x] 4.1 Manual walkthrough against Outcomes — live page at 1280 and 480, light and dark; no runts in hero rows (the 3.5/04.0 delta baseline), single h1, no horizontal overflow at 480.
- [x] 4.2 `npm run build` · `npm run check:contrast` · `npm run check:principles` · `npm test` (light + dark) — all green.

> §1 verified by the founder 2026-09-02 ("they read right") after reviewing the live preview, approving the Chromatic baselines, and merging PR #105.
