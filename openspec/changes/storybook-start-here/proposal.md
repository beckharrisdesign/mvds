## Human anchor

> Storybook is stale vs the landing page — lean Start here, deeper than landing for technical readers. Principles should be the real manifests, not landing-style cards. How we enforce should be Storybook content (not docs-only), written for customers and peers: describe the processes, don’t list them in short clipped sentences. Design phase done in the explore Figma; approve and implement.

## Outcomes

- **Who:** Peers and customers opening MVDS Storybook (more technical than a marketing landing visitor), plus agents orienting in the gallery.
- **Job:** Find a short orient, read real design principles (with human titles), understand when checks run, and get install steps — without hunting the landing page or a separate README.
- **Done when:** Storybook sidebar has **Intro** ahead of specimens: Start here → Design principles → How we enforce → Get started; principles render from the live manifest; How we enforce matches the approved peer-facing copy; Get started covers install + CSS `@source`.
- **Not doing:** Redesigning the marketing landing; Figma Core library sync; renaming machine principle ids in the gate; Chromatic-only work; OpenSpec schema expansion beyond this change’s artifacts.

## Why

Landing is the marketing surface. Storybook is where technical readers and agents work — it should carry a clearer Intro than “open Foundations/Color.” The explore file already agreed the IA and copy; this change makes Storybook match it.

## What changes

- Storybook **Intro** group + `storySort` order.
- Intro pages composed with MVDS layout/site components.
- Principle records gain a peer-facing **title**; Storybook index shows human title before id (NN/g rows can show a display id with `nn##-` for sort/readability without changing machine ids).
- `docs/VERIFICATION.md` remains the agent-readable twin of How we enforce.

## Capabilities

### New Capabilities

- `storybook-intro`: Intro IA and pages in Storybook (Start here, Design principles index, How we enforce, Get started).

### Modified Capabilities

- (none promoted yet — first Storybook Intro capability)

## Impact

- Storybook sidebar and stories under test (`npm test`).
- Principle manifest + snapshot shape (`title` field).
- Site components + co-located stories (story-coverage-site).

## Optional links

- Explore Figma (approved design): https://www.figma.com/design/2XFLXbbmgwPrh6MGdMRdHF
- Twin doc: `docs/VERIFICATION.md`
- Consuming: `docs/CONSUMING.md`
- House rules: `AGENTS.md`
