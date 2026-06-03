# src/components/ui — shadcn/ui, MVDS-tuned

These start from the shadcn CLI but are **tuned to the 8-grid** (not pristine
shadcn). The only sanctioned hand-edit is **bringing internal spacing onto the
8-grid** — heights 24/32/40, padding/gap from the 8-grid set; never `px-2.5`(10),
`h-7`(28), `gap-1.5`(6), or `-3`(12px) values. Icon glyph sizes and border-radius
are dimensions, not spacing — leave them.

- Add a component: `npx shadcn@latest add <name>` (from repo root), **then re-tune
  its off-grid internals** — the CLI emits shadcn's defaults, which are off-grid.
- Other tweaks: prefer wrapping/composing in your own component, or adjust the
  **token layer** (`src/index.css`) so the change flows through everything.
- Theming + spacing rules: see [AGENTS.md](../../../AGENTS.md).
