# discovery-eval

## Outcomes

See [proposal.md](../../proposal.md) Outcomes — the founder reviews the current
surface's evaluation *before* any proposal exists, and reviews every proposal
*comparatively* against that baseline.

## ADDED Requirements

### Requirement: Discovery is a real stage with its own artifact and stop

The loop no longer skates over discovery: a change produces `discovery.md`
(0.0 As-is → 0.5 Eval → 0.6 Eval Summary) that the founder approves before any
proposal is generated.

**Fails until:** `npx openspec status` for a change under `mvds-default` lists
a `discovery` artifact that requires `proposal` and is required by `design`.

The `mvds-default` schema SHALL define a `discovery` artifact (generates
`discovery.md`, requires `proposal`, required by `design`) with an absolute stop
rule after writing.

#### Scenario: Founder approves discovery before any proposal exists

- **WHEN** `discovery.md` is written for a change under `mvds-default`
- **THEN** the agent stops and waits for explicit founder approval before
  generating `design.md` or any `1.0 Propose` Figma page

### Requirement: 0.5 Eval produces structured findings, not scores

The evaluation of the as-is surface is a findings list the founder can audit —
scores appear only as summary color, never as the load-bearing output.

The 0.5 Eval SHALL record each finding as violation / rubric item / predicted
consequence / severity, produced by a subagent whose context contains only the
surface under evaluation and the rubric — never proposal rationale.

#### Scenario: Founder reads auditable findings from the as-is surface

- **WHEN** 0.5 Eval runs against the as-is surface (the running Storybook story
  where one exists; otherwise the `0.0 As is` Figma page)
- **THEN** `discovery.md` lists each finding with violation, rubric item,
  predicted consequence, and severity, with any per-rubric scores marked
  summary-only

#### Scenario: Eval runs blind to proposal rationale

- **WHEN** the eval subagent is launched (0.5 or 1.5)
- **THEN** its context contains only the surface and the manifest rubric — no
  proposal text, no design rationale, no prior eval conclusions

### Requirement: 0.6 Eval Summary conditions the proposal

The proposal doesn't merely satisfy the OpenSpec change — it explicitly answers
the prioritized findings, because the summary is generation input, not a report.

The 0.6 Eval Summary SHALL state top issues to fix, tradeoffs worth preserving,
and don't-breaks, and the 1.0 Proposal SHALL be generated with the approved
summary in its generation context.

#### Scenario: Proposal answers the approved eval summary

- **WHEN** the `1.0 Propose` page is generated after discovery approval
- **THEN** `design.md` records how each top issue from the Eval Summary is
  addressed, and no don't-break item is altered without an explicit callout

### Requirement: 1.5 Eval Delta reports a findings ledger, informationally

The founder's design review is comparative: what improved, what regressed, what
appeared — with the delta informing the checkpoint, never auto-blocking it.

**Fails until:** a change run under `mvds-default` produces a `design.md` whose
delta table dispositions every 0.5 finding.

The 1.5 Eval Delta SHALL re-run the same rubric against the proposal and
disposition every baseline finding as addressed / deliberately preserved /
regressed / new, without blocking approval on any score or disposition.

#### Scenario: Founder reviews the proposal as a delta against baseline

- **WHEN** the founder reviews `design.md` at the design checkpoint
- **THEN** the Eval Delta shows each 0.5 finding's disposition (addressed /
  deliberately preserved / regressed / new), and a regression is highlighted
  but does not block approval

#### Scenario: Iterations re-run only the delta

- **WHEN** a proposal iterates (`02.0 Propose:` and beyond)
- **THEN** the cached 0.5 baseline is reused and only the Eval Delta re-runs
  against the new page
