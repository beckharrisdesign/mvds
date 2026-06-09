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
