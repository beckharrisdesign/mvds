# Code ↔ Figma sync

**Code is law. Figma is a generated mirror.**

This repo is the source of truth. The Figma library is regenerated from the code,
not hand-maintained. On a Figma **Pro** plan this link is **one-way (code → Figma)**
and **re-runnable** — see [Why one-way](#why-one-way-the-pro-tier-reality) below.

```
  src/index.css  ─┐
  (token layer)   │
                  ├──►  /figma-generate-library  ──►  Figma file (Beck Harris Design)
  src/components/ │       (Figma MCP, Plugin API)        · variable collection (light/dark modes)
  ui/*.tsx       ─┘                                       · Button + Card components
        ▲
        └── Storybook renders the same files = live, reviewable gallery
```

## The loop

1. **Build / edit in code.**
   - Components: `src/components/ui/*.tsx` (add more with `npx shadcn@latest add <name>`).
   - Tokens: **only** in `src/index.css` (`@theme inline`, `:root` = light, `.dark` = dark).
2. **Verify in Storybook** — `npm run storybook`. Stories are co-located (`*.stories.tsx`)
   and are the canonical, diffable surface the Figma generation references.
3. **Sync to Figma (re-runnable).** Invoke the Figma plugin skill **`/figma-generate-library`**
   (it loads `/figma-use` first). Point it at a file in the *Beck Harris Design* team. It:
   - reads `src/index.css` + `src/components/ui/*`;
   - creates/updates the variable **collection + light/dark modes**, primitive→semantic
     aliases, scopes, and code-syntax bindings;
   - builds a Foundations page + Button (variants as component properties) + Card.
   - This step is **idempotent** — re-run after any token/component change; it reconciles
     rather than duplicating nodes.
4. **Inspect (read-only on Pro).** `get_variable_defs`, `get_design_context`, `get_screenshot`
   to confirm the Figma mirror matches the code.

## Why one-way: the Pro-tier reality

The user is on **Figma Pro**, not Organization/Enterprise. That gates the "obvious" sync paths:

| Capability | Needs | On Pro |
| --- | --- | --- |
| **Code Connect** (`*.figma.tsx` + Dev Mode code panel) | Org / Enterprise | ❌ unavailable (no roadmap to Pro) |
| **Variables REST *write* API** (`file_variables:write`) | Enterprise (Tier 3) | ❌ 403 |
| **Figma MCP Plugin-API writes** (`/figma-generate-library`, `use_figma`) | any plan | ✅ **this is our link** |
| Read/inspect (`get_variable_defs`, `get_screenshot`) | any plan | ✅ |
| Variable modes per collection | — | 10 max (Pro) — light+dark uses 2 |

So the MCP plugin flow **replaces** Code Connect as the strong link. Designer edits made
directly to Figma variables are **not** auto-pulled back to code — treat Figma as a
downstream artifact.

## Future-proofing (dormant on Pro)

`code-connect/button.figma.tsx` is authored but **inactive** — Code Connect can't publish
on Pro. If this team upgrades to Organization/Enterprise, run the Code Connect CLI to
activate it and Dev Mode will show real component code. Until then it's documentation.

## Quick commands

```bash
npm run dev              # app demo (Card + Button, light/dark toggle)
npm run storybook        # component gallery — the living design system
npm run build            # typecheck + production build
npm run build-storybook  # static Storybook
# then, in this agent:  /figma-generate-library   (the code → Figma push)
```
