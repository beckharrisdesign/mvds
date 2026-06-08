# Changelog

All notable changes to MVDS are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); MVDS aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) once it cuts tagged
releases. The project is pre-release (`0.0.0`), so entries accumulate under
**Unreleased** until the first version is tagged.

> Entries are drafted per merged PR by the `mvds-release-notes` skill and land in
> the **Unreleased** section below.

## [Unreleased]

### Added

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

- House rules: every component/primitive must be *covered* by a co-located story,
  while a cohesive primitive family may share one file (the layout primitives live
  in `layout.stories.tsx`).
  ([#13](https://github.com/beckharrisdesign/mvds/pull/13))

### Fixed

- Darkened the light-mode `--success` token to clear WCAG AA as text on
  `background`.
  ([#9](https://github.com/beckharrisdesign/mvds/pull/9))
