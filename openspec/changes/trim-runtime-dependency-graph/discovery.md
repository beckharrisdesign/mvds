# trim-runtime-dependency-graph — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | **N/A — no surface.** No story changes; none is the eval target |
| Figma `0.0 As is` page | **N/A — no surface.** No HF capture; nothing visual is under evaluation |
| Scope note | `package.json` dependency placement, `src/index.css:16`, seven `src/components/ui/*.tsx` import lines, `tsup.config.ts` externals, one new `scripts/check-deps.mjs`, one CI job |

**N/A — no surface.** This change moves where code is resolved from, not what it
renders. It removes `shadcn` from `dependencies` by vendoring 95 lines of static
CSS, swaps the `radix-ui` umbrella import for the six scoped primitive packages
already in use, and adds a dependency-count gate. The vendored declarations are
copied byte-for-byte and the six Radix primitives are the same modules the
umbrella re-exports, so no component gains, loses, or alters a rendered element,
token, class, or state.

This clears the gate's stated bar — *"if the change renders anything a user sees,
it is not API-only."* Nothing a user sees is rendered differently; what changes is
the shape of a consumer's `node_modules`, from 385 transitive packages to 54.

**Rubric check (why N/A rather than a thin eval).** The rubric resolves from the
eleven `principles.config.mjs` records carrying an `evalLens` — the ten Nielsen
heuristics plus `no-runts`. Every one is phrased as a question about a rendered
surface (`visibility-of-system-status`, `error-recovery`, `aesthetic-and-minimalist-design`,
and so on). With no surface delta, each lens would return the identical verdict
before and after, which is a null finding rather than a weak one. Running the
isolated subagent here would spend a context to restate the current Storybook
baseline and produce a ledger whose every row is "unchanged."

**Where this judgment could be wrong, and what catches it.** The N/A rests on the
vendoring being faithful. An incomplete copy — a dropped `@custom-variant`, a
mistyped keyframe — would silently change rendering, and that is precisely the
failure this stage would otherwise be positioned to notice. That risk is carried
instead by `self-contained-styles` requirement 3 ("Rendered output is
byte-for-byte unchanged"), whose scenario runs `build`, `check:contrast`,
`check:principles`, and `npm test` in light and dark, with Storybook's
visual-regression coverage as the proof. That is a stronger check than a
heuristic read of a screenshot: it compares every story in both modes mechanically
rather than asking an evaluator to spot a missing hover variant by eye.

If the design stage finds a reason the surface does move after all, the correct
response is to reopen this stage and run the real 0.5 pass, not to lean on the
gates alone.

## Eval (0.5)

Empty — N/A path. No baseline to cache, so design `1.5 Eval Delta` has no
reference pass and is likewise N/A.

## Eval Summary (0.6)

Empty — N/A path. Nothing conditions design here; `design.md` is generated against
the approved proposal and specs.

For the record, the non-negotiables this change is answerable to live in the
specs rather than in an eval summary:

- **Don't-break:** rendered output in light and dark, the `styles.css` /
  `tokens.css` / `themes/*` export contracts, and the `npx shadcn add`-then-tune
  authoring workflow (`components.json` stays valid).
- **Tradeoff worth preserving:** vendoring buys a 78% smaller graph at the cost of
  a copy that can go stale. Provenance header plus a drift check is the accepted
  price, matching how `.upstream/` and `src/components/ui/` already carry vendored
  material.

## Status

ready for founder review
