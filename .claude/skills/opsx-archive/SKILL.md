---
name: opsx-archive
description: Archive a completed OpenSpec change after its PR has merged — reconcile delta specs into openspec/specs/ and move the change into changes/archive/. Use for /opsx-archive.
disable-model-invocation: true
---

# /opsx-archive

Archive phase for an OpenSpec change. **Input:** optional change name —
`$ARGUMENTS`.

**Single source of truth:** [`skills/openspec-archive-change.md`](../../../skills/openspec-archive-change.md).

1. Read that file and follow it completely, including its confirmation gates:
   never auto-select a change, warn on incomplete artifacts/tasks, and prompt
   before syncing delta specs.
2. Archive has no schema phase of its own — it runs after apply, driven by the
   `openspec` CLI. The specs it reconciles into
   [`openspec/specs/`](../../../openspec/specs/) must keep the `## Purpose` section
   the validator requires, or `openspec archive` aborts.
3. Do not improvise steps from this stub.

Shared output rules: [`skills/openspec-artifacts-output.md`](../../../skills/openspec-artifacts-output.md).

## Why this file exists

**It makes `/opsx-archive` a real command in Claude Code.** Claude Code discovers
`.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat
files — not the flat `skills/*.md` symlinks under `.claude/skills/`. Without this
directory the phase is reachable only by reading
`skills/openspec-archive-change.md` by path. Full explanation of the discovery gap,
and of Cursor's `/opsx:archive` vs this `/opsx-archive`:
[`openspec/README.md`](../../../openspec/README.md).

**No `model:` field — deliberate.** Archive *looks* mechanical, but its one
substantial step is not: reconciling each delta spec against the promoted spec in
`openspec/specs/` — adds, modifications, removals, renames — is judgment, and
getting it wrong corrupts the capability record the whole repo reads from. It also
runs once per change, so a downshift would save nothing worth the risk. It inherits
whatever model the founder has selected via `/model`. The per-phase policy only ever
*downshifts*, and only [`opsx-apply`](../opsx-apply/SKILL.md) is pinned
(`model: sonnet`) — high-volume mechanical execution against an approved `tasks.md`.

**`disable-model-invocation: true` is deliberate.** Archive `mv`s a change
directory and rewrites promoted specs, and it is only ever correct *after* the
founder has merged the PR — a fact no description can teach the model to check. So
it is founder-triggered only, never auto-loaded. This matches
[`opsx-apply`](../opsx-apply/SKILL.md), the other side-effectful phase;
`/opsx-propose` and `/opsx-explore` stay auto-loadable because they only add files
or only read.
