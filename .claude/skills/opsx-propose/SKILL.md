---
name: opsx-propose
description: Create a new OpenSpec change and generate its artifacts one approval at a time (proposal → specs → design → tasks). Use for /opsx-propose, or when the founder asks to propose, scope, or spec out a change before implementation.
---

# /opsx-propose

Propose phase for an OpenSpec change. **Input:** kebab-case change name and/or what
to build — `$ARGUMENTS`.

**Single source of truth:** [`skills/openspec-propose.md`](../../../skills/openspec-propose.md).

1. Read that file and follow it completely, including the **lite schema gate**:
   a verbatim Human anchor before `proposal.md`, and **one artifact per turn** —
   write it, show it, stop for approval before the next.
2. The MVDS-specific constraints live in the schema's per-artifact `instruction`
   fields; `openspec instructions <artifact-id> --change "<name>" --json` surfaces
   them, and [`openspec/schemas/experiment-hub-lite/schema.yaml`](../../../openspec/schemas/experiment-hub-lite/schema.yaml)
   is the file behind that.
3. Do not improvise steps from this stub.

Shared output rules: [`skills/openspec-artifacts-output.md`](../../../skills/openspec-artifacts-output.md).

## Why this file exists

**It makes `/opsx-propose` a real command in Claude Code.** Claude Code discovers
`.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat
files — not the flat `skills/*.md` symlinks under `.claude/skills/`. Without this
directory the phase is reachable only by reading `skills/openspec-propose.md` by
path. Full explanation of the discovery gap, and of Cursor's `/opsx:propose` vs
this `/opsx-propose`: [`openspec/README.md`](../../../openspec/README.md).

**No `model:` field — deliberate.** Propose is the judgment half of the loop:
scoping capabilities, holding the founder's anchor honest, reasoning about
`AGENTS.md` house rules and the Figma design gate. It inherits whatever model the
founder has selected via `/model`. The per-phase policy only ever *downshifts*, and
only [`opsx-apply`](../opsx-apply/SKILL.md) is pinned (`model: sonnet`) — mechanical
execution against an already-approved `tasks.md`.

**Model invocation stays enabled.** Propose only adds files under
`openspec/changes/<name>/`, and its own gate stops it from running away: it cannot
write `proposal.md` without a verbatim founder quote, and it stops for approval
after every artifact. Routing "let's build X" into this workflow is what
[`rules/openspec-workflow.mdc`](../../../rules/openspec-workflow.mdc) wants, so
auto-loading is a feature here rather than a hazard.
