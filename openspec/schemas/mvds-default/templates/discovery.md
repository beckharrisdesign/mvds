# <change> — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | `<Title/Story>` — or "none; Figma page is the eval target" |
| Figma `0.0 As is` page | URL + frame names (HF file, Core variables imported by key — `rules/figma.mdc`) |
| Scope note | what part of the surface this change touches |

## Eval (0.5)

> Produced by an isolated subagent (surface + rubric only — no proposal
> rationale). Rubric = every `principles.config.mjs` record with an `evalLens`.
> Scores are summary color only; the findings are the artifact. This baseline
> is cached — proposal iterations re-run only the Delta (1.5).

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | | | | |

**Figma `0.5 Eval` page:** URL + frame/board names (pinned duplicates of the
as-is frames + summary boards — annotation layer over bound frames,
`rules/figma.mdc` stage model; markdown above stays canonical)

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

**Top issues to fix:**

**Tradeoffs worth preserving:**

**Don't-breaks:**

## Status

draft / ready for founder review

> **N/A path (genuinely no-UI change):** one line — "N/A — no surface" + brief
> rationale; leave 0.5/0.6 empty. Same bar as the design gate's N/A: if the
> change renders anything a user sees, it is not API-only.
