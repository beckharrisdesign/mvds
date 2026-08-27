# signup-flow

## Purpose

The on-page path from interest to contact on the Motion & Muse landing page: a
visitor ready to book a discovery call or join a cohort submits their details
in a form built entirely from MVDS primitives, with honest filling, error, and
success states — the surface's proof that the system carries stateful form
patterns, not just static composition.

## Outcomes

As in [`proposal.md`](../../proposal.md): a prospective client acts without
leaving the page; the founder gets the first real consumer exercise of the
0.4.0 form primitives; DS gaps the flow exposes are shipped or logged.

## ADDED Requirements

### Requirement: Signing up happens on the page

A visitor who clicks a call-to-action reaches a signup form on the page itself
— no mail client, no leaving the site.

**Fails until:** neither CTA on the live page opens a `mailto:` link.

The page SHALL present an on-page signup form as the destination of its
call-to-action path.

#### Scenario: CTA leads to the form

- **WHEN** a visitor clicks "Book a discovery call" (hero) or the closing-band CTA
- **THEN** they land at the signup form on the same page, with the first field
  ready to receive focus — and no mail client launches

### Requirement: The form asks only for what the coach needs

The form collects a name, an email address, which offer the visitor wants,
and an optional free-text note — nothing more. *(Amended at design approval:
the 1.5 delta found the note-centric copy promised a message field the form
lacked — N1 — so the optional note joined at iteration `03.0`.)*

The form SHALL collect name, email, and offer interest — each with a visible
label, none pre-selected — plus one optional, clearly-marked note field.

#### Scenario: Filling in the form

- **WHEN** a visitor tabs through the form
- **THEN** they encounter four labeled fields — name, email, offer interest,
  and a note marked optional — each showing the system focus state, with no
  offer pre-selected unless a CTA chose one

### Requirement: Mistakes are caught inline

Submitting with a missing name or an invalid email produces a clear inline
error at the offending field, in the system's error voice.

The form SHALL validate on submit and render field-level errors using the
`destructive` status tokens, moving focus to the first invalid field.

#### Scenario: Invalid email is rejected inline

- **WHEN** a visitor submits with an empty name or a malformed email
- **THEN** an inline error message appears at that field, the field is marked
  invalid for assistive tech, and focus moves to it — the form does not clear

### Requirement: Success is confirmed on the page

A valid submission is delivered and the visitor sees an unmistakable
confirmation in place of the form.

**Fails until:** a valid submission produces a visible confirmation state
without a page reload.

The form SHALL, on valid submission, hand off the details to the destination
chosen at design time and replace itself with a confirmation message.

#### Scenario: Valid submission confirms

- **WHEN** a visitor submits a valid name, email, and interest
- **THEN** the details are delivered to the design-chosen destination and a
  confirmation replaces the form, naming what happens next

### Requirement: The flow holds up everywhere the page does

The whole flow reads correctly in light and dark, at S=480 and L=1024, on the
8-grid, at WCAG AA.

The flow SHALL render on-system — layout primitives, semantic type ramp, color
tokens — in both modes and both breakpoints, keyboard operable end to end.

#### Scenario: Both modes and breakpoints

- **WHEN** the flow is exercised in light and dark at 480px and 1024px
- **THEN** every state (idle, focus, error, success) is legible at AA contrast,
  on-grid, reachable by keyboard alone — and no heading or paragraph strands
  a terminal word or short phrase on its own line (`no-runts`)
