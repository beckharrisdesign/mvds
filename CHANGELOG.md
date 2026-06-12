# Changelog

All notable changes to MVDS are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and MVDS follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). MVDS is pre-1.0
(`0.x`): per the house rules, breaking changes may land in any release until
`1.0.0`.

> The `mvds-release-notes` skill drafts a per-PR entry and posts it as a PR
> comment; that draft is then landed here under **Unreleased**, and rolls into the
> next tagged version when a release is cut.

## [Unreleased]

The code→Figma component mirror became real, and typography joined color and
spacing as a fully gated foundation: the font family is now a declared token,
enforced from code to manifest to recorded Figma reality. Color grew its first
derived scales: a re-brand is now a one-token change that cascades down every
ramp.

### Added

- Three 11-step color scales (`50…950`): `gray-*` as a fixed black↔white ladder
  on the system's existing lightness rungs, and `primary-*` / `secondary-*`
  **derived from their base token via CSS relative color** — re-branding
  `--primary` recolors its entire ramp automatically, in code and (after a
  token re-sync) in the Figma mirror. Rendered in `Foundations/Color` with a
  play guard that pins the derivation, and sanctioned as token utilities in the
  no-hardcoded-color principle (`gray-*` is ours now; `slate`/`zinc`/… stay
  forbidden).
  ([#36](https://github.com/beckharrisdesign/mvds/pull/36))

- Component manifests (`figma/components/*.figma.mjs`) + the `npm run check:figma`
  drift guard — the authored, PR-reviewed spec for the code→Figma component
  mirror, gated so a variant changed in code can't silently leave the mirror
  stale.
  ([#24](https://github.com/beckharrisdesign/mvds/pull/24))
- `mvds-figma-component-sync` skill + the publish-as-merge-gate review model:
  the sync updates component sets in place and never publishes — the founder's
  **Publish library** click is the merge approval.
  ([#25](https://github.com/beckharrisdesign/mvds/pull/25))
- First real component sync recorded: `figma/figma.lock.json` (node identity so
  re-syncs update in place and instances survive) and the derived
  `{token}-tint` variable convention — alpha lives in the variable value per
  mode, because Figma drops paint-level opacity when instances re-resolve modes.
  ([#27](https://github.com/beckharrisdesign/mvds/pull/27))
- Typography drift gate: the font family is declared in `figma/conventions.mjs`
  (`typography` record — code vs Figma family names + the weight → Figma-style
  map) and enforced by `check:figma` in both directions: code ↔ manifest
  (`--font-sans`, the `@fontsource` dependency, every ramp/manifest weight
  mappable) and manifest ↔ `figma.lock.json`'s recorded text-style fonts, so
  font drift fails the build even though CI can't reach Figma.
  ([#28](https://github.com/beckharrisdesign/mvds/pull/28))

### Changed

- **Breaking:** removed the unused `chart-1`…`chart-5` tokens and their
  `bg-chart-*` utilities (pre-1.0 clean break; no compat shims). Each old value
  sits on the new gray ladder at the same rung — `chart-1` → `gray-300`,
  `chart-2` → `gray-500`, `chart-3` → `gray-600`, `chart-4` → `gray-700`,
  `chart-5` → `gray-800` (identical resolved colors).
  ([#36](https://github.com/beckharrisdesign/mvds/pull/36))
- **Breaking:** removed `Badge`'s deprecated `secondary` variant alias — use
  `muted` (pre-1.0 clean break; no compat shims).
  ([#26](https://github.com/beckharrisdesign/mvds/pull/26))
- The system typeface is **Inter** (`@fontsource-variable/inter`), switched from
  Geist Variable — the Figma text styles were already Inter, so the family gap
  closed on the code side and the new gate keeps it closed.
  ([#28](https://github.com/beckharrisdesign/mvds/pull/28))

### Fixed

- `docs/SYNC.md` no longer describes the retired paint-opacity tint recipe — the
  text now matches the derived-tint convention that
  [#27](https://github.com/beckharrisdesign/mvds/pull/27) established.
  ([#29](https://github.com/beckharrisdesign/mvds/pull/29))

## [0.1.0] - 2026-06-09

First tagged release. Establishes the token layer, layout primitives, the
manifest-driven principle engine, the installable package, and the Storybook
verification gates.

### Added

- `docs/VERSIONING.md` — the coupling contract: principles and components share
  **one SemVer** (lockstep), and `manifest.version` is recast as the manifest's
  schema/shape version, decoupled from principle content.
  ([#22](https://github.com/beckharrisdesign/mvds/pull/22))
- MVDS is now an installable package (built with `tsup`), and shipped the `Badge`
  component.
  ([#18](https://github.com/beckharrisdesign/mvds/pull/18))
- Manifest-driven principle-enforcement engine — golden rules encoded as data in
  `principles.config.mjs`, enforced by `npm run check:principles` and a
  `principle-edit-guard` PostToolUse hook, with a stubbed context cascade
  (`resolveManifest`) as the seam for per-context principles.
  ([#17](https://github.com/beckharrisdesign/mvds/pull/17))
- `mvds-release-notes` skill — drafts a release-notes entry for the most recently
  merged PR and posts it as a PR comment.
  ([#11](https://github.com/beckharrisdesign/mvds/pull/11),
  [#12](https://github.com/beckharrisdesign/mvds/pull/12))
- Token-level WCAG AA contrast gate (`npm run check:contrast`) over every
  foreground/background token pairing, in both light and dark.
  ([#10](https://github.com/beckharrisdesign/mvds/pull/10))
- `Foundations/Color` Storybook story — the canonical palette specimen.
  ([#7](https://github.com/beckharrisdesign/mvds/pull/7))
- Non-blocking Chromatic visual-regression check on every PR.
  ([#3](https://github.com/beckharrisdesign/mvds/pull/3))
- Deploy hub — a per-PR landing page linking the sample app (`/app/`) and the
  Storybook gallery (`/storybook/`).
  ([#2](https://github.com/beckharrisdesign/mvds/pull/2))
- This changelog.
  ([#15](https://github.com/beckharrisdesign/mvds/pull/15))

### Changed

- Hardened the branch/PR workflow as a house rule (no commits to `main`, enforced
  by a hook) and pinned the stack versions in the README.
  ([#16](https://github.com/beckharrisdesign/mvds/pull/16))
- House rules: every component/primitive must be *covered* by a co-located story,
  while a cohesive primitive family may share one file (the layout primitives live
  in `layout.stories.tsx`).
  ([#13](https://github.com/beckharrisdesign/mvds/pull/13))

### Fixed

- `Badge` now differentiates from `Button` via tone + the semantic status triad,
  with `secondary` kept as a deprecated alias of `muted` for compatibility, and
  uses `text-foreground` on `bg-muted` to clear WCAG AA.
  ([#19](https://github.com/beckharrisdesign/mvds/pull/19))
- Darkened the light-mode `--success` token to clear WCAG AA as text on
  `background`.
  ([#9](https://github.com/beckharrisdesign/mvds/pull/9))

[Unreleased]: https://github.com/beckharrisdesign/mvds/compare/v0.1.0...main
[0.1.0]: https://github.com/beckharrisdesign/mvds/tree/v0.1.0
