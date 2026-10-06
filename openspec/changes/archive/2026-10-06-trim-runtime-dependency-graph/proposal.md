# Proposal: trim-runtime-dependency-graph

## Human anchor

> check the health of my npm package via these kinds of assessments... lets write
> an openspec proposal on reviewing npmgraph in particular, assessing whether this
> is good or bad, and three prioritized thigns we could do to improve it.

## Outcomes

- **Who:** consumers installing `@beckharrisdesign/mvds` into a product repo, and
  the agents that read the install to decide whether this design system is cheap
  to adopt.
- **Job:** add MVDS to a project without inheriting a CLI toolchain they will
  never run.
- **Done when:** the published package resolves **55 transitive packages instead
  of 386**, `npm run check:deps` fails the build if that number climbs past an
  authored ceiling, and `styles.css` still renders identically in Storybook light
  and dark with every existing gate green.
- **Not doing:** touching `devDependencies` (Storybook, Vitest, Playwright, and
  the `openspec` CLI are authoring tools and their weight is irrelevant to
  consumers); removing Radix as the primitive substrate; changing any component
  API, token, or visual output.

## Why

The npmgraph render of `@beckharrisdesign/mvds` is a dense thicket, and the
instinct that something is wrong is correct. But the shape is misleading about
the cause: this is not accumulated sprawl across many dependencies. It is one
packaging mistake that dominates everything else.

**Measured on the published `dependencies` + peers of v0.4.0:**

| Configuration | Transitive packages |
|---|---|
| As published today | **386** |
| Without `shadcn` | **84** |
| Without `shadcn`, Radix scoped to what MVDS imports | **55** |

`shadcn` accounts for **302 of 386 packages — 78% of the graph, 5.8 MB on
disk.** It is a CLI, declared with `"bin"`, and AGENTS.md already invokes it the
correct way: `npx shadcn@latest add <name>`, which fetches on demand and needs no
dependency entry at all. It sits in `dependencies` for exactly one reason, a
single line in the token layer:

```
src/index.css:16  @import "shadcn/tailwind.css";
```

That file is **95 lines / 1.6 KB** of static CSS: two accordion keyframes, nine
`@custom-variant` declarations, and one `no-scrollbar` utility. There is no build
step and nothing dynamic. Every consumer of `styles.css` currently installs a
302-package CLI toolchain to obtain it.

The honest verdict, then, is split. **The graph as published is bad**, and a
reviewer judging MVDS by its install is judging it fairly. **The system
underneath is lean.** Strip the one mistake and 84 packages remain; of those, 61
are Radix and the other 23 are `react`, `react-dom`, `scheduler`, `lucide-react`,
`clsx`, `cva`, `tailwind-merge`, `tw-animate-css`, the Inter font, and Radix's own
internals (`@floating-ui/*`, `react-remove-scroll`, `aria-hidden`, `use-sidecar`
and friends). Nothing in that set is unearned. MVDS's dependency discipline is
sound; its packaging is not.

The Radix line is a smaller, real version of the same error. `src/` imports the
`radix-ui` umbrella, which declares **55 dependencies** and installs every
primitive. MVDS uses **six**: Label, RadioGroup, Checkbox, Switch, Select, and
Slot. Bundlers tree-shake the rest, but `npm install` and npmgraph do not, so
consumers carry all of it on disk and in their lockfile.

This is also a verification gap, not just a cleanup. MVDS machine-enforces its
golden rules through `check:principles`, `check:contrast`, and
`check:upstream-drift`, on the premise that a rule stated in prose decays while a
rule encoded as data holds. The dependency surface had no such guard, which is
how a CLI entered `dependencies` and stayed through a release. Fixing the two
offenders without adding the guard leaves the next regression equally free.

## What changes

Three fixes, ordered by payoff per unit of risk.

**1. Vendor the variant layer and drop `shadcn` from `dependencies`.**
Copy the 95 lines into a tracked source file (`src/shadcn-variants.css`, imported
by `src/index.css` in place of the bare specifier) with a header recording its
provenance and upstream version. `shadcn` moves to `devDependencies` so
`components.json` and the `add` workflow are untouched. Cost: 1.6 KB of vendored
CSS. Benefit: **−302 packages, −78%.** This is the entire headline, and it is the
lowest-risk change of the three because the file is static and the output is
byte-comparable.

Vendoring is the repo's established answer to exactly this problem. `src/components/ui/`
is vendored shadcn tuned to the 8-grid, and `.upstream/` vendors fourteen hub
files against a stamped commit with `check:upstream-drift` watching them. This
file joins that pattern rather than inventing one.

**2. Import the six Radix primitives directly instead of the umbrella.**
Replace `from "radix-ui"` in the seven files that use it with the scoped
`@radix-ui/react-{label,radio-group,checkbox,switch,select,slot}` packages, and
update `tsup.config.ts`'s `external` list to match. **−29 packages.** Mechanical,
but it touches seven component files and the build config, so it carries more
review surface than fix 1 and earns second place rather than first.

**3. Encode the result as a budget so it cannot regress.**
Add `check:deps`: resolve the published `dependencies` + peers with
`npm install --package-lock-only`, count the tree, and fail against an authored
ceiling. Pair it with an explicit rule that a package carrying a `bin` and no
runtime import does not belong in `dependencies` — the precise shape of the bug
this change removes. Wire it into the `check:*` family and CI alongside the
existing gates. This converts a one-time cleanup into a standing constraint, and
makes the ceiling a reviewable number in the repo rather than a fact someone has
to remember.

## Capabilities

### New Capabilities

- `self-contained-styles`: the published stylesheet entries resolve from the
  package's own files plus declared runtime dependencies, with no third-party CLI
  package on the resolution path. Vendored upstream CSS carries provenance and is
  drift-checkable.
- `dependency-budget`: the published runtime dependency tree is bounded by an
  authored ceiling enforced in CI, and tooling-only packages are kept out of
  `dependencies` by a machine check rather than by convention.

### Modified Capabilities

None. No component API, token, or rendered output changes.

## Impact

- **Consumers:** install drops from 386 to 55 transitive packages. No code change
  on their side; `styles.css`, `tokens.css`, and the `themes/*` exports keep their
  current contracts. `tokens.css` is already unaffected, since its build strips
  external `@import`s.
- **This repo:** `src/index.css` line 16, seven `src/components/ui/*.tsx` imports,
  `tsup.config.ts` externals, `package.json` dependency placement, one new
  `scripts/check-deps.mjs`, and one CI job.
- **Risk:** the vendored CSS now needs a bump when shadcn's variant layer moves
  upstream. The drift-check pattern from `.upstream/` is the mitigation, and the
  file is small enough to diff by eye.
- **Gates:** `npm run build`, `npm run check:contrast`, `npm run check:principles`,
  and `npm test` (light + dark) must all pass unchanged. The visual output is
  expected to be identical, which makes Storybook's existing visual-regression
  coverage the real proof that the vendoring was faithful.
- **Release:** a patch or minor bump. Nothing here is breaking, so the pre-1.0
  clean-break allowance is not needed.

## Optional links

- Consuming / theming docs: `docs/CONSUMING.md`, `docs/THEMING.md`
- House rules: `AGENTS.md`
- How we enforce: `docs/VERIFICATION.md`
