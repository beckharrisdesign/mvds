# Capability: input

> Canonical spec. Promoted from `openspec/changes/input-dropzone/` when that
> change was archived (2026-08-25, shipped in PR #85). Requirements describe the
> behaviour MVDS is held to now — edit them via a new OpenSpec change, not in
> place.

## Purpose

MVDS exports a single-line text `Input` — shadcn-sourced, tuned to the 8-grid, and sized to pair with `Button` — that composes with `Field` for label, description, and error. It is the on-system replacement for the hand-rolled `<input>` a prototype would otherwise reach for; validation and submission machinery stay with the app.

## Outcomes

- **Who:** Anyone prototyping on MVDS — the founder, agents, and package consumers building the first screen of an experiment.
- **Job:** Capture a line of text (email signup, search, a form field) with an on-system control instead of a hand-rolled `<input>`.
- **Done when:** See proposal — `Input` is exported from the package, shadcn-sourced and 8-grid tuned, composing with `Field`, with story coverage passing the light+dark gates.
- **Not doing:** Form validation or submission machinery; input masks; multi-line text (that is `Textarea`).

## Requirements

### Requirement: A single-line Input, 8-grid tuned, that pairs with Button

A consumer can render a single-line text input whose heights are the sanctioned 24/32/40 set — the same `sm` / `default` / `lg` steps as Button — so the #1 landing-page pattern (input beside a submit button) lines up without custom sizing.

**Fails until:** `import { Input } from "@beckharrisdesign/mvds"` works, and `<Inline gap={8}><Input /><Button>…</Button></Inline>` renders both controls at the same height at every size.

#### Scenario: Input renders on-grid at every size, beside a Button

- **WHEN** a consumer places `<Input size="sm" | default | "lg" />` next to the matching Button size in an `Inline`
- **THEN** each size pair shares one height (24 / 32 / 40) with on-grid padding, in light and dark

### Requirement: Input composes with Field

Dropping an `Input` into the existing `Field` scaffold wires label, help, error, and required automatically — no manual `htmlFor` / `aria-describedby` bookkeeping.

**Fails until:** `<Field label="Email" error="…"><Input /></Field>` gives the input a linked label, an `aria-describedby` support line, `aria-invalid`, and the invalid border/ring treatment.

#### Scenario: Field wires the Input's label, help, and error state

- **WHEN** an `Input` is the sole child of a `Field` with a label and an error
- **THEN** the rendered input is reachable by its label text, carries `aria-invalid`, is described by the error line, and shows the destructive border/ring

### Requirement: Input states are story-covered and pass both-mode gates

Every visible state of the control is enumerated in a co-located story that passes the a11y and contrast gates in light and dark.

**Fails until:** `src/components/ui/input.stories.tsx` exists, enumerates default / placeholder / filled / disabled / invalid / with-Field / sizes-beside-Button, and `npm test` passes it in both modes.

#### Scenario: Input story enumerates every state in both modes

- **WHEN** `npm test` runs the Input story light and dark
- **THEN** every state renders, the interaction assertions pass, and axe reports no violations
