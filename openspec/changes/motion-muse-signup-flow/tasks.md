# motion-muse-signup-flow — tasks

## 1. User outcomes (from spec scenarios)

> Founder-approved 2026-08-27 ("approved"), after the endpoint landed on the
> hub path and the end-to-end submission was verified from the running page.

- [x] 1.1 CTA leads to the form — clicking any of the seven entry points lands
  the visitor at the on-page form with their offer pre-selected and the first
  field ready for focus; no mail client launches
- [x] 1.2 Filling in the form — four labeled fields (name, email, offer
  interest, optional note), system focus states, no offer pre-selected unless
  a CTA chose one
- [x] 1.3 Invalid email is rejected inline — missing name / malformed email /
  missing offer choice produce inline destructive errors at the field, marked
  for assistive tech, focus moved to the first invalid; form never clears
- [x] 1.4 Valid submission confirms — details delivered to the configured
  endpoint; "Your note is in." confirmation replaces the form, naming the
  offer and the reply window; send failure shows the banner with the visible
  email fallback
- [x] 1.5 Both modes and breakpoints — every state legible at AA in light +
  dark at 480/1024, on-grid, keyboard operable end to end, no runts in the
  copy

## 2. Preview

- [x] 2.1 Motion & Muse dev server renders the flow — `motion-muse` entry in
  `.claude/launch.json` (Vite, port 5173); no Storybook — the consumer app is
  the preview surface, per discovery's eval-target note

## 3. Implementation (motion-muse repo — `~/Documents/code/motion-muse`)

- [x] 3.1 Signup section replaces the closing CTA band in `App.tsx`: muted
  band, two-column Grid at L / stacked at S, copy column with visible
  `hello@motionandmuse.studio`, form Card (offer RadioGroup ×4, Name + Email
  `Input` lg, "Anything else? (optional)" `Textarea`, primary "Send my note",
  deadline caption) — all on published `@beckharrisdesign/mvds@0.4.0`
  primitives, per the approved `03.0` frames
- [x] 3.2 Entry-point wiring: all seven former `mailto:` links become in-page
  links to `#signup`, each setting the offer pre-selection before scrolling;
  CTA renames per design ("Request a discovery call", "Request a spot",
  "Ask about dates"); hero badge → dated claim from a single shared constant
- [x] 3.3 Form state machine: idle → invalid (per-field messages,
  `aria-invalid` + `aria-describedby`, focus to first invalid, required offer
  choice) → sending (disabled "Sending…") → success (confirmation replaces
  form, offer echoed) / failed (destructive banner, email fallback, values
  preserved); POST JSON to `VITE_SIGNUP_ENDPOINT`
- [x] 3.4 Runt pass (P1/P2): `text-wrap: pretty` on body/blockquote copy (and
  `balance` on the hero's deliberate two-line break), then a real-browser
  copy check at 480/1024 — rebreak or reword the four flagged terminal lines
  ("guilt.", "you're lifting.", "up for it.", "same place.") if the engine
  still strands them
- [x] 3.5 FINDINGS.md round-2 log: deferred cluster F6–F11 as backlog, the
  Sep 26 badge's maintenance duty, endpoint provisioning as the founder's
  open item, and what the eval loop caught (N1 story included)

> §1 stays for the founder: the schema's completion rule is that the user runs
> the manual §1 checks before `/opsx:archive`. The agent walkthrough behind
> 4.1 (browser, DOM-verified: CTA routing + pre-selection, validation + focus,
> failure banner + preserved values, success + offer echo, no default intent,
> runt-free terminal lines at 1024/480) is evidence, not a substitute.

## 4. QA

- [x] 4.1 Manual walkthrough of Outcomes 1.1–1.5 in the browser pane, light +
  dark, 480 + 1024, all five form states
- [x] 4.2 `npm run build` in motion-muse (tsc + vite) — passes against the
  published package
- [x] 4.3 MVDS repo gates on this branch (`build` · `check:contrast` ·
  `check:principles` · `npm test`) — already green after the `no-runts`
  manifest addition; re-run before the PR flips ready
- [x] 4.4 `adding-eval-gate` outcome credit: check its tasks 1.1–1.6 and 1.9
  with pointers to this change's discovery/design (eval before proposal,
  blind isolation, summary-conditioned proposal, delta-only iteration,
  founder-added rubric item applied at `03.0`)
