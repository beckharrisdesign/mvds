# Verification — how MVDS keeps code honest

MVDS encodes intent in **data and stories**, then runs the **same checks** at
several stages: while you edit, before you push, on every PR, and at publish.
This page is the map of those stages. It is not a second rulebook — the rules
live in [`AGENTS.md`](../AGENTS.md), [`principles.config.mjs`](../principles.config.mjs),
and [`src/index.css`](../src/index.css).

**Idea:** local gates and CI are not different policies. They are the same
spine, applied earlier or later.

```
edit → agent hooks → local hand-run → git hooks → PR / CI → (Chromatic) → publish
         │                │                              │                    │
         └──── same scripts / same manifests ────────────┴────────────────────┘
```

---

## 1. Before the change leaves your machine

These catch drift while the work is still local.

| Layer | What runs | Same rules as |
| --- | --- | --- |
| **Types** | TypeScript (`tsc` via `npm run build`) — e.g. 8-grid `gap` props | Compile-time constraints in component APIs |
| **Lint** | `npm run lint` (ESLint) | General JS/TS hygiene — *not* the golden-rule gate |
| **Agent edit guards** | Claude PostToolUse hooks | Principles + token contrast at keystroke |
| **Hand-run ship gate** | Commands in AGENTS.md “Before you call a change done” | Exactly what CI will re-run |
| **Git hooks** | `.githooks/` (via `prepare` → `core.hooksPath`) | Branch workflow, not correctness |

### Agent edit guards

Wired in [`.claude/settings.json`](../.claude/settings.json):

| Hook | Trigger | Runs |
| --- | --- | --- |
| [`principle-edit-guard`](../scripts/hooks/principle-edit-guard.mjs) | After editing a source file | `node scripts/check-principles.mjs --file <path>` |
| [`token-edit-guard`](../scripts/hooks/token-edit-guard.mjs) | After editing `src/index.css` | `node scripts/check-contrast.mjs` (+ Figma-stale nudge) |

These are the same Node scripts CI uses — scoped to the edited file where that
makes sense.

### Hand-run ship gate (required before you claim done)

```bash
npm run build              # tsc + vite
npm run check:contrast     # token WCAG AA, light + dark
npm run check:principles   # manifest-driven golden rules
npm test                   # Storybook stories in Chromium + axe, light then dark
```

Details and rationale: [`AGENTS.md`](../AGENTS.md) → *Before you call a change done*.

### Local git hooks (workflow, not quality)

| Hook | Role |
| --- | --- |
| [`.githooks/pre-commit`](../.githooks/pre-commit) | Hard-blocks commits on `main`; warns on off-convention branch names |
| [`.githooks/post-merge`](../.githooks/post-merge) | After pull into `main`, cleans up genuinely merged branches/worktrees |

They do **not** run build, principles, or Storybook tests. Correctness is
opt-in locally (hand-run / agent hooks) and mandatory in CI.

---

## 2. How the repo holds the line (same rules, more places)

Once the branch is on GitHub, automation re-applies the spine and adds a few
checks that only make sense remotely.

### PR / push CI — [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Triggers on pull requests to `main` and pushes to `main`.

**Job `build-and-test` (blocking):**

| Step | Command / tool |
| --- | --- |
| App build | `npm run build` (`tsc` + Vite) |
| Library build | `npm run build:lib` (tsup → `dist-lib`) |
| Token contrast | `npm run check:contrast` |
| Design principles | `npm run check:principles` |
| Figma manifest drift | `npm run check:figma` (component axes vs code) |
| Storybook tests | `npm test` — Vitest + Playwright **Chromium**, every story, **light and dark**, including axe a11y / color-contrast |

**Job `consumer-path` (blocking, independent):**

| Step | What it proves |
| --- | --- |
| `npm run verify:consumer` | A stranger’s install: published package (or local pack on release bumps) into `examples/starter`, no `.npmrc` / no token, build succeeds and CSS proves tokens + `@source dist-lib` |

**Job `figma-share` (blocking, independent):**

| Step | What it proves |
| --- | --- |
| `npm run verify:figma-share` | The public view-only Figma URL still returns 200 and opens the intended file (not a revoked share / wrong page) |

### Chromatic — [`.github/workflows/chromatic.yml`](../.github/workflows/chromatic.yml)

Visual regression on Storybook snapshots. Complements CI’s render + a11y gate
with pixel diffs. **Non-blocking:** reported in Chromatic for review; does not
gate merges.

### Publish / release — [`.github/workflows/publish.yml`](../.github/workflows/publish.yml)

On `v*.*.*` tags (or manual dispatch):

- Tag must match `package.json` version (tag-triggered runs)
- `npm publish` — `prepack` runs `build:lib` so the tarball always includes a
  fresh `dist-lib`

There is no separate post-deploy smoke beyond that; the **consumer-path** CI job
is what continuously validates the *documented install* against what npm
already serves (with a local-pack fallback on release bumps).

---

## 3. What “enforced” means (principles)

In the principle manifest and on the landing dashboard, **enforced** /
**automated** means a machine check in [`scripts/check-principles.mjs`](../scripts/check-principles.mjs)
— **not** a Vitest unit test and **not** a Storybook integration test.

| Check kind | How it works | Example ids |
| --- | --- | --- |
| `forbid-source` | Regex over source text | `no-hardcoded-color` |
| `forbid-classname` | Regex over classnames (with allowlist) | `no-margin-spacing`, `no-raw-flex-grid` |
| `require-sibling-file` | Companion file must exist | `story-coverage-ui`, `story-coverage-site`, `story-coverage-layout`, `story-coverage-blocks` |
| `guiding` | **Judgment** — reported, never executed, never fails the build | NN/g heuristics in the manifest |

Suppress a justified exception on the offending line:

```ts
// mvds-allow no-hardcoded-color — <reason>
```

Bare `// mvds-allow` suppresses every principle on that line.

Storybook + Chromium (`npm test`) is a **different** layer: render, interaction,
and axe contrast in real UI — including principles that only show up as pixels
and DOM, not as forbidden source patterns.

---

## 4. Quick reference — scripts and where they run

| Script | Local hand-run | Agent hook | CI | Publish |
| --- | --- | --- | --- | --- |
| `build` | ✓ (ship gate) | | ✓ | |
| `build:lib` | as needed | | ✓ | via `prepack` |
| `lint` | optional | | | |
| `check:contrast` | ✓ | token-edit-guard | ✓ | |
| `check:principles` | ✓ | principle-edit-guard | ✓ | |
| `check:figma` | as needed | | ✓ | |
| `test` (Storybook / Chromium) | ✓ | | ✓ | |
| `verify:consumer` | as needed | | ✓ | |
| `verify:figma-share` | as needed | | ✓ | |
| Chromatic | | | ✓ (advisory) | |

---

## Related

- [`AGENTS.md`](../AGENTS.md) — golden rules + ship gate + branch/PR workflow
- [`principles.config.mjs`](../principles.config.mjs) — principle records (data)
- [`docs/SYNC.md`](SYNC.md) — code → Figma (on request only; not a CI correctness gate)
- [`docs/CONSUMING.md`](CONSUMING.md) — the install path `verify:consumer` guards
