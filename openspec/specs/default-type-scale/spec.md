# Capability: default-type-scale

> Canonical spec. Promoted from `openspec/changes/themeable-typography/` when that
> change was archived (2026-08-25, shipped in PR #84). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Purpose

MVDS ships a deliberately authored default typography scale — the sizes, weights, and tracking behind the semantic ramp — that reads well with nothing touched. Its values are recorded as authored, with provenance, so a brand can see what was chosen and why before changing it, and so the seams a brand reaches for are taught rather than discovered.

## Outcomes

- **Who:** Every consumer who never touches a type token — the default must simply be good; the founder, who owns the scale's provenance from now on.
- **Job:** Ship a deliberately authored default typography scale that works untouched, and teach the seams where brands look.
- **Done when:** See proposal — values recorded as authored with provenance, default render pixel-identical, recipe + specimen updated.
- **Not doing:** Changing any default size/weight/tracking value in this change unless the founder redlines the scale on the design page.

## Requirements

### Requirement: The default scale is authored, and the default render does not move

The ramp's default values are adopted as the deliberately authored MVDS scale — the token-layer comment records their provenance (reviewed and owned, no longer silently Tailwind's ladder) — and the runtime restructure changes seams, not output.

**Fails until:** The provenance note exists in `src/index.css`, and Chromatic shows zero diffs on every story with no overrides in place.

#### Scenario: Default render is pixel-identical

- **WHEN** the restructured token layer ships with no consumer overrides
- **THEN** every story renders exactly as before (Chromatic zero-diff), and the scale's provenance is recorded at the tokens

### Requirement: The recipe and specimen teach the type seams

`docs/THEMING.md` gains a "type voice" recipe — swap a face app-wide, serif headings, adjust a step size, scope a face per `data-brand` — replacing the build-time `@theme` font recipe, and "what NOT to override" distinguishes shape (steps, weights, tracking) from skin (faces, sizes). The Storybook type specimen names the two slots and the runtime tokens.

**Fails until:** The THEMING sections and the specimen note both exist.

#### Scenario: Theming docs carry the type-voice recipe

- **WHEN** a consumer reads `docs/THEMING.md` or opens the type specimen
- **THEN** they find the plain-CSS recipes for faces and sizes (app-wide and scoped) and the shape-vs-skin boundary, without reading source
