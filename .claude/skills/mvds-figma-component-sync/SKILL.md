---
name: mvds-figma-component-sync
description: Push MVDS UI components from code into working Figma component sets in MVDS Core — variant axes mirroring the code API, auto-layout mirroring the component tree, every property bound to the right Figma variable or text style. Use ONLY when the user explicitly asks to sync/push components to Figma — never proactively, never per-commit.
---

# MVDS → Figma component sync

Code is the source of truth; Figma ("MVDS Core") is a one-way mirror, updated
**only on explicit request**. This skill encodes the repeatable procedure for the
COMPONENT half of the mirror (tokens are `mvds-figma-token-sync`). The goal is a
Figma component the founder can design with as the best available reflection of
code reality: same variant axes, same layer structure, every fill/spacing/text
property bound to the token variables — never baked-in values.

**Prerequisites (in order):**
1. Load the `figma-use` skill — mandatory before any `use_figma` call.
2. `npm run check:figma` must pass — the manifests are the spec; if they have
   drifted from code, STOP and fix the manifest first (never sync a stale spec).
3. Tokens must be current — components bind to `Tokens`/`Scales` variables and
   `Type/*` styles. Spot-check 2–3 variables (see `mvds-figma-token-sync`); run
   that skill first if drifted.
4. Typography must be recorded — `figma/figma.lock.json` needs its `typography`
   block and `npm run check:figma` must show **no typography warnings/errors**
   (T6/T7). If absent or drifted, run `mvds-figma-token-sync` first: text
   bindings below take style IDs from `lock.typography.textStyles`.

## Target & spec

- **fileKey:** `C20nU0mROzk3Zr0I9BELJF` ("MVDS Core"), page `Components`.
- **Spec:** `figma/components.config.mjs` → per-component manifests
  (`figma/components/*.figma.mjs`). Manifests declare structure + exceptions;
  every mechanical mapping rule (utility → variable/style, naming, states) is in
  `figma/conventions.mjs` — follow it exactly, don't invent conventions.
- **Node identity:** `figma/figma.lock.json` records componentSetIds + variant
  node IDs from previous runs. Identity is sacred — instances in the founder's
  experiment files point at these nodes.

## Review model: publish is the merge gate

Figma branching needs Org/Enterprise; on Pro the equivalent is the library
publish flow. The sync therefore:
1. updates component sets **in place** (instances downstream survive),
2. writes a **Sync Report** (see below) describing every change,
3. **never publishes** — the founder reviews the report and clicks
   **Publish library** in Figma, pasting the report as the version description.
   Consuming files then accept the update per-file via Figma's standard
   library-update prompt. That click is the founder's merge approval — treat an
   unpublished sync as an open PR, not a landed change.

(If the team upgrades to Org/Enterprise: create a branch of MVDS Core in the UI,
run this same procedure against the branch, and the Sync Report becomes the
branch-review description. Nothing else changes.)

## Procedure

1. **Load `figma-use`**, run the prerequisite checks above.
2. **Inspect (read-only).** Read `figma/figma.lock.json`; for each component
   resolve `componentSetId` (`getNodeByIdAsync`). On miss (null/moved/renamed),
   search the `Components` page by name and **adopt** the existing node —
   including the originally generated Button/Card sets — repairing the lock.
   Never rebuild a set that can be adopted: rebuilding breaks every downstream
   instance. Dump each set's variant names, child structure, bound variables.
3. **Diff.** Compare manifest → Figma reality per component: missing variants,
   renamed property values, changed bindings, structural drift, removed options.
   Print the diff before writing anything — it is the Sync Report skeleton.
   Prefer **rename in place** over delete+recreate; deletions are last resort
   and must be called out loudly in the report.
