## Outcomes

- **Who:** Consumers branding MVDS (both dogfoods independently wanted serif headings over a sans body); agents applying type, who should never need per-element font classes.
- **Job:** Restyle every heading with one token override — the way one `--primary` override restyles every button.
- **Done when:** See proposal — heading steps consume `--font-heading`, default render pixel-identical, recipe documented, seam render-tested.
- **Not doing:** Shipping a serif font in the package; changing any ramp size/weight/line-height/tracking; a `Text`/`Heading` component; touching body/small/caption (they stay on `--font-sans`).

## ADDED Requirements

### Requirement: Heading steps consume the heading token

The type ramp's heading steps (`text-display`, `text-h1`…`text-h4`) render in `--font-heading`. Since `--font-heading` defaults to `var(--font-sans)`, the out-of-the-box render is pixel-identical to today — the token stops being inert without changing anything until a brand opts in.

**Fails until:** The computed `font-family` of an element using a heading step resolves through `--font-heading`, and overriding that one token restyles every heading with zero markup changes.

#### Scenario: Headings follow one token override

- **WHEN** a consumer overrides `--font-heading` (e.g. to a serif) in their brand layer
- **THEN** every `text-display`/`text-h1`…`text-h4` renders the new face while `text-body-lg`/`text-body`/`text-small`/`text-caption` stay on `--font-sans`

#### Scenario: Default render is pixel-identical

- **WHEN** no consumer override exists
- **THEN** headings render exactly as today (`--font-heading` resolves to `--font-sans`; Chromatic shows zero diffs on every story)

### Requirement: The seam is render-tested, not just declared

A story exercises the seam in a real browser: a wrapper sets `--font-heading` inline and the test asserts the computed font-family of a heading child changes while a body child's does not — so the seam can never silently regress to inert again.

**Fails until:** The override story exists and its play assertions pass in light and dark.

#### Scenario: Override story proves the seam

- **WHEN** the type-specimen override story renders with `--font-heading` set on its wrapper
- **THEN** the heading's computed font-family is the override and the body copy's remains the sans stack

### Requirement: The recipe is documented where brands look

`docs/THEMING.md` gains a "serif headings" recipe (load the font, override `--font-heading`) alongside the existing `--font-sans` swap, and the Storybook type specimen names the two font slots so the seam is discoverable from the gallery.

**Fails until:** The THEMING recipe section and the specimen note both exist.

#### Scenario: Theming docs carry the serif-headings recipe

- **WHEN** a consumer reads `docs/THEMING.md` or opens the type specimen
- **THEN** they find the two-step heading-font recipe and the `--font-sans` / `--font-heading` slot distinction, without reading source
