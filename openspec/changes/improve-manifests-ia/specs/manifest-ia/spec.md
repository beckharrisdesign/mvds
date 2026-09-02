# manifest-ia

## Purpose

The organization of MVDS's self-knowledge: the set of manifests the system
maintains, the taxonomy that relates them, the provenance of what they contain,
and the enforcement story each one declares. Held to a standard of legibility —
a reader of the landing-page dashboard or a manifest file can answer "what does
the system know, what is it checking for, and how" without spelunking scripts.

## Outcomes

From [proposal.md](../../proposal.md):

- **Who:** The founder and agents reading the landing page's manifest dashboard,
  and anyone orienting on how MVDS's self-knowledge is organized before touching
  a manifest file.
- **Job:** See the manifests as a coherent taxonomy — and, from the manifest
  alone, understand what the system is checking for and how it is enforced.
- **Done when:** Discovery has produced an as-is Figma capture plus a heuristic
  review; an approved design reorganizes the manifests as a system;
  accessibility standards have a deliberate home; principle provenance is
  legible; the dashboard reflects the new organization and each manifest
  surfaces its enforcement story.
- **Not doing:** No change to what any check enforces in this change; no
  landing-page redesign beyond the manifest dashboard section; no Figma library
  sync beyond this change's own discovery/design frames.

## ADDED Requirements

### Requirement: Manifests are presented as a deliberate taxonomy

A reader of the dashboard sees the manifests organized by a declared taxonomy —
what each manifest is and where its kind of knowledge belongs — not an accreted
flat list in file-creation order.

**Fails until:** The dashboard renders groups (or an equivalent declared
ordering principle) that come from the snapshot's taxonomy data, not from
incidental array order.

#### Scenario: Dashboard groups manifests by taxonomy

- **WHEN** the landing page's "What the system knows about itself" section
  renders the manifest snapshot
- **THEN** manifests appear organized by the approved taxonomy, and the
  grouping/order is driven by declared snapshot data rather than incidental
  ordering.

### Requirement: The manifest inventory is truthful and complete

Everything the system knows about itself appears in the dashboard — the
presentation matches the actual set of manifests the snapshot generator
produces, with real counts, so the founder's mental model and the rendered
inventory cannot silently diverge.

**Fails until:** Every manifest emitted by `generate-manifest-snapshot.mjs`
has a home in the rendered taxonomy (none dropped, none uncategorized).

#### Scenario: Every snapshot manifest has a place

- **WHEN** the snapshot generator emits its full set of manifests
- **THEN** each one renders inside a taxonomy group on the dashboard, with its
  real counts, and no manifest is omitted or left ungrouped.

### Requirement: Each manifest declares its enforcement story

Looking at a manifest — on the dashboard or in the file — a reader can tell
what the system is checking for, which gate runs the check, and how it is
enforced (error at build, guarded at keystroke, drift-flagged on sync, or
declarative-only).

**Fails until:** Each manifest card on the dashboard states its enforcement
story (checked-by gate and enforcement mode), including manifests whose
standards today are enforced by scripts no manifest names.

#### Scenario: Enforcement story readable from the dashboard

- **WHEN** a reader views any manifest card on the dashboard
- **THEN** the card states what is checked, by which gate (e.g.
  `check:principles`, `check:contrast`, `check:figma`), and how it is enforced
  — or states explicitly that the manifest is declarative-only.

### Requirement: Accessibility standards have a deliberate home

Contrast is positioned as one member of an accessibility-standards family with
a designed place in the taxonomy — integrated into an existing manifest or
standing alone — rather than an unlabeled peer of whole manifest categories.

**Fails until:** The taxonomy contains an explicit accessibility-standards
placement that the contrast standard belongs to, visible on the dashboard.

#### Scenario: Contrast appears within accessibility standards

- **WHEN** a reader looks for what the system enforces about accessibility
- **THEN** the dashboard shows an accessibility-standards home (integrated or
  standalone per the approved design) that contains the contrast standard,
  with its enforcement story attached.

### Requirement: Principle provenance is legible

The principles manifest makes visible which principles are industry standards
(e.g. usability heuristics) and which are founder-authored — a permanent split
the IA expresses instead of blurring.

**Fails until:** Provenance is readable per principle in the dashboard's
principles presentation, not only as aggregate counts.

#### Scenario: Industry vs founder-authored principles distinguishable

- **WHEN** a reader views the principles manifest on the dashboard
- **THEN** each principle's provenance (externally sourced vs founder-authored)
  is legible at the item level, and the split is also visible in summary.
