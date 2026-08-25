# Capability: dropzone

> Canonical spec. Promoted from `openspec/changes/input-dropzone/` when that
> change was archived (2026-08-25, shipped in PR #85). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Outcomes

- **Who:** Anyone prototyping an upload screen on MVDS — the ELK-shaped products that today hand-roll a 30-line dropzone.
- **Job:** Accept files by drag, drop, paste, or picker, entirely on-system, and hand the selected files to the app.
- **Done when:** See proposal — `Dropzone` is exported with keyboard/SR accessibility, a selected-file affordance, and story coverage passing the light+dark gates.
- **Not doing:** Upload transport or progress (Dropzone ends at "files selected"); multi-step upload management UI; image previews/thumbnails.

## Requirements

### Requirement: One Dropzone accepts drag, drop, paste, and picker

A consumer can render a file-selection zone where dragging over shows an active treatment, dropping selects, pasting a file selects, and clicking (or keyboard-activating) opens the native picker — one component, no hand-rolled handlers.

**Fails until:** `import { Dropzone } from "@beckharrisdesign/mvds"` works and a single `<Dropzone onFilesSelected={…} />` handles all four capture paths, honoring `accept` / `multiple` / `disabled`.

#### Scenario: Files arrive through any of the four capture paths

- **WHEN** a user drops a file on the zone, pastes one while it has focus, or activates it to pick from the native dialog
- **THEN** `onFilesSelected` receives the files, the zone shows its selected state, and a `disabled` zone accepts none of the paths

### Requirement: Dropzone is keyboard and screen-reader accessible

The zone is a real button in the accessibility tree — focusable, Enter/Space opens the picker, `focus-visible` ring on keyboard focus — and selection changes are announced through a live status region.

**Fails until:** The zone is reachable by Tab with a visible focus ring, activates via keyboard, and an `aria-live` region announces "N file(s) selected" (with names) on every change.

#### Scenario: A keyboard/SR user selects a file and hears the result

- **WHEN** a keyboard user tabs to the Dropzone, activates it, and selects a file
- **THEN** the picker opened from the keyboard, and the live region announces the selection without focus moving away

### Requirement: Selected files are visible and removable

After selection the zone shows what it holds — file name and human-readable size per file — and each entry can be removed, firing the callback with the remaining set.

**Fails until:** Selecting files renders a per-file row (name + size) with a remove control; removing one calls `onFilesSelected` with the rest.

#### Scenario: Selected files are listed and can be removed

- **WHEN** a user has selected two files and removes one
- **THEN** the list shows the remaining file's name and size, and the app received the updated set

### Requirement: Dropzone states are story-covered and pass both-mode gates

Idle, dragging, selected, and disabled are enumerated in a co-located story that passes the a11y and contrast gates in light and dark.

**Fails until:** A dropzone story exists, enumerates idle / dragging / selected / disabled with an interaction test for the keyboard path, and `npm test` passes it in both modes.

#### Scenario: Dropzone story enumerates every state in both modes

- **WHEN** `npm test` runs the Dropzone story light and dark
- **THEN** every state renders, the keyboard interaction assertion passes, and axe reports no violations
