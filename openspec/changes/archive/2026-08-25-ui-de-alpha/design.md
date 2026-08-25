# ui-de-alpha — design

## Context

Specs approved 2026-08-25. A first design pass (rev 1, pages `0.0` / `01.0`)
proposed swapping the alpha hovers for fixed gradation steps and was approved
on the strength of default-brand frames. Implementation disproved it: adding
the hover pairings to `check:contrast` failed immediately on
`terracotta/dark: secondary-foreground on secondary-3 — 2.78:1`. Rev 2 (page
`02.0`) records the corrected approach the founder chose ("I agree - A"):
narrow the principle, keep state modulation relative.

## Goals / Non-Goals

**Goals:**

- Remove the one true brand alpha from `ui/` without introducing a
  brand-specific guess in its place.
- Make the manifest state the authored-surface vs interaction-state
  distinction it was always implying, with the evidence recorded.

**Non-Goals:**

- Status-triad de-alpha; non-brand alpha (`ring-ring/50`,
  `ring-foreground/10`, `dark:bg-input/30`); gradation value changes.
- Hover-state contrast checking (see Risks — needs new token surface).

## User flow / IA

Unchanged for consumers: variants, rest states, and rendered hover colors are
all identical. What changes is where a hover's color comes from — a relative
derivation from the variant's own rest token, which every brand inherits
automatically, instead of an alpha composite against whatever sits behind.

## Visual design / Figma

| Item                  | Value |
| --------------------- | ----- |
| Primary file URL      | https://www.figma.com/design/u9o8HgFq8Paqk9v06NW5Ng (scratch: "MVDS explore: ui-de-alpha") |
| As-is page / frame    | `0.0 As is` — "Button hovers — as is (light)" / "(dark)": default + secondary variants, rest and hover, on default-brand Core variables |
| Proposed page / frames| `02.0 Propose: ui-de-alpha (rev 2 — relative state modulation)` — "Button hovers — proposed (light)" / "(dark)", plus "Why not a fixed step" (terracotta dark secondary: stepped vs relative, with the failing ratio). Superseded rev 1 lives on `01.0 Propose: ui-de-alpha` — parked, not deleted, per `rules/figma.mdc` |
| Libraries / version   | MVDS Core (`C20nU0mROzk3Zr0I9BELJF`) variables imported by key; dark boards flip via the Tokens collection's Dark mode. Terracotta evidence frames use that brand's authored values as flagged reference (terracotta is not a Core variable mode) |
| Breakpoints           | Storybook canvas (component-internal state change — no S/L delta) |
| Status                | built — rev 2 |

## Decisions

1. **Interaction state is a different job from surface gradation.** A
   gradation step is an absolute position on a brand's ladder; a hover needs a
   relative offset from the rest color. Nothing binds `--primary`/`--secondary`
   to a rung: the default brand seats them exactly on steps (primary ≡ 5;
   secondary ≡ 1 light / 2 dark) while terracotta lands between steps at a
   different rung per mode, and inverts light/dark polarity for `secondary`.
   So the principle exempts state modulation rather than the components being
   forced onto steps.
2. **Default variant: `hover:bg-primary/80` →
   `color-mix(in oklch, var(--primary), var(--background) 20%)`.** Same 80/20
   relationship the alpha expressed, but opaque and independent of what is
   painted behind the button — that fragility was the real defect, and the
   "alpha" framing was a proxy for it. **Not pixel-identical:** alpha
   composites in sRGB, `color-mix` interpolates in oklch, so light-mode hover
   goes `#454545` → `#3e3e3e`. `in srgb` would match byte-for-byte; oklch wins
   anyway because it is the system's colour space (every token, and the
   existing secondary mix) and keeps a 20% nudge perceptually even on
   saturated brand colours rather than shifting chroma unpredictably.
   Measured in-browser: light `#171717` → `#3e3e3e`, dark `#e5e5e5` →
   `#b3b3b3`.
3. **Secondary variant: unchanged.** Its existing
   `color-mix(…var(--secondary), var(--foreground) 5%)` was never alpha and was
   always brand-safe. This change ratifies it as the sanctioned pattern instead
   of removing it. Note the two variants mix toward *different* anchors —
   solids soften toward the page, muted surfaces firm up toward the text —
   each moving the way that reads as "state" for its variant.
4. **Enforcement is a narrowed pattern, not a suppression.** `forbid-source`
   has no `allow` list (only `forbid-classname` does), so the exemption is a
   negative lookbehind for a mix sitting directly inside
   `hover:`/`focus:`/`focus-visible:`/`active:bg-[…]`. Verified against eleven
   shapes: all alpha forms and non-state brand mixes still flag; state mixes,
   real steps, `-foreground/` variants, and status tints stay clean. Zero
   `mvds-allow` suppressions — the rule states the exception rather than
   hiding it per-line.

## Risks / Trade-offs

- **Hover contrast is not gate-checkable, and this change does not fix that.**
  The token gate parses `--name: oklch(…)` declarations; it cannot evaluate a
  `color-mix()` living in a Tailwind arbitrary value, and the story a11y gate
  only exercises rest states. The safety argument is mechanical plus
  spot-measured: a small relative nudge cannot move contrast far, and the one
  colour that shifts moves *away* from the page (`#454545` → `#3e3e3e` against
  a white background), so contrast with `primary-foreground` improves rather
  than degrades. No *new* risk ships, but the blind spot itself is unchanged —
  this class of bug would still not be caught by a gate. Closing it properly
  means promoting hover to real token surface (`--primary-hover` etc.) plus a
  `color-mix` evaluator in `check-contrast.mjs` — new DS surface, so the
  founder's call, not this change's.
- The exemption is keyed to *syntax* (a state-variant prefix), not to
  semantics. Someone could write a state-variant mix that is really a surface
  tint and slip through. Judged acceptable: the alternative is no exemption
  and a per-line `mvds-allow`, which hides the rule instead of stating it.
- Rev 1's approved frames are now wrong. They are parked on `01.0` rather than
  deleted so the reasoning trail survives — the failure they led to is the
  clearest argument for the rule this change encodes.
