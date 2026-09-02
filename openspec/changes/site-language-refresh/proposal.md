# site-language-refresh — proposal

## Human anchor

> "my focus today is refining the language and presentation of the MVDS main page to match the way I talk about it elsewhere and also the updates I made lately to the IA of the manifests and checks."

Supplied with the anchor, the founder's canonical framing (from her own tighter-language session, to be used verbatim): headline "An opinionated design system that doesn't drift."; supporting copy "MVDS is built for products made with people and AI agents. It turns design intent into reusable primitives and machine-enforced constraints—so every new experiment starts coherent, and stays that way." ("experiment" chosen by the founder over screen/product/experience); proof line "Tokens, semantic type, layout primitives, component manifests, and checks that can fail a build." (founder direction: presented as a checklist, not a sentence); CTAs "Browse the system" / "Start with the starter app" / "View package on npm".

## Outcomes

- **Who:** Visitors to the MVDS site — peers and potential consumers sizing up the system, and agents orienting in it; the founder, whose public framing the page is.
- **Job:** Read the landing page and hear MVDS described the way the founder describes it everywhere else — and see the principles presented the way the manifest actually holds them.
- **Done when:** The hero carries the founder's headline, supporting copy, proof-line checklist, and CTA labels verbatim; the principles section groups by enforcement (enforced vs judgment) with provenance as per-card data, so `no-runts` (founder-authored, judgment-held) has an honest home; the README opener matches the same framing; all four gates are green.
- **Not doing:** AGENTS.md's internal "agent-first" framing (founder's call, separately); Storybook Intro page rewrites; any new components, tokens, or variants; Figma sync.

## Why

The landing page still spoke in an earlier register ("A design system that agents can't drift from") while the founder's language has moved on. Separately, the eval-gate work changed the principle manifest's IA: provenance (founder/external) and enforcement (automated/judgment) used to coincide on the page — "Authored here — every one is machine-enforced" — and `no-runts` broke that premise, making the section copy actively false. The page's job is showing real state; its own framing was stale.

## What changes

- **Hero** (`src/components/site/site-hero.tsx`): founder's copy verbatim; proof line rendered as a five-item ✓ checklist with real list semantics; CTAs relabeled; no-runts guards on the line breaks.
- **Principles panel** (`src/components/site/principles-panel.tsx`): regroup enforcement-first ("Enforced — fails the build" / "Held by judgment"), provenance stays as each card's source line; judgment section copy names the records' double duty (system rationale + discovery-eval rubric); per-card enforcement badge dropped as redundant.
- **Stories** for both components updated to pin the new copy, the checklist semantics, and the axis-crossing fixture case (`no-runts` in the judgment section).
- **README**: opener aligned to the canonical framing; stale "demo app — Card + Button" descriptions corrected.

## Capabilities

### New Capabilities

- `site-voice`: the landing page speaks the founder's canonical framing and presents the principle manifest's real IA (enforcement grouping, provenance per record).

### Modified Capabilities

- None.

## Impact

- Surface-only: `src/components/site/` + stories, README. No token, primitive, or component API changes.
- **Process note (honest record):** implementation was drafted ahead of this change on `feat/site-language-refresh` (draft PR #105) before the founder redirected the work through the schema. This change brings it under the loop: the discovery eval (0.5) runs against the as-is surface on `main`; the drafted branch is the design's starting point, and the eval delta (1.5) judges it. Artifacts ride the same branch/PR — one work item, one PR.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- Figma sync: `docs/SYNC.md`
- House rules: `AGENTS.md`
- Draft PR: https://github.com/beckharrisdesign/mvds/pull/105
