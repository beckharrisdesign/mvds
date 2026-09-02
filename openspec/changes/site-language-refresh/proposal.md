# site-language-refresh — proposal

## Human anchor

> "my focus today is refining the language and presentation of the MVDS main page to match the way I talk about it elsewhere and also the updates I made lately to the IA of the manifests and checks."

Supplied with the anchor, the founder's canonical framing (from her own tighter-language session, to be used verbatim): headline "An opinionated design system that doesn't drift."; supporting copy "MVDS is built for products made with people and AI agents. It turns design intent into reusable primitives and machine-enforced constraints—so every new experiment starts coherent, and stays that way." ("experiment" chosen by the founder over screen/product/experience); proof line "Tokens, semantic type, layout primitives, component manifests, and checks that can fail a build." (founder direction: presented as a checklist, not a sentence); CTAs "Browse the system" / "Start with the starter app" / "View package on npm".

**Founder iterations at the design gate (2026-09-02, edited in the HF file and canonized on the 02.0/03.0 pages — these supersede the corresponding copy above):**

- Supporting copy: "MVDS is built for both human and agentic founders. It turns intent into reusable primitives and machine-enforced constraints — so every new experiment starts with strong principles, and stays that way."
- The checklist is the **elements of MVDS**, six items matching the sections she is expanding below the fold in her parallel session: Principles · Token layer · Component library · Figma library · Openspec schemas · Skills.
- The button row below it is the **expressions of MVDS**, matching the header's destination naming, in order: keep reading (no button) · Starter app · Storybook · Figma · GitHub · npm — "the elements … are in a nice row, while the EXPRESSIONS of MVDS are separate … Let's make the buttons below the checkmarks match."
- Headline unchanged.

## Outcomes

> Amended 2026-09-02 on founder direction: "fwiw this change is focused on the
> hero section only - I'm not looking to improve the whole page right now and I
> have a session in parallel looking at just the manifests part." The principles
> section is OUT of this change and belongs to that parallel work.

- **Who:** Visitors to the MVDS site — peers and potential consumers sizing up the system, and agents orienting in it; the founder, whose public framing the page is.
- **Job:** Read the landing page's first screen and hear MVDS described the way the founder describes it everywhere else.
- **Done when:** The hero carries the founder's headline, supporting copy, proof-line checklist, and CTA labels verbatim; the README opener matches the same framing; all four gates are green.
- **Not doing:** The Design principles section and any manifest-presentation work (parallel session owns it); AGENTS.md's internal "agent-first" framing (founder's call, separately); Storybook Intro page rewrites; any new components, tokens, or variants; Figma sync.

## Why

The landing page still spoke in an earlier register ("A design system that agents can't drift from") while the founder's language has moved on. The hero is the founder's public framing; it should carry her canonical copy verbatim, presented with the strength it claims (the proof line as a checklist, not a sentence).

## What changes

- **Hero** (`src/components/site/site-hero.tsx`): founder's copy verbatim; proof line rendered as a five-item ✓ checklist with real list semantics; CTAs relabeled; no-runts guards on the line breaks.
- **Hero story** updated to pin the new copy and the checklist semantics.
- **README**: opener aligned to the same canonical framing (it is the hero's copy at the repo's front door); stale "demo app — Card + Button" descriptions corrected.

## Capabilities

### New Capabilities

- `site-voice`: the landing page's first screen speaks the founder's canonical framing, verbatim, at both front doors (site hero and README opener).

### Modified Capabilities

- None.

## Impact

- Surface-only: `src/components/site/site-hero.tsx` + its story, README. No token, primitive, or component API changes.
- **Process note (honest record):** implementation was drafted ahead of this change on `feat/site-language-refresh` (draft PR #105) before the founder redirected the work through the schema. This change brings it under the loop: the discovery eval (0.5) ran against the as-is surface on `main`; the drafted branch is the design's starting point, and the eval delta (1.5) judges it. Artifacts ride the same branch/PR — one work item, one PR.
- **Scope amendment (2026-09-02):** the draft originally also restructured the principles panel; those edits were reverted from the branch when the founder scoped this change to the hero only, to avoid colliding with the parallel manifests session. Discovery findings that touch the principles section are recorded there as a hand-off, not fixed here.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md`
- Draft PR: https://github.com/beckharrisdesign/mvds/pull/105
