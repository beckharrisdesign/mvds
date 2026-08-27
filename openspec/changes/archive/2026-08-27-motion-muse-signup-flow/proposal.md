# motion-muse-signup-flow

## Human anchor

> "ok, lets do discovery on adding a signup flow to motion and muse"

Founder directive, 2026-08-26, with the live page open in the browser — the
natural next iteration round-1 already named: Motion & Muse still closes with
two `mailto:` CTAs because `Input` didn't exist when the page was built.
`Input` shipped in 0.4.0; this change puts it to work.

## Outcomes

- **Who:** A prospective client on the Motion & Muse landing page ready to act
  — booking a discovery call or joining the autumn cohort — and the founder,
  who gets the first real consumer proof of the 0.4.0 form primitives.
- **Job:** Replace the `mailto:` fallbacks with an on-page signup flow — a
  real form (built from `Input`, `Button`, and the layout primitives) with
  honest states: filling it in, submitting it, succeeding, and failing.
- **Done when:** The discovery eval of the as-is page has run and its summary
  is founder-approved; the proposed flow answers that summary; the flow works
  on the page in light + dark at S=480 / L=1024; and any DS-side gap the flow
  exposes (validation/feedback states, form composition) is either shipped in
  MVDS within this change's capability budget or recorded in FINDINGS.md as
  round-2 backlog.
- **Not doing:** A backend. Where the submission lands (form service, endpoint,
  or a structured mailto handoff) is a design-stage decision, but standing up
  server infrastructure is out of scope. No Figma library/component sync (only
  on explicit ask). No redesign of the rest of the page beyond what the eval
  summary prioritizes about the CTA path.

## Why

Round one's FINDINGS.md called the email-capture form "the #1 landing-page
pattern" and logged it as impossible on-system — gap 1, the hardest-biting
finding of the dogfood. 0.4.0 closed the gap upstream (`Input` + `Dropzone`,
PR #85) but the consumer page never got the payoff: the CTAs are still
`mailto:` links, which means the system's flagship consumer surface still
demonstrates the workaround, not the capability. A signup flow is also the
first *stateful* pattern Motion & Muse will carry — forms have focus, error,
disabled, and success states — so it stress-tests `Input` in real usage the
way a Storybook story can't.

This is also the first change through the discovery eval gate: the 0.5 eval
runs blind against the as-is page before any proposed flow exists, and the
approved 0.6 summary conditions the design — which doubles as the live-run
evidence `adding-eval-gate`'s open outcome checkboxes (1.1–1.6, 1.9) are
waiting on.

## What changes

1. Discovery captures the as-is CTA path (hero + closing band, both `mailto:`)
   and runs the ten-heuristic eval on the live page at `localhost:5173`.
2. Design proposes the signup flow conditioned on the approved eval summary —
   Figma as-is + propose pair per `rules/figma.mdc`, then the 1.5 delta.
3. Apply builds the flow in the `motion-muse` repo on published MVDS; any
   DS-side change it forces lands here in `src/` with stories and the four
   gates green.

## Capabilities

### New Capabilities

- *(none presumed — the flow should compose `input`, buttons, and layout
  primitives as shipped; if discovery or design proves a real DS gap, e.g.
  form validation/feedback states, it gets named then — hard cap of 2)*

### Modified Capabilities

- `input`: first real consumer exercise; spec deltas only if the flow exposes
  behavior the current spec doesn't cover.

## Impact

- `~/Documents/code/motion-muse` — the signup flow itself (App.tsx + FINDINGS.md
  round-2 log). Evaluation subject *and* apply target for the consumer half.
- `openspec/changes/motion-muse-signup-flow/` — the artifact chain, including
  the first `discovery.md` on the mvds-default schema.
- `src/` + Storybook — only if a DS gap is proven; bounded by the capability
  budget above.
- `openspec/changes/adding-eval-gate/tasks.md` — outcome checkboxes earned by
  this run get checked with a pointer here.

## Optional links

- Round-1 findings & 0.4.0 migration log: `motion-muse/FINDINGS.md` (consumer repo)
- Input spec: `openspec/specs/input/spec.md`
- Eval stage definition: `openspec/schemas/mvds-default/schema.yaml`
- House rules: `AGENTS.md`
