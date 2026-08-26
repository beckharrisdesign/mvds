---
name: opsx-explore
description: Enter explore mode — a thinking partner for ideas, problems, and requirements, investigating without implementing. Use for /opsx-explore, or when the founder wants to think something through before or during a change.
---

# /opsx-explore

Explore phase for an OpenSpec change. **Input:** a topic or change name —
`$ARGUMENTS`.

**Single source of truth:** [`skills/openspec-explore.md`](../../../skills/openspec-explore.md).

1. Read that file and follow it completely, including the hard line it draws:
   explore mode **reads, searches, and investigates — it never implements.** If
   the founder asks for code, point them at `/opsx-propose` instead.
2. Explore has no schema phase of its own — it is a stance, not a workflow. If it
   does capture thinking as artifacts, those follow the default schema
   ([`openspec/config.yaml`](../../../openspec/config.yaml) → `experiment-hub-lite`)
   and the `/opsx-propose` gate applies.
3. Do not improvise steps from this stub.

Shared output rules: [`skills/openspec-artifacts-output.md`](../../../skills/openspec-artifacts-output.md).

## Why this file exists

**It makes `/opsx-explore` a real command in Claude Code.** Claude Code discovers
`.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat
files — not the flat `skills/*.md` symlinks under `.claude/skills/`. Without this
directory the phase is reachable only by reading `skills/openspec-explore.md` by
path. Full explanation of the discovery gap, and of Cursor's `/opsx:explore` vs
this `/opsx-explore`: [`openspec/README.md`](../../../openspec/README.md).

**No `model:` field — deliberate.** Explore is the most reasoning-heavy phase in
the loop; its entire output *is* the thinking. It inherits whatever model the
founder has selected via `/model`. The per-phase policy only ever *downshifts*, and
only [`opsx-apply`](../opsx-apply/SKILL.md) is pinned (`model: sonnet`) — mechanical
execution against an already-approved `tasks.md`.

**Model invocation stays enabled.** Explore is read-only by construction — the
skill forbids writing code — so the worst case of a wrong auto-load is a
conversational detour, not a bad edit. Reaching for it when the founder is clearly
thinking out loud is the point.
