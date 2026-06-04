# Vendored Figma MCP skills

The Figma code↔Figma sync ([`docs/SYNC.md`](../../docs/SYNC.md)) runs through skills
served by the Figma MCP server — `figma-use` (loaded before any `use_figma` write),
plus `figma-generate-library`, `figma-generate-design`, `figma-code-connect`.

## Two ways to get them

**Recommended — install the official plugin (global, not committed):**

```
claude plugin install figma@claude-plugins-official
```

Then restart Claude Code, run `/plugin` → **Installed** → `figma` → authenticate.
This bundles the MCP server *and* the skills as local Agent Skills, so they load in
every session (including git worktrees) without anything in this repo. Heads-up: it
adds its own `figma` MCP server, so remove any standalone Figma connector in `/mcp`
to avoid duplicate tools.

**Alternative — vendor them here (committed, team-shared):**

Use this only if you want the skills version-controlled so teammates/CI/worktrees
get them via `git` without each installing the plugin. The skill content is served
as an MCP resource and can't be dumped to disk non-interactively, so capture it once
from an interactive session:

1. In a normal (non-worktree) interactive Claude Code session in this repo, type
   `/figma-use` so the skill loads from its MCP resource (`skill://figma/figma-use/SKILL.md`).
   Repeat for each skill below.
2. Ask Claude to write the loaded skill content into the matching `SKILL.md` here
   (e.g. `.claude/skills/figma-use/SKILL.md`), preserving its frontmatter verbatim.
3. Commit.

Once a `SKILL.md` exists in a folder below, the `Skill` tool resolves that skill by
name in any session. Until then these folders hold only this placeholder.

## Skills to capture

| Folder | Resource URI | Purpose |
|---|---|---|
| `figma-use/` | `skill://figma/figma-use/SKILL.md` | Foundational — required before any `use_figma` write (frames, components, variables, layouts). |
| `figma-generate-library/` | `skill://figma/figma-generate-library/SKILL.md` | Generate/sync a design-system library (tokens, light/dark, components) from code → Figma. This is the one the pending Button/Card sync needs. |
| `figma-generate-design/` | `skill://figma/figma-generate-design/SKILL.md` | Translate an app page/layout into a Figma design. |
| `figma-code-connect/` | `skill://figma/figma-code-connect/SKILL.md` | Map Figma components to codebase components (dormant on Pro — see SYNC.md). |
