# stepped-scales

## Human anchor

> "so what I'm thinking is that typography size, and perhaps even color gradations (1-5) are a design principle to add just like we think of spacing. You should be stepping between values on the ramp by default because its a systematic way of making the ui feel 'done' or 'organized' or 'trustworthy'. A brand could then define their own versions of it, but MVDS should be opinionated about it being there." — founder, during scoped-theming design review, 2026-08-21, after asking "but why are we deriving the ramp at all?"

## Outcomes

- **Who:** Agents and humans generating UI with MVDS (the stepping rule is what guides their choices); brands and presets authoring their color voice; the founder, whose design strategy this encodes as data.
- **Job:** Make "step on the scale" an encoded, enforceable principle for typography size and color gradation — the same shape as the 8-grid spacing principle — with a small, authored **1–5 gradation scale** per brand color family as the color scale's substance.
- **Done when:** The principles manifest carries two new records (step-on-type-ramp; step-on-color-gradations) with the same scope/severity/docs treatment as existing rules; the token layer defines gradation steps 1–5 for `primary` and `secondary` as **authored values** (light + dark, default brand) and the derived 50–950 ramps are **removed outright** (pre-1.0 clean break); a specimen story shows the gradation scale; the gates and mirrors (check:principles, check:contrast where pairings apply, manifest snapshot, Figma variables lock) cover the steps; `docs/THEMING.md` documents that a brand authors its own five values per family.
- **Not doing:** Scoped theming itself (`scoped-theming` remains its own change and now builds on this one); re-tinting the `gray-*` ladder (substrate for semantic tokens, untouched); the Phase-2 component migration off alpha tints (`bg-success/10` etc.) — this change lands the opaque substrate Phase 2 needs, not the component rewrites.

## Why

Asked why MVDS derives an 11-step ramp at runtime, the audit answer was: no component consumes a single ramp step — the only in-package consumer is the color specimen story, and outside it only decorative gradients. Meanwhile the runtime-derived values are invisible to every checker and mirror that parses the token layer, and the Phase-2 roadmap already called for a *reduced opaque* tint set rather than an 11-step ladder. The founder's redirect resolves all three at once: the ramp's value isn't the formula — it's the **discipline of stepping**, which belongs in the principles manifest alongside spacing and type, with a scale small enough (1–5) that every step earns its place and every value is authored, checked data. Brands supply the values; MVDS is opinionated that the structure exists and that UI steps on it.

## What changes

- Two principle records in `principles.config.mjs` (data, per the manifest spine): typography steps on the semantic ramp; color tints/shades step on the gradation scale. Enforcement level (machine vs guiding) decided in specs.
- `src/index.css`: authored `--primary-1…5` / `--secondary-1…5` (light + dark) replace the derived `--primary-50…950` / `--secondary-50…950`; the relative-color formulas are deleted from the shipped CSS (they may survive as an authoring aid script).
- Step semantics (what 1…5 mean, which steps are text-safe, how they pair) fixed in specs; specimen story added; gates and Figma lock updated.
- `AGENTS.md` golden rules and `docs/THEMING.md` rewritten where they describe the derived ramps.
- Breaking for `primary-*`/`secondary-*` utility consumers (the landing site's and Motion & Muse's gradients) — migrated to gradation steps; pre-1.0, no deprecation shims.

## Capabilities

### New Capabilities

- `color-gradations`: the authored 1–5 gradation token contract per brand color family, light + dark, replacing the derived 50–950 ramps.
- `scale-stepping-principles`: manifest-encoded stepping principles for typography size and color gradation, in the same record shape as the spacing rules.

### Modified Capabilities

- (none)

## Impact

- `src/index.css`, `principles.config.mjs`, foundations specimen stories, `scripts/check-contrast.mjs` / `generate-manifest-snapshot.mjs` / Figma manifest lock, `AGENTS.md`, `docs/THEMING.md`.
- `openspec/changes/scoped-theming/`: requirement 3 ("ramps re-derive in scope") is respecced against gradation steps once this change is approved — presets then author five values per family, static and gate-checked.
- Consumers: landing site + Motion & Muse gradient classes migrate.

## Optional links

- Origin: `openspec/changes/scoped-theming/` design review (Figma pages 01.0/02.0 record the superseded derived-ramp mechanisms — parked, not deleted)
- Phase-2 alignment: MVDS vision roadmap (reduced opaque tint set replacing alpha lightening)
- House rules: `AGENTS.md`
