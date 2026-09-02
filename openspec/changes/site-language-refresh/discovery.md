# site-language-refresh — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists. As-is = the landing
> page on `main` (c84e494) — the drafted branch is deliberately not the eval
> target; it is design-stage input.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | `Site/SiteHero — Default` + `Site/PrinciplesPanel — Live`; eval ran against the composed live page (`npm run dev` of `main` at 1280px and 480px, light + dark) |
| Figma `0.0 As is` page | https://www.figma.com/design/buIM7pFiGK07xzSkWNjcQw — frames `Landing 1024 — Light`, `Landing 1024 — Dark` (dark = Tokens mode flip). Fills/strokes/text bound to MVDS Core variables imported by key; type via Core `Type/*` styles. 8-grid spacing entered as literal on-grid values (Scales is a single-mode collection — no mode benefit; flagged per `rules/figma.mdc`) |
| Scope note | This change touches the hero (copy, proof line, CTAs) and the Design principles section (grouping copy + card meta), plus the README opener. Sections below principles (verification, package docs, dashboard) are out of scope and were excluded from the eval |

## Eval (0.5)

> Produced by an isolated subagent (surface + rubric only — no proposal
> rationale). Rubric = every `principles.config.mjs` record with an `evalLens`
> (11 records). Scores are summary color only; the findings are the artifact.
> This baseline is cached — proposal iterations re-run only the Delta (1.5).
> Method note: after the first screenshot the browser pane was hidden, so the
> subagent verified wrapping, contrast, and link targets through the DOM
> (line-box measurement, computed-style contrast math, live fetches).

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | "Authored here" intro claims "Every one is machine-enforced", but the tenth card in that section, "No runt stands alone", is badged **judgment** | consistency-and-standards | Reader believes every authored rule can fail a build — trusts CI for something only judgment covers | red |
| F2 | Primary CTA "Browse the gallery" and header "Storybook →" dead-end on unreachable `localhost:6006`, no in-surface recovery. *Discovery-author caveat: environment-dependent — the deployed site serves `/storybook/`; the dead end is dev-env-only. The finding stands as recorded; its weight is discounted accordingly* | error-recovery | Visitor clicks the lead CTA and gets a browser error page with no stated fallback | red |
| F3 | Two labels for one destination: "Browse the gallery" (hero) and "Storybook →" (header) both open the gallery; "gallery" never says it is Storybook | consistency-and-standards | Visitor treats them as two places; the same concept wears two names on one screen | amber |
| F4 | "Copy the starter app" performs no copy — it navigates to a GitHub directory listing | match-system-and-real-world | User expecting a scaffold/clipboard action lands on a raw repo folder | low |
| F5 | Intro promises "link back to it" / "every card links the original", but all 10 MVDS ↗ links land at AGENTS.md top and all 10 NN/g links are one identical URL — no per-rule anchors | help-and-documentation | Clicking a citation lands at the top of a long document, not the cited rule | amber |
| F6 | "NN/g H1…H10" shorthand never expanded; on a design page "H1" reads as a heading level | recognition-rather-than-recall | Reader must already know NN/g numbering to read the citation | low |
| F7 | Desktop runts (1280px, both modes): card last lines strand "everywhere.", "own rest token.", "you cannot justify." | no-runts | Stranded words break card rhythm — on a surface whose own card forbids exactly this | amber |
| F8 | 480px runts (both modes): "token.", "break." (on the no-runts card itself), "story.", "matter."; short hero tails "quietly ignores.", "drift from." | no-runts | At mobile width roughly a third of cards end on a stranded word | amber |

Per-rubric summary (color only): visibility-of-system-status **pass** · match-system-and-real-world F4 · user-control-and-freedom **pass** · consistency-and-standards F1 F3 · error-prevention **pass** · recognition-rather-than-recall F6 · flexibility-and-efficiency-of-use **pass** · aesthetic-and-minimalist-design **pass** · error-recovery F2 · help-and-documentation F5 · no-runts F7 F8. Contrast swept programmatically in both modes — all in-scope text ≥ 4.5:1; badge counts recounted against the 20 rendered cards — accurate.

**Figma `0.5 Eval` page:** https://www.figma.com/design/buIM7pFiGK07xzSkWNjcQw — frames `Eval — Landing 1024 — Light` / `Eval — Landing 1024 — Dark` with pins F1–F8, plus boards `Findings ledger (F1–F8)`, `Per-rubric summary`, `0.6 Eval Summary` (annotation layer over bound frames; this markdown stays canonical)

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

**Top issues to fix:**

1. **F1 (red):** the authored ⇒ enforced premise is false. Present enforcement truthfully per record — the section IA must give a founder-authored, judgment-held rule an honest home.
2. **F3 (+F2):** one concept, one name — unify the gallery/Storybook labeling. The localhost dead-end itself is dev-env-only (deployed `/storybook/`), but the label split stands everywhere.
3. **F7/F8:** runts at both widths — including on the no-runts card itself. The new copy needs a deliberate wrapping pass (hero and cards), verified at 1280 and 480.
4. **F5:** citations should land on the cited thing — per-rule anchors where the source supports them (AGENTS.md heading anchors; NN/g article section anchors if stable).
5. **F4/F6 (low):** CTA verbs should say what they do; expand the NN/g shorthand once (e.g. title attr or one legend line).

**Tradeoffs worth preserving:**

- Lean cards — title / description / id / source, nothing else (founder-reviewed in adding-eval-gate).
- Per-card status shown as data (badges, counts) rather than claimed in prose; counts generated, and verified accurate.
- Reversible, correctly-relabeled theme toggle.

**Don't-breaks:**

- Token-bound color — AA 4.5:1 both modes (verified clean in this eval; keep it that way).
- Counts stay generated from the manifest snapshot, never hand-written.
- A source line on every adopted card (a citation-less external rule is not a citation).
- Single h1 on the page; no horizontal overflow at 480.

## Status

ready for founder review
