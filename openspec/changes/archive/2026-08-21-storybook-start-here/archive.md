**Archived:** 2026-08-21 · **Created:** 2026-07-30 · **Tasks:** 12/12
**Outcome:** SHIPPED

Storybook now opens on **Intro** — Start here → Design principles → How we
enforce → Get started — ahead of Foundations, with principles rendered from the
live manifest rather than static cards. Shipped in
[PR #75](https://github.com/beckharrisdesign/mvds/pull/75) (`fe5ee00`, 56 files);
founder walkthrough of task 4.1 approved 2026-08-21, which is what unblocked this
archive. Evidence: `storySort` order in
[`.storybook/preview.tsx:49`](../../../.storybook/preview.tsx), the four
`Intro/*` stories under
[`src/components/site/`](../../../src/components/site), and the promoted
capability at
[`openspec/specs/storybook-intro/spec.md`](../../specs/storybook-intro/spec.md).

This was the first change to run MVDS's OpenSpec loop end to end, so it also
proved the loop itself: propose → design (explore Figma) → tasks → apply →
archive. Two things that only surface by walking it — the change sat unarchived
for three weeks after merge, and `openspec/specs/` stayed empty until now, so the
promotion step needed doing by hand.

**Left open:** nothing for this change. The related follow-up is that
`src/components/site/how-we-enforce.tsx` does not yet mention the schema-currency
check added in [PR #76](https://github.com/beckharrisdesign/mvds/pull/76) — a UI
change, so it needs an as-is + proposed Figma pair under the gate that PR made
non-skippable. That belongs to a new change, not this one.
