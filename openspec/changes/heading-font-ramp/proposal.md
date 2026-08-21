# heading-font-ramp

## Human anchor

> "yes lets propose the fixes 1-3 to start. 4-6 I've had in the back of my mind for a whie and want to get to as well." — from the dogfood round: "ok lts dogfood an experiment! A landing page, for a wellness and fitness coach who specializes in combining physical wellgeing with creative wellbeing."

## Outcomes

- **Who:** Consumers putting a brand on MVDS — both dogfoods independently wanted serif display headings over a sans body — and agents applying type, who should never need per-element font classes.
- **Job:** Restyle every heading in an app with one token override, the same way one `--primary` override restyles every button.
- **Done when:** The heading steps of the semantic ramp (`text-display`, `text-h1`…`text-h4`) render in `--font-heading`; since `--font-heading` defaults to `var(--font-sans)`, the out-of-the-box render is pixel-identical to today; a consumer overriding `--font-heading` (e.g. to Fraunces) restyles every heading with zero markup changes — the Motion & Muse page drops all eight hand-applied `font-heading` utility classes; `docs/THEMING.md` gains the heading-font recipe next to the existing `--font-sans` one; type specimen story reflects it and all gates pass in both modes.
- **Not doing:** Shipping a serif font in the package (consumers load their own, as today); changing any ramp size, weight, line-height, or tracking; adding a `Text`/`Heading` component (that is the ask-4 "Text component" discussion, a separate change); body/caption steps stay on `--font-sans`.

## Why

The seam is half-built: `src/index.css:30` already defines `--font-heading: var(--font-sans)`, but no ramp step consumes it — so overriding the token does nothing. Both dogfoods paid for that. Motion & Muse hand-applied the `font-heading` utility to all eight headings to get Fraunces (`FINDINGS.md` gap #2). The hub wanted exactly the same pairing — REVIEW_QUEUE #14 ("Typography — Fraunces headings + Inter body … MVDS default is Inter for both") — and, with no seam, hacked it globally with an `@layer base` block re-declaring `h1`–`h6` (`app/globals.css:115-125`), overriding the ramp's shape from outside. A token that exists but is inert is worse than a missing one: it documents an intent the system silently ignores.

This is the smallest change of the three: point the ramp's heading steps at the token that was already built for them.

## What changes

- The heading steps of the type ramp in `src/index.css` add `font-family: var(--font-heading)` (display + h1–h4; body/small/caption untouched).
- `docs/THEMING.md`: a "Recipe: serif headings" section (load font, override `--font-heading`), alongside the existing `--font-sans` swap.
- Storybook type specimen notes the two font slots; visual output unchanged by default, so Chromatic should show no diffs on defaults.
- Follow-up (in-change verification, not a code change here): Motion & Muse consumes the next release and deletes its per-heading classes as the proof.

## Capabilities

### New Capabilities

- `heading-font-ramp`: the semantic ramp's heading steps consume `--font-heading`, making heading typeface a one-token brand decision.

### Modified Capabilities

- (none)

## Impact

- `src/index.css` (type ramp), `docs/THEMING.md`, type specimen story. No component files. Default render identical; Figma text styles unaffected until a sync is explicitly requested.

## Optional links

- Evidence: `motion-muse` repo `FINDINGS.md` (gap #2); hub `docs/REVIEW_QUEUE.md` #14; hub `app/globals.css:115-125`
- Theming docs: `docs/THEMING.md`
- House rules: `AGENTS.md`
