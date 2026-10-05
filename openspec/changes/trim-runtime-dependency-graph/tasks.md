# trim-runtime-dependency-graph — tasks

## 1. User outcomes (from spec scenarios)

> One checkbox per spec scenario, in spec order. 1.1–1.4 are
> `self-contained-styles`; 1.5–1.8 are `dependency-budget`.

- [ ] 1.1 **shadcn leaves the runtime dependency set** — a consumer installing MVDS
      no longer receives the `shadcn` CLI or its 303 transitive packages, and the
      founder can still run `npx shadcn add` against a valid `components.json`
- [ ] 1.2 **The variant layer ships as a tracked source file** — a consumer gets the
      accordion keyframes, the nine `@custom-variant` declarations, and
      `no-scrollbar` from the package itself rather than from a third-party CLI
- [ ] 1.3 **Provenance header names the source and version** — a reader opening the
      vendored stylesheet can tell it is a copy, which upstream version it came
      from, and why it exists
- [ ] 1.4 **Every gate stays green across the swap** — a consumer sees identical
      rendering in light and dark, with no visual-regression diff
- [ ] 1.5 **The check fails when the tree exceeds the ceiling** — the founder gets a
      non-zero exit naming the count, the ceiling, and the packages that pushed it
      over
- [ ] 1.6 **Radix is imported scoped, not as the umbrella** — a consumer installs the
      six primitives MVDS uses rather than all 55, landing the tree at 54
- [ ] 1.7 **The budget runs with the other gates** — a founder opening a PR sees
      `check:deps` run beside `check:contrast`, `check:principles`, and
      `check:upstream-drift`, blocking on a breach the same way
- [ ] 1.8 **A bin-only package in dependencies is rejected** — the founder is told
      which package belongs in `devDependencies` instead

## 2. Preview (Storybook)

> No new story. This change renders nothing new, so the preview surface is the
> existing suite proving it renders nothing *differently*.

- [ ] 2.1 `npm run storybook` — spot-check the six components touching Radix
      (Button, Badge, Label, Checkbox, RadioGroup, Switch, Select) in light and
      dark, exercising the states the vendored variants drive: Select open/closed,
      Checkbox and Switch checked/unchecked, RadioGroup selected, disabled across
      all of them
- [ ] 2.2 Confirm no story file changed — a diff under `*.stories.tsx` means the
      swap was not behaviour-neutral and needs explaining before it ships

## 3. Implementation

**Fix 1 — vendor the variant layer (design D1–D4)**

- [ ] 3.1 Create `src/shadcn-variants.css` with the 95 lines copied byte-for-byte
      from `node_modules/shadcn/dist/tailwind.css`, plus a provenance header naming
      the package, the exact vendored version, and the reason for the copy *(1.2, 1.3)*
- [ ] 3.2 Replace `src/index.css:16` (`@import "shadcn/tailwind.css"`) with the
      relative import of the vendored file *(1.2)*
- [ ] 3.3 **D2 — extend the `tokens.css` strip rule in `tsup.config.ts`** so the
      vendored import is dropped too. The current `!/^@import "[^.]/` filter *keeps*
      relative imports, so without this `tokens.css` silently gains the variant
      layer. Express the rule as an explicit list, not a regex side effect *(1.4)*
- [ ] 3.4 **D3 — copy `src/shadcn-variants.css` → `dist-lib/` in tsup `onSuccess`**,
      alongside the existing `themes/*` copy. Without it the relative import
      resolves in-repo and fails in the published package *(1.2)*
- [ ] 3.5 Move `shadcn` from `dependencies` to `devDependencies`; leave
      `components.json` untouched *(1.1)*

**Fix 2 — scope the Radix imports (design D1)**

- [ ] 3.6 Replace `from "radix-ui"` in the seven files that use it
      (`button.tsx`, `badge.tsx`, `label.tsx`, `checkbox.tsx`, `radio-group.tsx`,
      `switch.tsx`, `select.tsx`) with `@radix-ui/react-{slot,label,checkbox,radio-group,switch,select}` *(1.6)*
- [ ] 3.7 Swap the `radix-ui` entry in `dependencies` for the six scoped packages,
      and update the `external` array in `tsup.config.ts` to match *(1.6)*

**Fix 3 — the budget gate (design D4–D6)**

- [ ] 3.8 Add `scripts/check-deps.mjs`: resolve `dependencies` + peers via
      `npm install --package-lock-only` into a temp dir, count the transitive tree,
      compare against an authored ceiling of **54**, and on breach print the count,
      the ceiling, and the packages responsible *(1.5)*
- [ ] 3.9 **D6 — bin-only rule:** fail any `dependencies` entry that declares `bin`
      **and** is referenced by no `import` / `require` / `@import` under `src/`,
      naming `devDependencies` as the correct home *(1.8)*
- [ ] 3.10 **D4 — drift check:** byte-compare `src/shadcn-variants.css` against the
      installed `node_modules/shadcn/dist/tailwind.css` (present because `shadcn`
      stays a devDependency) and report a diff. No network fetch, no stamped
      baseline — deliberately not the `.upstream/` pattern *(1.3)*
- [ ] 3.11 Wire `check:deps` into `package.json` scripts and into the CI job list
      beside `check:contrast`, `check:principles`, and `check:upstream-drift` *(1.7)*
- [ ] 3.12 Record the ceiling and the bin-only rule in `AGENTS.md` under the
      verification gates, so the constraint is readable where the other house rules
      live *(1.5, 1.8)*

## 4. QA

- [ ] 4.1 Manual walkthrough against Outcomes: install the packed tarball into a
      scratch project, confirm the tree resolves to 54, and confirm
      `@import "@beckharrisdesign/mvds/styles.css"` builds with no `shadcn` present
- [ ] 4.2 `npm test` (every story, light **and** dark, with a11y), plus
      `npm run build`, `npm run check:contrast`, `npm run check:principles` *(1.4)*
- [ ] 4.3 **Assert `tokens.css` is byte-identical** to the pre-change build. Nothing
      currently tests its contents, which is why design flagged D2 as the risk with
      no existing guard — capture the file before the change and diff after *(1.4)*
- [ ] 4.4 `npm run verify:consumer` — the existing guard for the D3 failure mode,
      which is invisible to every local gate *(1.2)*
- [ ] 4.5 Prove the gate bites: temporarily raise the tree past 54 and confirm
      `check:deps` exits non-zero with a readable message, then revert *(1.5)*
- [ ] 4.6 Re-run `check:deps` on a clean tree and confirm it passes at exactly 54 *(1.6)*
