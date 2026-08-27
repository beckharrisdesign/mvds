# motion-muse-signup-flow — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | none (consumer app, no Storybook) — eval target was the **live page** at `localhost:5173` on published `@beckharrisdesign/mvds@0.4.0`, inspected in both modes at desktop / 480 / 375 / 320 |
| Figma `0.0 As is` page | <https://www.figma.com/design/2sC7O98JUXh9KczI9ZPdH9> — file "HF Motion & Muse", page `0.0 As is`, frames `L 1024 / light` · `L 1024 / dark` · `S 480 / light` · `S 480 / dark`. Spacing/type/neutral colors bound to MVDS Core by key (`boundVariables` verified non-null; dark via Tokens→Dark mode flip). Brand colors, gradients, radii, and the Fraunces heading face hand-mirrored from motion-muse `styles.css` — sanctioned exception, flagged by an annotation node on the page. |
| Scope note | This change touches the conversion path: hero CTA, three program-card CTAs, closing-band CTA, footer Contact — today all seven contact links are `mailto:`. The rest of the page is context. |

## Eval (0.5)

> Produced by an isolated subagent (surface + rubric only — no proposal
> rationale, no prior findings). Rubric = every `principles.config.mjs` record
> with an `evalLens`. Scores are summary color only; the findings are the
> artifact. This baseline is cached — proposal iterations re-run only the
> Delta (1.5).

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | Every conversion/contact path on the page — hero and closing "Book a discovery call", all three program-card CTAs, and footer "Contact" — is a bare `mailto:hello@motionandmuse.studio` link, and the email address is never rendered as visible text anywhere on the surface. | error-recovery | On any browser without a configured mail handler (webmail users, work machines), clicking every CTA silently does nothing; with no visible address to copy, the user has zero ways to contact the studio and leaves. | critical |
| F2 | The Studio Reset card's CTA "See next dates" opens an empty email compose; no dates for the weekend workshop exist anywhere on the page. | match-system-and-real-world | User clicks expecting a schedule, gets a blank email draft instead, and must write to ask for the very information the button promised — many will abandon at the bait-and-switch. | major |
| F3 | The three program CTAs ("Join the next cohort", "Apply for 1:1", "See next dates") all open the identical subject-less, body-less compose window, carrying no trace of which program was clicked. | recognition-rather-than-recall | Once in the mail client the user must recall and re-type which program (and which cohort) they meant; the coach receives ambiguous "hi" emails she must triage back. | minor |
| F4 | The two "Book a discovery call" CTAs pre-fill a "Discovery call" subject while the three program CTAs and footer "Contact" pre-fill nothing — visually identical button actions behave differently. | consistency-and-standards | Users who noticed the tidy pre-filled draft from the hero get a bare compose from a program card and wonder whether the link is broken or went somewhere different. | minor |
| F5 | The hero badge "Now booking autumn cohorts" and "Join the next cohort" assert time-boxed availability purely in static prose, with no dates, deadline, or anything that can visibly go stale. | visibility-of-system-status | The user cannot tell whether the claim is current; people email about cohorts that may be full or finished, and the badge silently lies once autumn passes. | minor |
| F6 | The header theme toggle is labeled with the target mode ("Light" while the page is dark, "Dark" while light) with no icon or state cue distinguishing label-as-action from label-as-status. | visibility-of-system-status | Users who read it as a state indicator ("theme: Light") click it to no purpose or believe the control is inverted, toggling twice to learn its convention. | minor |
| F7 | An explicit Light/Dark choice made with the toggle is discarded on any reload — the page resets to the OS `prefers-color-scheme` with no persistence. | user-control-and-freedom | A user whose preference differs from their OS setting must redo the toggle on every visit; their stated choice is quietly overridden. | minor |
| F8 | Below roughly 400px viewport width the header wraps to two rows and the fixed 64px `overflow-hidden` chrome clips the bottom of the nav row (link bottoms at 66px; the toggle pill's lower border is visibly cut at 375px and 320px). | consistency-and-standards | On small phones the primary nav looks broken/cropped, undermining trust in the rest of the page and shaving the already-small tap area further. | minor |
| F9 | Header nav links and the theme toggle are 24px-tall targets spaced 4px apart (footer links similar), far below comfortable touch size on mobile. | error-prevention | Thumb users mis-tap the neighboring link — e.g. hit "About" while aiming for the theme toggle — and get thrown down the page unexpectedly. | minor |
| F10 | The program cards give price and duration but no start dates, location, or delivery mode (in-person vs. remote — "Portland, OR" appears only in the footer copyright line), and there is no FAQ; the only way to answer any pre-purchase question is to email. | help-and-documentation | Out-of-town or remote-curious visitors can't self-qualify at the point of decision; basic logistics questions become email round-trips or silent drop-offs. | minor |
| F11 | The About section's square MediaFrame renders only a brand-gradient fill with an "M·M" monogram — a placeholder-grade decoration occupying half the section beside "Hi, I'm Mara", where the copy promises a person. | aesthetic-and-minimalist-design | Half the About section's visual weight communicates nothing about the coach; the page reads as unfinished/template-like exactly where personal trust is being built. | minor |
| F12 | "Book a discovery call" (hero and closing CTA) performs no booking — it opens an email draft, with no scheduling step anywhere on the surface. | match-system-and-real-world | Users primed by the verb "book" expect to pick a time and instead start an open-ended email negotiation; some perceive the promise as unmet and bail. | minor |

**Per-rubric summary (color only):**

| Rubric item | Color | Note |
| --- | --- | --- |
| visibility-of-system-status | yellow | availability claimed in stale-able prose (F5); toggle state ambiguous (F6) |
| match-system-and-real-world | yellow | language otherwise excellent; "See next dates" (F2) and "Book" (F12) over-promise |
| user-control-and-freedom | yellow | anchors/back fine; explicit theme choice discarded on reload (F7) |
| consistency-and-standards | yellow | pre-fill differs across look-alike CTAs (F4); header clips when wrapped (F8) |
| error-prevention | yellow | nothing destructive; 24px tap targets at 4px spacing invite mis-taps (F9) |
| recognition-rather-than-recall | yellow | program context dropped at the mail-client handoff (F3) |
| flexibility-and-efficiency-of-use | green | anchor nav + pre-filled subject act as accelerators; novice path unburied |
| aesthetic-and-minimalist-design | yellow | disciplined and token-clean; only the placeholder monogram fails to earn its place (F11) |
| error-recovery | **red** | sole conversion channel is mailto with no visible-address fallback — silent dead end (F1) |
| help-and-documentation | yellow | pricing in context; dates/location/delivery-mode absent at point of commitment (F10) |

**Figma `0.5 Eval` page:** <https://www.figma.com/design/2sC7O98JUXh9KczI9ZPdH9>
— page `0.5 Eval` (after `0.0 As is`): frames `L 1024 / eval` + `S 480 / eval`
(pinned duplicates, bindings intact; F1 pinned at all seven mailto entry
points, F8/F9 on the mobile frame) and boards `Findings ledger` ·
`Per-rubric summary` · `0.6 Eval Summary`. Annotation layer per the
`rules/figma.mdc` stage model — this markdown stays canonical.

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

**Top issues to fix:**

1. **Kill the mailto dead end (F1, the red).** The conversion path must work
   on-page, with a visible plain-text email address as the always-works
   fallback — recoverability, not just replacement.
2. **Carry the offer through the flow (F3 + F4).** Whatever CTA the visitor
   clicks — discovery call, cohort, 1:1, Studio Reset — that context arrives
   pre-selected in the form and reaches the coach; all seven entry points
   behave identically.
3. **Make the verbs honest (F2 + F12).** CTA labels must promise exactly what
   the flow delivers. If "book" still means "request a call", say that; "See
   next dates" must lead to dates or change its words.
4. **Availability should be able to go stale visibly (F5).** If "autumn
   cohorts" stays on the page, tie it to something dated or maintained, not
   fossil prose.

**Tradeoffs worth preserving:**

- The one **green** (flexibility-and-efficiency): anchor-nav accelerators and
  the hero's pre-filled-context pattern — the new flow should raise that
  bar, not trade it away.
- Static single-page simplicity: the page currently has zero backend and
  loads instantly; the flow shouldn't cost that.
- Copy discipline and token-clean layout (aesthetic nearly green): the form
  must read as the same calm surface, not a bolted-on widget.

**Don't-breaks:**

- Anchor navigation and `scroll-margin` behavior below the sticky header (verified
  correct at all widths).
- AA contrast in both modes — including every new state the form introduces.
- 8-grid / layout-primitive / token discipline (the page currently has zero
  raw flex, zero margins, zero off-token color).
- "Explore the programs" as the low-commitment secondary path.

**Deferred (real findings, not this change's job):** F6/F7 (toggle labeling +
persistence), F8/F9 (narrow-viewport chrome + tap targets), F10 (logistics
content), F11 (About imagery) — recorded here for the motion-muse backlog
(FINDINGS.md round-2 log) or future changes; the design stage should not
absorb them unless the founder widens scope.

## Status

ready for founder review
