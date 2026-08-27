# eval-rubric

## Purpose

The discovery eval's rubric as manifest data: `principles.config.mjs` records
carrying an `evalLens` are the rubric, with Nielsen's ten heuristics as the
first style — pluggable, founder-extensible, and consumable per-context,
without the machine-enforced gates changing at all.

## Outcomes

See [proposal.md](../../proposal.md) Outcomes — the rubric the eval judges
against is the founder's point of view encoded as data, with heuristic
evaluation as the first style, not the definition of the gate.

## Requirements

### Requirement: The rubric is manifest data

Every rubric item the eval applies comes from `principles.config.mjs` — the
same manifest that carries the machine-enforced golden rules — never from prose
hardcoded in a schema instruction, template, or skill.

**Fails until:** the 0.5 Eval instruction resolves its rubric from the manifest
rather than embedding a heuristics list.

The eval SHALL resolve its rubric entirely from records in
`principles.config.mjs`.

#### Scenario: Eval applies exactly what the manifest carries

- **WHEN** a 0.5 or 1.5 eval runs
- **THEN** every rubric item it applies traces to a manifest record by id, and
  removing a record from the manifest removes it from the next eval

### Requirement: Nielsen's ten are present with a surface-evaluation lens

The five Nielsen records already in the manifest gain an eval-facing lens
alongside their existing system-design reading (same record, two consumers),
and the five absent heuristics (2, 3, 7, 9, 10) are added.

**Fails until:** the manifest carries all ten Nielsen heuristics, each with a
surface-evaluation lens.

The manifest SHALL carry all ten Nielsen heuristics as records with a
surface-evaluation lens, leaving the existing system-design `rationale` /
`fix` text of the five current records unchanged.

#### Scenario: All ten heuristics evaluate a surface

- **WHEN** a 0.5 Eval runs with the default rubric
- **THEN** findings can cite any of Nielsen's ten heuristics, including the
  five not previously in the manifest

### Requirement: Rubric styles are pluggable

Heuristic evaluation is one style. A new rubric family — system-conformance
checks, founder-authored principles, a consumer's own rubric — plugs in as
manifest records without touching the schema or templates.

The eval SHALL treat rubric membership as a property of manifest records (not
of the schema), so adding a record changes the next eval without schema edits.

#### Scenario: A founder-added rubric item applies on the next eval

- **WHEN** the founder adds a new rubric record to the manifest
- **THEN** the next 0.5 or 1.5 eval applies it, with no change to
  `mvds-default` schema files or templates

### Requirement: Existing gates are unaffected

Adding eval lenses and five new guiding records changes nothing about the
machine-enforced gates — eval records stay judgment, not lint.

**Fails until:** `npm run check:principles` passes with output equivalent to
pre-change behavior after the manifest additions land.

The eval-lens additions SHALL introduce no new machine checks:
`check:principles`, `check:contrast`, and `npm test` behavior is unchanged by
this capability.

#### Scenario: Principles gate is byte-for-byte indifferent to eval lenses

- **WHEN** `npm run check:principles` runs after the manifest gains eval lenses
  and the five new records
- **THEN** it enforces exactly the same set of machine checks as before, and
  the new records report as guiding (non-machine-checked)
