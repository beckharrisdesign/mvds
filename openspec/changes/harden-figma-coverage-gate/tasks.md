# harden-figma-coverage-gate — tasks

## 1. User outcomes (from spec scenarios)

- [ ] 1.1 **Walk the mirrorable scope** — `npm run check:figma` reports a
      classified count equal to the component files found under the mirrorable
      scope (25 today: `ui/`, `forms/`, `blocks/`, `layout/`, stories excluded by
      glob), not the length of `componentManifests`.
- [ ] 1.2 **A new component lands unclassified** — adding a component file with
      neither a manifest nor an exclusion record exits non-zero, names the file,
      and prints both ways to resolve it.
- [ ] 1.3 **An excluded component changes shape** — editing an excluded
      component's public props exits non-zero, names the component, and shows
      the recorded fingerprint against the recomputed one.
- [ ] 1.4 **The lock holds an undeclared component** — an entry in
      `lock.components` that no manifest declares exits non-zero and is named,
      whether it is a variant set **or** a single component with a null
      `componentSetId`.
- [ ] 1.5 **Declared coverage matches the lock** — the gate reports 19 mirrored
      and 6 excluded, 25 classified, with the lock reconciliation clean.

## 2. Preview (Storybook)

- [ ] 2.1 `Site/ElementsOfMvds` renders the revised Figma card in all three
      stories (`Collapsed`, `Expanded`, `LiveSnapshot`); `npm run storybook`.
- [ ] 2.2 The revised tally and description match `02.0 Propose:
      harden-figma-coverage-gate update` (`92:2`) at both L 1024 and S 480.

## 3. Implementation

> Sequencing note: 3.1–3.4 land the gate, which **fails** until 3.5 authors the
> two manifests. Do not commit between 3.4 and 3.5 — the failing state is real
> but must never be the committed state of the branch.

- [ ] 3.1 Add `mirrorScope` (include/exclude globs) and `notMirrored` records to
      `figma/components.config.mjs`, each record carrying `file`, `reason`, and
      a `props` fingerprint. Six records: `container`, `grid`, `grid-item`,
      `inline`, `spacer`, `stack`. Mirror the `principles.config.mjs`
      include/exclude + carve-out shape per AGENTS.md — rules as data.
- [ ] 3.2 Add the **coverage pass** to `scripts/check-figma-manifest.mjs`: walk
      `mirrorScope`, join each file to a manifest via the existing `code.file`,
      error on any file that is neither manifested nor carried by a `notMirrored`
      record. Three states, no fourth.
- [ ] 3.3 Add the **fingerprint recompute**: derive each excluded component's
      public prop signature from source and error on mismatch against the
      recorded `props`. Reuse the existing `prop-union` extraction rather than
      writing a second parser.
- [ ] 3.4 Add the **lock reconciliation**: iterate `lock.components` entry-wise —
      never keyed on `componentSetId`, so `Label` / `Textarea` / `Blockquote`
      (singletons, `componentId` + null `componentSetId`) are covered. Error on
      lock-without-manifest; warn on manifest-without-lock.
- [ ] 3.5 Author `figma/components/input.figma.mjs` (axis `size`:
      `sm`/`default`/`lg`) and `dropzone.figma.mjs` (axis `state`:
      `default`/`dragging`/`disabled`), and list both in `componentManifests`.
      Adopt the existing Figma sets by name — `Input` `690:25`, `Dropzone`
      `690:35` — never rebuild.
- [ ] 3.6 Change the tally label at `scripts/generate-manifest-snapshot.mjs:371`
      so the Figma card reads `19 of 25 components mirrored`. `{label, value}`
      shape unchanged.
- [ ] 3.7 Replace `COPY.figma`'s second sentence in
      `src/components/site/manifest-dashboard.tsx` per design §5 — drop "always
      match" and the "iterate in either" claim, keep the spec/conventions/lock
      gloss.
- [ ] 3.8 Regenerate `src/generated/manifest-snapshot.json`.

## 4. QA

- [ ] 4.1 **Manual walkthrough (Outcomes)** — drive 1.1–1.5 headlessly rather
      than by eye, as beckharrisdesign/mvds#110 established: prove each failure
      mode actually fires by temporarily introducing it (a stray component file,
      a mutated prop on an excluded primitive, a lock entry with no manifest)
      and confirm the gate exits non-zero and names the right thing each time.
      A guard that cannot be shown failing is not a guard.
- [ ] 4.2 **Re-run the 480 tally assertion** rather than assume it. `19 of 25
      components mirrored` is 10 characters longer than `17 components`; the
      beckharrisdesign/mvds#110 guard makes each count+label unbreakable, so
      confirm the wrap lands on a `·` and no unit splits mid-phrase.
- [ ] 4.3 `npm run check:figma` — 19 mirrored, 6 excluded, 25 classified, lock
      clean, zero warnings.
- [ ] 4.4 `npm test` — 79 stories, light **and** dark.
- [ ] 4.5 `npm run build`, `check:principles`, `check:contrast`, `check:deps`.
- [ ] 4.6 `npx openspec validate --changes harden-figma-coverage-gate`.
