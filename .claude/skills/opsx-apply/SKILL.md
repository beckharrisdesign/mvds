---
name: opsx-apply
description: Implement tasks from an approved OpenSpec change (the apply phase). Use for /opsx-apply, or when the founder asks to start implementing, continue implementation, or work through tasks.md.
model: sonnet
---

# /opsx-apply

Apply phase for an OpenSpec change. **Input:** optional change name — `$ARGUMENTS`.

**Single source of truth:** [`skills/openspec-apply-change.md`](../../../skills/openspec-apply-change.md).

1. Read that file and follow it completely, including **step 8** (commit, push,
   open or update the **draft** PR).
2. Read the change's own schema → `apply.instruction` for the MVDS-specific
   constraints — [`mvds-default`](../../../openspec/schemas/mvds-default/schema.yaml)
   by default, or [`experiment-hub-lite`](../../../openspec/schemas/experiment-hub-lite/schema.yaml)
   when the change's `.openspec.yaml` selects the archived mirror.
3. Do not improvise steps from this stub.

Shared output rules: [`skills/openspec-artifacts-output.md`](../../../skills/openspec-artifacts-output.md).

## Why this file exists

Two jobs, both about the *apply* phase specifically.

**1. It makes `/opsx-apply` a real command in Claude Code.** The nine workflow
skills under [`skills/`](../../../skills/) are symlinked into `.claude/skills/` as
flat `.md` files, and Claude Code does not discover those — it loads
`.claude/skills/<name>/SKILL.md` directories and `.claude/commands/<name>.md` flat
files, nothing else. The `/opsx:*` stubs in [`.cursor/commands/`](../../../.cursor/commands/)
are Cursor's entry points. This directory is the Claude Code half.

> **Naming difference:** Cursor invokes `/opsx:apply`; here it is `/opsx-apply`. A colon in
> the directory name would collide with the `plugin:skill` namespace syntax.

**2. It encodes the per-phase model policy.** Propose / specs / design are judgment
work — house-rules reasoning and the Figma design gate — and inherit whatever model
the founder has selected. Apply is mechanical execution against an already-approved
`tasks.md`, so `model: sonnet` above downshifts it. The policy only ever *lowers*
the model; the founder's `/model` choice still governs every other phase.

**Scope caveat — the override is turn-scoped.** Per the Claude Code skills
reference, a skill's `model` "applies for the rest of the current turn… the session
model resumes on your next prompt." It covers the long autonomous stretch right
after invocation, which is where the tokens go. If apply pauses for a question,
the turn after that answer runs on the session model again — re-type `/opsx-apply`
to re-pin it. No mechanism gives durable-across-turns *and* keeps conversation
context, and apply needs the conversation: step 8 writes a PR description that
quotes the founder's original intent in the founder's own framing.

`disable-model-invocation` was removed on founder direction (2026-08-26, during
`motion-muse-signup-flow`): the typed-command-only gate added friction without
protection the flow doesn't already have — apply still runs only against an
approved `tasks.md`, and the founder still triggers it explicitly (in words or
by `/opsx-apply`). It is never auto-loaded on inference: an unprompted "let's
implement" still routes through the propose loop's approvals first.
