# themeable-typography — tasks

## 1. User outcomes (from spec scenarios)

- [ ] 1.1 Headings follow one face override — a plain-CSS `--font-heading` override restyles every display/h1–h4; body steps stay on `--font-sans`
- [ ] 1.2 A scoped brand carries its own heading face — a `data-brand` block's `--font-heading` applies inside the wrapper only
- [ ] 1.3 A step size adjusts from the consumer's stylesheet — one `--text-<step>-size` override resizes every use of that step, leading riding along
- [ ] 1.4 Override story proves the seams — computed face and size change through the tokens; body face and untouched steps stay default (light + dark)
- [ ] 1.5 Default render is pixel-identical — no overrides → every story renders exactly as before; provenance recorded at the tokens
- [ ] 1.6 Theming docs carry the type-voice recipe — plain-CSS recipes for faces and sizes (app-wide + scoped) and the shape/skin boundary, discoverable without reading source

## 2. Preview (Storybook)

- [ ] 2.1 Type specimen names the two face slots and the runtime size tokens; new override story under Foundations exercises both seams; `npm run storybook`

## 3. Implementation

- [ ] 3.1 **First:** verify design decision 3's shared-name wiring (`@theme inline --font-sans: var(--font-sans)` with `:root --font-sans`) in a build; fall back to `--face-sans`/`--face-heading` runtime names if the inliner chokes — before anything else builds on the naming
- [ ] 3.2 `src/index.css`: per-step `--text-<step>-size` tokens + both face tokens declared in `:root`; `@theme inline` text/font values become `var()` references; `:where(.text-display, .text-h1, .text-h2, .text-h3, .text-h4) { font-family: var(--font-heading) }` base rule; authored-default provenance comment on the scale
- [ ] 3.3 `scripts/generate-manifest-snapshot.mjs`: extend the mode-invariant carve-out to the type tokens (faces + step sizes are declared once in `:root` by design — dimensions/faces, not per-mode color)
- [ ] 3.4 `docs/THEMING.md`: "Recipe: type voice" (face swap app-wide, serif headings, step-size adjust, scoped per `data-brand`) replacing the build-time `@theme` font recipe; shape/skin boundary added to "what NOT to override"
- [ ] 3.5 Override story per §2 with play assertions covering scenarios 1.1–1.4 (inline `style` sets `--font-heading` + one step-size token on a wrapper)
- [ ] 3.6 Type specimen updated (slots + tokens named); snapshot regenerated

## 4. QA

- [ ] 4.1 Manual walkthrough of the Outcomes in Storybook, both modes; recipe followed verbatim from THEMING.md in a scratch consumer check
- [ ] 4.2 `npm run build` && `npm run check:contrast` && `npm run check:principles` && `npm test` — all green, light + dark
- [ ] 4.3 Chromatic: **zero diffs on every existing story** (the tripwire); only the new override story adds snapshots
- [ ] 4.4 Post-release follow-up (recorded, not gated here): Motion & Muse drops its eight `font-heading` classes and its `@theme` override for a plain `:root` one
