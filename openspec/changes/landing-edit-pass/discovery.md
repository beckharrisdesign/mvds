# landing-edit-pass — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | none for the composed page (sections have individual stories) |
| Figma `0.0 As is` page | <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=16-2> — `L 1024 / light` · `L 1024 / dark` (mirror main `ad93e7f`, snapshot `e6c58e8`, incl. `site-language-refresh` hero) · `S 480 / light` · `S 480 / dark` (mirror `c84e494`, pre hero-refresh — noted, not re-built). HF file, Core variables/styles/components imported by key. |
| Founder edit (the change's surface) | The founder edited the page directly in Figma. Current iteration: `02.0 Propose: landing page edit pass - manual edits` — <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=83-299> (frame 83:300). Composition: new hero (`site-language-refresh`) → Elements of the MVDS → Quick start (two named paths incl. the starter card) → footer, with hero + Quick start as dark bookend bands; principles, verification, and figma-mirror hidden. Prior iteration `01.0` (<https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=46-191>) retained untouched; the 0.5 eval ran against it. |
| Scope note | Section order and render set, the package section's restructure (two named paths), the dark bookend bands (via shipped `scoped-theming`), and full-sentence Quick start copy. Hero and header/footer chrome ship as main has them; tokens themselves unchanged. |

## Eval (0.5)

> The eval of the **founder's edited page** — a duplicate of her frame is the
> eval target on the Figma `0.5 Eval` page:
> <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=49-226>
> (frame `L 1024 / light / founder edit — eval target`, purple S-pins,
> `findings-ledger` + `per-rubric-summary` boards; this markdown canonical).
> Isolated subagent, static-design pass at 1024 light, rubric = every
> `principles.config.mjs` record with an `evalLens` (10 NN/g + `no-runts`).
> The pre-edit baseline is in the appendix; earlier eval iterations are
> retired.

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| S1 | Header "Dark mode" is styled identically to the nav links and its label doesn't indicate current state. | visibility-of-system-status | Can't tell link from toggle from readout without clicking. | medium |
| S2 | Three sibling header links, three glyph treatments: "GitHub ↗", "Storybook →", bare "Figma" — all leave the page. | consistency-and-standards | The glyphs teach nothing; predictions contradict. | low |
| S3 | The "v0.4.0 on npm" badge renders green-on-dark at near-invisible contrast on the hero; "MIT licensed" beside it is legible. | visibility-of-system-status | The page's only version/publication status is effectively hidden. | high |
| S4 | "built for both human and agentic founders" — coined vocabulary at the who-is-this-for sentence. | match-system-and-real-world | First-impression stumble on the audience statement. | low |
| S5 | Checklist item "OpenSpec schemas" has no matching card — the card is "Workflow schemas"; the other five match verbatim. | consistency-and-standards | The checklist-as-contents breaks on a page whose headline is "doesn't drift". | high |
| S6 | Three of five hero buttons duplicate the header nav directly above; beyond the one filled "Starter app", the four destinations are undifferentiated. | aesthetic-and-minimalist-design | Prime real estate repeats the nav; five doors, no ranking. | medium |
| S7 | Elements intro wraps far short of its measure, stranding "…accessed by human and agent alike." | no-runts | Reads as broken rather than set. | low |
| S8 | Principles card ends "…fail / builds." — the punchline orphaned. | no-runts | The strongest claim lands as a typographic accident. | medium |
| S9 | Principles card's second button "All 20 with sources" breaks the path-button pattern of the other five cards AND overlaps "Show the full list"'s promise. | consistency-and-standards | Learned pattern mispredicts; two near-identical buttons. | medium |
| S10 | "Show the full list" ×6 and the path labels promise neither content nor behavior (expand vs navigate). | recognition-rather-than-recall | Every button must be clicked to be understood. | medium |
| S11 | Stat-line vocabulary unexplained: "ramp steps", "dark overrides", "color utilities", "blocks", "MVDS skills". | match-system-and-real-world | The numbers meant as evidence read as noise. | medium |
| S12 | Skills card prose taxonomy ("Entry points… Voice skills… sync skills") doesn't map onto its own stat line ("workflow entry points · voice skills · MVDS skills · rule files"). | consistency-and-standards | Sentence and numbers beneath it can't be reconciled. | low |
| S13 | "The loop is adapted from the Experiment Hub, which remains the archived reference" — unusable provenance for a visitor. | aesthetic-and-minimalist-design | The card's closing sentence spends itself on internal history. | low |
| S14 | "Three lines in your global stylesheet" vs four rendered lines (the `@source` path wraps mid-value). | consistency-and-standards | Line-counting readers doubt the snippet or themselves. | low |
| S15 | Hardcoded `../` paths presented unconditionally; they only work from one stylesheet depth. | error-prevention | Silently broken token layer with no cue which assumption failed. | medium |
| S16 | No copy affordance on either code block. | flexibility-and-efficiency-of-use | The page's most frequent action has no accelerator; partial selection feeds S15. | low |
| S17 | Quick start ends at step 2 — no render-a-component step, no success state; only the corner "Full install guide →". | help-and-documentation | Nothing on screen confirms the install worked. | medium |
| S18 | Starter card ends "…merely written / down." | no-runts | The credibility claim ends on an orphaned word. | medium |
| S19 | One artifact, three names: "Starter app" (hero), "Open the starter →" (quick start), "examples/starter" (prose). | consistency-and-standards | Visitors can't be sure the buttons lead to the same thing. | low |
| S20 | Footer bare "c84e494" — unlabeled hash, disconnected from the hero's "v0.4.0". | match-system-and-real-world | Two unrelated version identifiers, neither connectable. | low |

**Per-rubric summary** (color only): visibility-of-system-status S1 S3 ·
match-system-and-real-world S4 S11 S20 · user-control-and-freedom OK ·
consistency-and-standards S2 S5 S9 S12 S14 S19 · error-prevention S15 ·
recognition-rather-than-recall S10 · flexibility-and-efficiency-of-use S16 ·
aesthetic-and-minimalist-design S6 S13 · error-recovery OK ·
help-and-documentation S17 · no-runts S7 S8 S18

## Iteration 02.0 (founder manual edits)

> After the 0.5 eval, the founder produced a new iteration —
> `02.0 Propose: landing page edit pass - manual edits`,
> <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=83-299>
> (frame `L 1024 / light / founder sketch 2026-09-02`, 83:300; prior `01.0`
> retained untouched per convention). Deltas over the evaluated frame:
>
> - **Dark bookend bands** — hero and Quick start on dark scope; header,
>   Elements, footer light (implementable via shipped `scoped-theming`).
> - **"Start from a package" card** — the two install steps wrapped in a named
>   card with the guide link inside, parallel to "Or start from a working app"
>   (addresses the shape of S17/S19).
> - **Copy direction (founder, on review):** Quick start captions and the
>   starter paragraph become full sentences — no dash-splice register —
>   holding to `site-voice`.
>
> The 0.5 ledger still applies; design (1.0) generates against the 0.6 below
> **plus** this iteration, and the 1.5 Eval Delta judges the result
> comparatively.

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.
> Figma `0.6 Eval Summary` page:
> <https://www.figma.com/design/4nGJSoK6yX4FtoWdNnt2DB/?node-id=77-340>
> (annotation mirror; this markdown canonical).

**Top issues to fix (in this change):**

- **S5 — the fifth element's name.** The hero checklist (pinned to main) says
  "OpenSpec schemas"; the card says "Workflow schemas". The hero being
  untouchable makes the card rename the available lever — founder call at
  design.
- **S3 — version-badge legibility on the hero.** Verify in code: the token
  contrast gate holds every pairing to AA in both modes, so this is likely a
  frame-only artifact of the Figma edit — confirm rather than redesign.
- **Dead `#principles` target.** The cut unrenders the principles section;
  the code behind "All 20 with sources" targets `#principles` and must be
  retargeted (the sources live in the house-rules doc) or dropped — S9's
  overlap with "Show the full list" argues for resolving both at once.
- **Storybook resolution** — verify `/storybook/` in prod at apply (dev shows
  `localhost:6006`); no redesign.

**Worth taking while we're here (small; design proposes, founder disposes):**

- **S8 and S18** — the two long-card runts ("fail builds.", "down.").

**Recorded for a follow-up change (section internals + hero/header chrome):**
S1, S2, S4, S6, S7, S9 (beyond the dead-target fix), S10, S11, S12, S13, S14,
S15, S16, S17, S19, S20.

**Tradeoffs worth preserving:**

- The cut itself: user-control and error-recovery grade clean; the page is
  identity first, install path second.
- Quick start's co-located captions and guide link.
- The hero's canonical voice — ships from main, out of scope per the anchor.

**Don't-breaks:**

- Hero and header render exactly as `site-language-refresh` shipped them.
- Hidden sections keep components + stories (`story-coverage-site` green).
- The starter card stays (founder decision, matching the frame).
- Section bands alternate across the rendered order.
- No dead anchors anywhere on the rendered page.

## Status

ready for founder review

## Appendix — pre-edit baseline eval (reference)

> The first 0.5 pass ran against the pre-edit landing page (live render,
> main `ad93e7f`, 1024 light/dark + 480 light) before the founder designated
> her edited frame as the surface. Kept for the record; its Figma mirror was
> replaced by the eval above at founder direction. Findings F1–F19,
> abbreviated:

| # | Violation (abbreviated) | Rubric item | Severity |
| --- | --- | --- | --- |
| F1 | Storybook links → `localhost:6006` in dev builds (prod resolves `/storybook/`) | error-prevention | high |
| F2 | Hero "OpenSpec schemas" vs card "Workflow schemas" | consistency-and-standards | medium |
| F3 | Two "Figma" controls, same label, different actions (header anchor vs external) | consistency-and-standards | medium |
| F4 | "Every one is machine-enforced" contradicted by the `no-runts` judgment badge | consistency-and-standards | medium |
| F5 | "5/5 green" badge; only 3 gates ran for the commit | visibility-of-system-status | medium |
| F6 | "Always match" vs mirror synced five weeks earlier | visibility-of-system-status | medium |
| F7 | Mirror previews: most scroll, least information, illegible at column width | aesthetic-and-minimalist-design | high |
| F8 | Elements of the MVDS buried last, ~4,500px down | recognition-rather-than-recall | medium |
| F9 | "MVDS ↗" / "NN/g H1 ↗" cryptic link labels ×20 | recognition-rather-than-recall | low |
| F10 | Runts at 480 and 1024 (incl. the `no-runts` card itself) | no-runts | medium |
| F11 | Date broken across lines at 480 ("2026-07-" / "23") | no-runts | low |
| F12 | Lone "npm" chip orphaned in hero CTA wrap at 480 | aesthetic-and-minimalist-design | low |
| F13 | Static ✓s in the hero read as verification | visibility-of-system-status | low |
| F14 | Commit hash shown twice, never linked | flexibility-and-efficiency-of-use | low |
| F15 | Pinned-commit vs `main` link refs mixed without signal | consistency-and-standards | low |
| F16 | Internal-context copy ("Experiment Hub", "MVDS skills") | match-system-and-real-world | medium |
| F17 | One 9/11 split, three vocabularies (enforced/automated/guiding) | consistency-and-standards | low |
| F18 | Mirror previews stay light-canvas in dark mode | consistency-and-standards | low |
| F19 | Principles inventory rendered twice (section + card expander) | aesthetic-and-minimalist-design | low |

Resolved by the founder's cut: F3 F4 F5 F6 F7 F8 F9 F11 F17 F18 F19.
Persisting into the target (see S-ledger): F1, F2=S5, F10⊂S8/S18, F13, F14=S20,
F16⊂S11/S13.