4. **Write (chunked — ≤ ~12 nodes per `use_figma` call).**
   - **Probe first:** before fanning out, verify ONE binding of each kind on a
     single node (color paint, tint paint w/ opacity, padding, itemSpacing,
     width/height, cornerRadius, text style) and re-read it. Where the plugin
     API won't bind (some node/property combos), fall back to the raw value —
     the manifest encodes the number — and note it in the report.
   - **New set:** build one fully-bound base component, loop-clone it, apply
     `perOption` deltas, name each child `variant=…, size=…, state=…`, then
     `figma.combineAsVariants(nodes, page)`. Set the property order to match
     the manifest's axis order.
   - **Existing set:** `clone()` a sibling and `appendChild` for new variants;
     rename for renames; re-bind only what the diff flagged.
   - **Bindings:** colors via paint literals — `{ type: "SOLID", color:
     <lightModeValue>, boundVariables: { color: { type: "VARIABLE_ALIAS", id } } }`
     with the static color set to the variable's light-mode value, so the paint
     renders correctly even where live resolution lags. Tints bind the DERIVED
     `{token}-tint` variable (alpha-in-value per mode — see
     `figma/conventions.mjs`); NEVER paint-level opacity, which Figma drops when
     instances re-resolve modes (verified 2026-06-09). Spacing,
     size, and radius bind one field per `node.setBoundVariable` call —
     concretely: `paddingX` → `setBoundVariable("paddingLeft", space16)` and
     `setBoundVariable("paddingRight", space16)`; `gap` →
     `setBoundVariable("itemSpacing", space8)`; `height` →
     `setBoundVariable("height", space32)`; `cornerRadius` → one call per
     corner (`"topLeftRadius"`, `"topRightRadius"`, `"bottomLeftRadius"`,
     `"bottomRightRadius"`). Text styles via `setTextStyleIdAsync`
     using the IDs recorded in `lock.typography.textStyles`; first `await
     loadFontAsync` for **every** face in
     `conventions.typography.weightToFigmaStyle` (family
     `conventions.typography.fontFamily.figma` — style names from the map,
     never from memory: Inter has a space, `Semi Bold`). Manifest `fontWeight`
     overrides set `fontName` to the **mapped Figma style** (500 → `Medium`),
     never a numeric weight.
   - **Disabled state:** variant-frame `opacity = 0.5` — nothing else changes.
   - **Nested instances** (Card → Button): look up the donor variant via the
     lock (or the set's child by variant name) and `createInstance()` into the
     declared child slot.
5. **Sync Report.** A dated frame on a `Sync Reports` page in MVDS Core AND the
   same content as markdown in chat: repo commit SHA, per-component
   added/renamed/rebound/removed/raw-fallback lists. Tell the founder explicitly:
   review, then **Publish library** with this text as the version description.
6. **Validate.**
   - Re-read each set: variant count = product of non-skipped axis options
     (today: Button 72, Badge 6, Card 2); spot-check tricky bindings — the
     destructive/success tint variables, Button sm radius cap, Card Footer's
     nested instance. Validate dark mode on a temp frame of INSTANCES with
     `setExplicitVariableModeForCollection` (instances are where mode-resolution
     bugs like dropped paint opacity show up), then remove the temp frame.
   - `get_screenshot` of each set; compare against the matching Storybook story
     (`npm run storybook`) in **both modes** — switch the page/frame to the
     `Tokens` collection's Dark mode; correct dark rendering proves bindings,
     not baked colors.
7. **Record.** Update `figma/figma.lock.json` with every componentSetId +
   variant node ID and `syncedAt`; commit it on a `chore/figma-lock-…` branch
   per the standard PR workflow (plus any manifest corrections the run
   surfaced).

## Out of scope

- **No Code Connect** — not used, not planned. Do not add or suggest it.
- Hover/focus/active states — code-only (see `figma/conventions.mjs`).
- Publishing the library — always the founder's click, never the agent's.
- The hand-built specimen boards and swatch frames — only touch if asked.
- Layout primitives (Stack/Inline/Grid) — they map to auto-layout settings,
  not components; don't mirror them as component sets.
