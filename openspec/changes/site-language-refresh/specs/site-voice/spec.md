# site-voice

## Purpose

The MVDS site speaks the founder's canonical framing: the landing page's language is her language, verbatim, and its presentation of the principle manifest reflects what the manifest actually holds — enforcement and provenance as independent facts, shown honestly.

## Outcomes

As proposed (proposal.md):

- **Who:** Visitors to the MVDS site — peers, potential consumers, agents orienting; the founder, whose public framing the page is.
- **Job:** Read the landing page and hear MVDS described the way the founder describes it everywhere else — and see the principles presented the way the manifest actually holds them.
- **Done when:** Hero carries the founder's copy verbatim; principles group by enforcement with provenance per card; README opener matches; four gates green.
- **Not doing:** AGENTS.md internal framing; Storybook Intro rewrites; new DS surface; Figma sync.

## ADDED Requirements

### Requirement: Canonical hero copy

The first screen states what MVDS is in the founder's own words — headline, supporting copy, and routes out.

**Fails until:** the landing h1 reads "An opinionated design system that doesn’t drift." rather than the earlier register.

The hero SHALL render the founder's headline, supporting copy, and CTA labels verbatim as anchored in proposal.md.

#### Scenario: Hero speaks the canonical framing

- **WHEN** a visitor loads the landing page
- **THEN** the single h1 reads "An opinionated design system that doesn’t drift.", the supporting paragraph reads the anchored copy ending "…so every new experiment starts coherent, and stays that way.", and the CTAs read "Browse the system", "Start with the starter app", "View package on npm"

### Requirement: Proof line as checklist

The proof of the claim is a scannable checklist, not a sentence — each capability a checked item, ending on the punch.

**Fails until:** the proof renders as prose instead of a list.

The hero SHALL render the five proof claims as a list with real list semantics (list/listitem roles), each item check-marked.

#### Scenario: Proof line reads as a checklist

- **WHEN** the hero renders
- **THEN** a list labeled "What MVDS ships" contains exactly five items — Tokens, Semantic type, Layout primitives, Component manifests, Checks that can fail a build — each with a check glyph

### Requirement: Principles group by enforcement

The principles section's structure mirrors the manifest's own IA: what a machine can catch is the grouping, not who authored the rule.

**Fails until:** the section still groups by provenance and claims every authored rule is machine-enforced.

The principles panel SHALL group cards into an enforced section and a judgment section driven by each record's `enforcement` field, with the judgment section's copy naming the records' rubric duty.

#### Scenario: Principles group by enforcement

- **WHEN** the principles section renders from the manifest snapshot
- **THEN** every `automated` record appears under "Enforced — fails the build", every other record under "Held by judgment", and the judgment section's copy names the discovery-eval rubric role

### Requirement: Every principle shows its provenance

Provenance stays visible per record so borrowed authority can't launder an in-house opinion — and an in-house judgment call can't borrow NN/g's.

**Fails until:** a founder-authored judgment record (`no-runts`) has no honest home in the layout.

Each principle card SHALL carry its source — MVDS for founder records, a working citation link for external ones — independent of which section it sits in.

#### Scenario: Every principle shows its provenance

- **WHEN** the cards render
- **THEN** every external record links its published source, every founder record is labeled MVDS, and `no-runts` sits in the judgment section carrying the MVDS source

### Requirement: README opener matches the site

The repo's front door and the site's front door say the same thing.

**Fails until:** README still opens "An agent-first design system for early startup prototyping…".

The README opening paragraph SHALL carry the canonical framing (headline claim, supporting copy, proof list) and its descriptions of `npm run dev` / `App.tsx` SHALL match what they actually serve.

#### Scenario: README opener matches the site

- **WHEN** a reader opens README.md
- **THEN** the opening paragraph states the canonical framing and the getting-started / project-layout lines describe the site, not the retired demo app
