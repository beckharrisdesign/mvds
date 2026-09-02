# improve-manifests-ia

## Human anchor

> "I want to specifically look at how these various manifests are organized and
> then propose improvements to them as a system. In general I think I have
> component manifests, design principle manifests, and then contrast -- when
> really contrast is part of a larger set of accessibility standards that
> probably deserve to be integrated and/or their whole standalone manifest. The
> design principles are split between usability heuristics and my own self added
> elements, and that balance of industry standards plus user provided is not
> going away."

> "eventually I want this to impact how we check and enforce all of these
> things. it should be easy for soneone to look at hte manifest and understand
> what the system is checking for and how."

## Outcomes

- **Who:** The founder and agents reading the landing page's manifest dashboard
  ("What the system knows about itself"), and anyone orienting on how MVDS's
  self-knowledge is organized before touching a manifest file.
- **Job:** See the system's manifests as a coherent taxonomy — what each
  manifest is, why it exists, and where a given kind of knowledge (component
  specs, principles, accessibility standards, mappings) belongs — and, from the
  manifest alone, understand **what the system is checking for and how** it is
  enforced.
- **Done when:** Discovery has produced an as-is Figma capture plus a heuristic
  review of the current manifest IA, and an approved design reorganizes the
  manifests as a system: accessibility standards (contrast today) have a
  deliberate home — integrated or a standalone manifest — and the principles
  manifest makes the industry-standard vs founder-authored split legible. The
  landing page dashboard reflects the new organization, and each manifest
  surfaces its enforcement story — what is checked, by which gate, and how.
- **Not doing:** Not changing what any check enforces *in this change* —
  contrast thresholds, principle rules, and sync drift detection keep their
  current behavior. The IA is, however, explicitly designed as the future spine
  of enforcement: later changes will hang checks off this taxonomy, so nothing
  in the new organization may assume manifests are display-only. No
  landing-page redesign beyond the manifest dashboard section. No Figma library
  sync — only the discovery/design frames this change's own workflow calls for.

## Why

The manifest layer grew one file at a time — principles, then Figma component
specs, then conventions, then the contrast check — each added where it was
convenient rather than placed in a designed structure. The founder's mental
model ("component manifests, design principle manifests, and then contrast")
already diverges from what the snapshot actually lists (six manifests including
the lock file, tokens, and scales), which is itself a finding: the organization
is not legible enough to hold in one's head. Two structural tensions are named
in the anchor: contrast is filed as a peer of whole manifest categories when it
is really one member of a larger accessibility-standards family, and the
principles manifest interleaves industry heuristics with founder-authored rules
without making that provenance visible — a split that is permanent, so the IA
should express it rather than blur it.

The stakes are larger than presentation. The manifests are headed toward being
the declared source of enforcement — the founder's direction is that someone
should be able to look at a manifest and understand what the system is checking
for and how. `principles.config.mjs` already works this way (records drive
`check:principles`); contrast and the Figma drift check enforce real rules that
no manifest declares legibly. A sound taxonomy now is what lets enforcement
consolidate onto it later instead of accreting another parallel structure.

## What changes

- Discovery (0.0 As-is) captures the current manifest IA — the landing-page
  dashboard and the underlying manifest files — as an as-is Figma frame and a
  heuristic review of the organization.
- Design proposes the manifests-as-a-system taxonomy: where accessibility
  standards live, how principle provenance (industry vs founder-authored) is
  expressed, how each manifest declares its enforcement story (what is checked,
  by which gate, and how), and how the dashboard groups and orders the
  manifests.
- Apply restructures the manifest metadata/snapshot and the dashboard section to
  match the approved taxonomy.

## Capabilities

### New Capabilities

- `manifest-ia`: the organization of MVDS's self-knowledge — the set of
  manifests, their taxonomy, provenance, and enforcement story (what each
  manifest checks and how), and how the landing-page dashboard presents them as
  a system.

### Modified Capabilities

_None yet — discovery may implicate `scale-stepping-principles` or
`eval-rubric` surfaces; the design will name them if so._

## Impact

- `scripts/generate-manifest-snapshot.mjs` and
  `src/generated/manifest-snapshot.json` — snapshot structure/grouping.
- `src/components/site/manifest-dashboard.tsx` (+ fixture, stories, types) —
  dashboard IA.
- Potentially `principles.config.mjs` metadata (provenance fields) and a home
  for accessibility standards — organization only, not enforcement behavior.
- MVDS Core Figma: discovery/design frames only (as-is + HF explorations).

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md`
