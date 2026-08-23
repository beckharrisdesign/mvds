# input-dropzone — tasks

## 1. User outcomes (from spec scenarios)

- [x] 1.1 Input renders on-grid at every size, beside a Button — sm/default/lg share heights 24/32/40 with the Button twin, light and dark
- [x] 1.2 Field wires the Input's label, help, and error state — label reaches the input, `aria-invalid` + destructive treatment on error, no manual wiring
- [x] 1.3 Input story enumerates every state in both modes — default/placeholder/filled/disabled/invalid/with-Field/sizes-beside-Button pass `npm test` light + dark
- [x] 1.4 Files arrive through any of the four capture paths — drop, paste, picker (click or keyboard) all land in `onFilesSelected`; `disabled` blocks all four
- [x] 1.5 A keyboard/SR user selects a file and hears the result — Tab reaches the zone, Enter/Space opens the picker, aria-live announces the selection
- [x] 1.6 Selected files are listed and can be removed — name + size per file, remove fires the callback with the remaining set
- [x] 1.7 Dropzone story enumerates every state in both modes — idle/dragging/selected/disabled plus the keyboard interaction test pass `npm test` light + dark

## 2. Preview (Storybook)

- [x] 2.1 `UI/Input` and `UI/Dropzone` stories visible with every variant/state enumerated; exercised light + dark via the toolbar; `npm run storybook`

## 3. Implementation

- [x] 3.1 `npx shadcn@latest add input`, then the MVDS tuning pass: cva `size` prop (sm h-6 · default h-8 · lg h-10), on-grid padding (px-2 / px-2 / px-4), Textarea-matching chrome; radius + type per Button's size steps (design.md decision 1–2)
- [x] 3.2 `src/components/forms/dropzone.tsx` — MVDS-authored per design.md decision 4: button-as-zone, hidden file input, drag/paste handlers over one `addFiles` internal, polite aria-live region, selected list (name + formatted size + remove), props `accept`/`multiple`/`disabled`/`label`/`hint`
- [x] 3.3 Exports: `Input` from `src/index.ts`; `Dropzone` from `src/components/forms` barrel + `src/index.ts`
- [x] 3.4 Stories: `input.stories.tsx` (states, sizes-beside-Button, Field composition, a11y play test), `dropzone.stories.tsx` (idle/dragging/selected/disabled, keyboard play test)
- [x] 3.5 Field story composes the real `Input` instead of the hand-rolled `<input>` (design.md decision 6)
- [x] 3.6 Docs: README component inventory corrected (Phase-2 controls + Input + Dropzone; stale "Button, Card" list replaced)

## 4. QA

- [ ] 4.1 Manual walkthrough of the Outcomes: email-capture row (Input + Button in an Inline) and an upload zone in Storybook, both modes
- [x] 4.2 `npm run build` && `npm run check:contrast` && `npm run check:principles` && `npm test` — all green, light + dark
