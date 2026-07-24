# Figma exports

Checked-in, versioned previews of the **MVDS Figma mirror** (`fileKey
C20nU0mROzk3Zr0I9BELJF`). The landing page renders these inline so a shared-link
visitor sees the code→Figma parity **without needing access to the live file** —
the file itself is private, so a raw link to it 403s for anyone outside the team.

Code is the single source of truth; Figma is a generated, one-way mirror (see
[`../../docs/SYNC.md`](../../docs/SYNC.md)). These images are a snapshot of that
mirror, not a source — treat them the same way you treat `figma.lock.json`:
regenerate after a sync, never hand-edit.

## Files

| File | Figma page | Node |
| --- | --- | --- |
| `mvds-components.png` | Components | `292:4` (the composed component-set board) |
| `mvds-foundations.png` | Foundations & Starters | `0:1` |
| `exports.json` | metadata the snapshot generator reads (fileKey, capture date, per-page node ids) | — |

## Regenerate (PNG previews)

```bash
npm run export:figma
```

`scripts/export-figma.mjs` pulls each page from the live file via the Figma MCP,
writes the PNGs here, and stamps `exports.json`. Run it after a code→Figma sync
so the checked-in previews match what the mirror now shows. It needs the Figma
MCP available in the session (same connection the sync skills use).

## The editable `.fig` (optional, manual)

Figma's **Pro** tier has no API to export the native `.fig`, so that step cannot
be automated — it is a manual **File → Save local copy** in the Figma desktop
app. If you want the editable source versioned alongside these previews, drop it
in here as `mvds.fig` and commit it. The landing page links to the PNG previews
(which browsers can display); the `.fig` is a download-only binary for opening in
Figma, not for viewing on the page.
