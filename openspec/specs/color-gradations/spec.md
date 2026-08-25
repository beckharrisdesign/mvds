# Capability: color-gradations

> Canonical spec. Promoted from `openspec/changes/stepped-scales/` when that
> change was archived (2026-08-25, shipped in PR #82). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Outcomes

- **Who:** Agents and humans applying tints/shades of brand colors; brands authoring their color voice; the checkers and mirrors that keep tokens honest.
- **Job:** Replace the derived 50–950 ramps with a small, authored, checked gradation scale — five steps per brand family that UI steps between by default.
- **Done when:** See proposal — `primary-1…5` / `secondary-1…5` authored (light + dark), 50–950 removed, specimen + gates + mirrors cover the steps.
- **Not doing:** Gray ladder changes; status-triad (`success`/`destructive`/`neutral`) gradations; Phase-2 component de-alpha migration.

## Requirements

### Requirement: Five authored gradation steps per brand family

Each brand color family (`primary`, `secondary`) carries exactly five authored gradation tokens, 1–5, where **1 is the faintest tint against the mode's background and 5 the strongest** — each step carries a light and a dark value (usage does not flip with the mode; the step's *meaning* is mode-relative). The derived `50…950` ramps and their relative-color formulas are removed from the shipped CSS.

**Fails until:** `bg-primary-2` / `text-primary-5` (and `secondary` peers) resolve to authored values in both modes, and `primary-500`-style classes no longer exist.

#### Scenario: Gradation steps render authored values in both modes

- **WHEN** a consumer uses a gradation utility such as `bg-primary-2` or `text-primary-5` in light and in dark mode
- **THEN** it renders that step's authored value for the mode, and no `50…950` ramp utility is generated at all

### Requirement: Text-safe steps are contract, not convention

Steps have declared roles: **1–2 are tint surfaces** (washes, chip/badge backgrounds — `--foreground` must be readable on them), **3 is decorative** (borders, gradients — no text contract, like `muted`'s carve-out), **4–5 are text-safe** (readable as text on `background` and `card`). The contrast gate owns these pairings in both modes.

**Fails until:** `npm run check:contrast` validates `foreground` on steps 1–2, and steps 4–5 as text on `background`/`card`, at WCAG AA in light and dark, failing the gate on any miss.

#### Scenario: Contrast gate owns the gradation pairings

- **WHEN** `npm run check:contrast` runs against a step value that breaks its role's AA pairing (e.g. a too-light `primary-4` as text on `background`)
- **THEN** the gate fails naming the step and the pairing, in the mode that failed

### Requirement: The scale is a checked specimen and a mirrored token set

The gradation scale renders as a foundations specimen story driven by the real tokens (5 steps × 2 families, both modes, roles annotated), and the steps flow through the manifest snapshot and the Figma variables lock as authored variables (library sync itself still only on explicit request).

**Fails until:** The specimen story exists and passes the story gates, and the snapshot/Figma manifest list the gradation tokens instead of the removed ramps.

#### Scenario: Specimen and mirrors show the authored steps

- **WHEN** the foundations specimen is opened (light and dark) and the manifest snapshot is regenerated
- **THEN** both show the five authored steps per family with their roles, and no 50–950 entries remain
