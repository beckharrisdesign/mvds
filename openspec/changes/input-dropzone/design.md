# input-dropzone — design

## Context

Proposal approved with the dogfood round (PR #81); specs written 2026-08-23.
Both dogfoods hit the same wall on their first screen — Motion & Muse shipped a
`mailto:` CTA because no email-capture form was possible, and the Etsy Listing
Kit hand-rolled a 30-line dropzone. This artifact fixes the component APIs, the
8-grid metrics, and where each file lives.

## Goals / Non-Goals

**Goals:**

- `Input` — shadcn-sourced, 8-grid tuned, with a `size` prop that mirrors
  Button's (`sm`/`default`/`lg` → 24/32/40) so inline forms align by
  construction.
- `Dropzone` — MVDS-authored file-selection pattern: drag / drop / paste /
  picker over a hidden `<input type="file">`, keyboard + SR accessible,
  selected-file affordance with remove.
- Both exported from the package, story-covered, passing every gate light+dark.

**Non-Goals:**

- Dialog, Tabs, Tooltip, Table, Toast, Spinner (dogfood asks 5–6 — later
  changes); validation/submission machinery; upload transport or progress;
  image previews/thumbnails.

## User flow / IA

Agent/consumer flow: email capture = `<Inline gap={8}><Input /><Button/></Inline>`
inside a `Field` when it needs label/help/error. Upload = `<Dropzone
onFilesSelected={fn} accept="image/*" multiple />`; Dropzone owns capture and
the selected list, the app owns everything after the files land.

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/u6SsvuFE4Q4oKwQ0d0M2KU (scratch: "MVDS explore: input-dropzone") |
| As-is page / frame    | `0.0 As is` — "Form capture as shipped": the control inventory with Input/Dropzone marked absent, the Field story's hand-rolled `<input>`, and the two consumer workarounds (mailto CTA, bespoke ELK dropzone — flagged as reference, external repos) |
| Proposed page / frames| `01.0 Propose: input-dropzone` — "Input — states & sizes" (light + dark): placeholder/filled/focus/invalid/disabled, three sizes each beside its Button twin, Field composition; "Dropzone — states" (light + dark): idle/dragging/selected/disabled; "The two dogfood walls, unblocked": email-capture and upload-screen compositions |
| Libraries / version   | Values mirror `src/index.css` (oklch→hex, reference); scratch file, not MVDS Core |
| Breakpoints           | Storybook canvas — both components are width-fluid controls (`w-full` inside their container); no S/L IA delta |
| Status                | approved 2026-08-23 — founder reviewed the HF (High Fidelity) pair after the layout revision: "It looks good - approve" |

## Decisions

1. **Input gets a `size` prop mirroring Button** (`sm` h-6/24 · `default`
   h-8/32 · `lg` h-10/40, cva like Button's). The #1 use is an input beside a
   button; sharing the size vocabulary makes the pair align by construction
   instead of by luck. Radius and type follow Button's steps per size
   (`rounded-lg`, sm on `rounded-[min(var(--radius-md),12px)]`; `text-small`,
   sm on `text-caption` — the ramp principle forbids a generic `text-xs`).
2. **On-grid metrics:** padding-x 8 (`px-2`) for sm/default, 16 (`px-4`) for
   lg — same replacement of shadcn's off-grid `px-3`(12)/`h-9`(36) the other
   controls got. Chrome (border, focus ring, invalid treatment) copies
   Textarea verbatim so the text controls read as one family.
3. **Dropzone lives in `src/components/forms/`** beside Field — it is an
   MVDS-authored capture pattern, not vendored shadcn (`ui/` stays
   CLI-sourced files only).
4. **Dropzone anatomy:** a real `<button>` (picker trigger + focus target +
   drag surface) wrapping label/hint slots, a visually-hidden
   `<input type="file">` driven programmatically, a paste handler scoped to
   the zone, a polite `aria-live` region announcing "N file(s) selected:
   names", and a selected-files list (name + formatted size + per-file remove
   button) rendered below the zone. State is internal; every change calls
   `onFilesSelected(files: File[])`. Props: `accept`, `multiple`, `disabled`,
   `label`, `hint`, `className`.
5. **Dropzone ends at "files selected."** No transport, no progress, no
   thumbnails — the hub's candidate doc nominated exactly the capture
   affordance, and everything past it is app logic.
6. **The Field story sheds its hand-rolled `<input>`** and composes the real
   Input — the as-is page's annotation ("every consumer re-rolls this box")
   stops being true in our own storybook first.
7. **README component inventory is corrected in this change** (it still says
   "Button, Card" — stale since Phase 2); the outsider-review usability pass
   rides the same PR for the docs it touches.

## Risks / Trade-offs

- **Drag/paste events are hard to exercise in headless CI** — the story's play
  test covers the keyboard/picker path and state rendering; drop/paste
  handlers stay thin wrappers over the same `addFiles` internal so the
  untested surface is minimal.
- **A `size` prop on Input diverges from pristine shadcn** (single height).
  Deliberate: MVDS tunes vendored internals already, and the Button-mirroring
  vocabulary is the point. Pre-1.0, no compat concern.
- **Five-state Figma boards are hand-mirrored hex**, not synced variables —
  acceptable for a scratch exploration; MVDS Core sync remains
  explicitly-on-request only.
