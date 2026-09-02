# site-voice

## Purpose

The MVDS site's first screen speaks the founder's canonical framing: the hero's language is her language, verbatim, presented with the strength it claims — and the README opener carries the same framing at the repo's front door.

## Outcomes

As proposed (proposal.md, amended 2026-09-02 to hero-only scope):

- **Who:** Visitors to the MVDS site — peers, potential consumers, agents orienting; the founder, whose public framing the page is.
- **Job:** Read the landing page's first screen and hear MVDS described the way the founder describes it everywhere else.
- **Done when:** Hero carries the founder's copy verbatim with the proof line as a checklist; README opener matches; four gates green.
- **Not doing:** The Design principles section and manifest-presentation work (parallel session); AGENTS.md internal framing; Storybook Intro rewrites; new DS surface; Figma sync.

## Requirements

### Requirement: Canonical hero copy

The first screen states what MVDS is in the founder's own words — headline, supporting copy, and routes out.

**Fails until:** the landing h1 reads "An opinionated design system that doesn’t drift." rather than the earlier register.

The hero SHALL render the founder's headline, supporting copy, and CTA labels verbatim as anchored in proposal.md, with no heading or paragraph stranding a word or short phrase at 1280 or 480px (no-runts).

#### Scenario: Hero speaks the canonical framing

- **WHEN** a visitor loads the landing page
- **THEN** the single h1 reads "An opinionated design system that doesn’t drift.", the supporting paragraph reads the anchored copy (as iterated at the design gate) ending "…so every new experiment starts with strong principles, and stays that way.", and the expressions row renders five destination-titled buttons in order: "Starter app", "Storybook", "Figma", "GitHub", "npm" — the page itself is the first expression and gets no button

### Requirement: Proof line as checklist

The proof of the claim is a scannable checklist, not a sentence — the elements of MVDS, each a checked item, matched below by the expressions row.

**Fails until:** the proof renders as prose instead of a list.

The hero SHALL render the six MVDS elements as a list with real list semantics (list/listitem roles), each item check-marked, with the expressions buttons rendered as a matching row directly beneath.

#### Scenario: Proof line reads as a checklist

- **WHEN** the hero renders
- **THEN** a list labeled "The elements of MVDS" contains exactly six items — Principles, Token layer, Component library, Figma library, OpenSpec schemas, Skills — each with a check glyph, and the expressions button row sits directly below it

### Requirement: README opener matches the site

The repo's front door and the site's front door say the same thing.

**Fails until:** README still opens "An agent-first design system for early startup prototyping…".

The README opening paragraph SHALL carry the canonical framing (headline claim, supporting copy, proof list) and its descriptions of `npm run dev` / `App.tsx` SHALL match what they actually serve.

#### Scenario: README opener matches the site

- **WHEN** a reader opens README.md
- **THEN** the opening paragraph states the canonical framing and the getting-started / project-layout lines describe the site, not the retired demo app
