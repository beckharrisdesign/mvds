# Capability: storybook-intro

> Canonical spec. Promoted from `openspec/changes/storybook-start-here/` when that
> change was archived (2026-08-21, shipped in PR #75). Requirements describe the
> behaviour MVDS's Storybook Intro is held to now — edit them via a new OpenSpec
> change, not in place.

## Outcomes

- **Who:** Peers and customers in Storybook; agents using the gallery.
- **Job:** Orient, read principles, learn when checks run, install MVDS.
- **Done when:** Intro sidebar order and four pages match the approved explore design.
- **Not doing:** Landing redesign; Figma Core sync; renaming machine principle ids.

## Requirements

### Requirement: Intro appears first in Storybook

Technical readers see **Intro** before Foundations / Blocks / UI, with Start here, Design principles, How we enforce, and Get started in that order.

**Fails until:** Sidebar storySort lists Intro (and those four titles) ahead of Foundations.

#### Scenario: Intro sorts ahead of specimens

- **WHEN** a user opens Storybook
- **THEN** they can open Intro → Start here before any Foundations specimen

### Requirement: Start here orients without marketing chrome

Start here briefly explains what Intro covers (principles = rules, How we enforce = when checks run, Get started = install) — short technical orient, not a hero/install card wall.

**Fails until:** An Intro/Start here story renders that orient copy.

#### Scenario: Start here names the three follow-on pages

- **WHEN** a user opens Intro → Start here
- **THEN** they see pointers to Design principles, How we enforce, and Get started

### Requirement: Design principles come from the live manifest

The Design principles page shows real principle records (human title, id, description, enforcement, source), not static marketing cards.

**Fails until:** The page is driven by snapshot/manifest data including peer-facing titles.

#### Scenario: Principles table shows human title before id

- **WHEN** a user opens Intro → Design principles
- **THEN** each row shows a human title ahead of the machine id, with enforcement and source

### Requirement: How we enforce matches approved peer-facing copy

How we enforce describes four moments — While planning, While coding, While testing, Out in the world — in prose for customers and peers (aligned with `docs/VERIFICATION.md` / Figma 06.0).

**Fails until:** Intro → How we enforce renders those four sections with narrative copy.

#### Scenario: Four enforcement gates are readable

- **WHEN** a user opens Intro → How we enforce
- **THEN** they can read all four gate sections without a clipped script inventory as the only content

### Requirement: Get started teaches install and CSS wiring

Get started covers public npm install and the CSS `@source` requirement (and paths to starter / CONSUMING docs).

**Fails until:** Intro → Get started shows install + wire-CSS steps.

#### Scenario: Get started shows the two install steps

- **WHEN** a user opens Intro → Get started
- **THEN** they see install and wire-CSS guidance consistent with PackageDocs / CONSUMING.md
