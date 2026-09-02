# improve-manifests-ia — discovery

## As-is (0.0)

> The current surface, captured before any proposal exists.

| Item | Value |
| --- | --- |
| Storybook story (eval target) | `Site/ManifestDashboard` — `LiveSnapshot` (the committed snapshot the landing page ships), inspected in both modes at 1024 and 480 |
| Figma `0.0 As is` page | <https://www.figma.com/design/4wjZheQYLfBAVQ8nWn1YRR> — file "HF MVDS Manifests IA", page `0.0 As is`, frames `L 1024 / light` · `L 1024 / dark` · `S 480 / light` · `S 480 / dark`. Colors, radii, spacing, and type bound to MVDS Core by key (`boundVariables` verified non-null); dark frames carry an explicit Tokens→Dark mode. No hand-mirrored values — every rendered property is a Core variable or text style. (Build note: mode-flipped *clones* render stale in this environment; dark frames were built fresh with the explicit mode set before children — recorded for future HF builds.) |
| Scope note | The surface is the `ManifestDashboard` section (`src/components/site/manifest-dashboard.tsx` + `src/generated/manifest-snapshot.json`) — the six manifest cards and their header. Adjacent landing sections (`PrinciplesPanel`, `VerificationPanel`, `FigmaMirror`, `PackageDocs`) render other slices of the same snapshot and are context: duplication and vocabulary drift across them is part of what this change addresses. The snapshot's `gates` array (five verification gates) is rendered by `VerificationPanel`, not by the dashboard — the enforcement story and the manifest inventory currently live in different sections. |

## Eval (0.5)

> Produced by an isolated subagent (surface + rubric only — no proposal
> rationale, no prior findings). Rubric = every `principles.config.mjs` record
> with an `evalLens` (the ten adopted heuristics + `no-runts`). Scores are
> summary color only; the findings are the artifact. This baseline is cached —
> proposal iterations re-run only the Delta (1.5).

| # | Violation | Rubric item (record id) | Predicted consequence | Severity |
| --- | --- | --- | --- | --- |
| F1 | The intro legend says "Amber means the mirror has yet to catch up; only red means something genuinely disagrees," but no amber exists anywhere on the surface: every trailing/neutral status ("29 commits behind", "not synced", "synced 134/137", "code-only", "uncommitted changes") renders as a pure-gray badge (`--neutral`: zero chroma, both modes). The interpretive key describes a color system the dashboard doesn't use. | match-system-and-real-world | A reader scans for amber, finds none, and concludes nothing is trailing — when five statuses are; the one sentence meant to teach the status model actively mismaps it. | major |
| F2 | One gray badge expression covers four unlike meanings: "no Figma mapping applies, ever" (code-only), "trailing by design, will sync" (29 commits behind / not synced / synced 134/137), and "snapshot generated from a dirty tree" (uncommitted changes). The designed-forever states and the waiting-on-a-sync states are distinguishable only by parsing each label's prose. | consistency-and-standards | The at-a-glance triage the section promises collapses to reading every badge; a reader can't tell which grays will ever change and which never will. | major |
| F3 | Row 1 of the grid pairs the two longest cards — Principles (20 item rows) and Figma component manifests (17 rows) — with the itemless Conventions card, which stretches `h-full` to match: roughly a full viewport of empty card below four badges, both modes. The "source of truth" card (Token layer) is buried in row 2. | aesthetic-and-minimalist-design | The first screenful is dominated by two raw ID lists and a column of dead whitespace; the manifest a reader most needs to orient on is below the fold of the section. | major |
| F4 | The Principles card re-lists all 20 principle ids as item rows with implementation-taxonomy meta ("forbid-source · error", "guiding · error") — a full duplicate of the Design-principles section earlier on the same page (which renders the same 20 records with titles, descriptions, and source links), and the card's four count badges already summarize them. | aesthetic-and-minimalist-design | The longest element in the dashboard adds nothing a reader hasn't been shown better, and dilutes the section's actual new information (code-vs-Figma state) with a second, worse dialect of content from two sections up. | major |
| F5 | The only explanatory/recovery copy for statuses — `status.detail` ("No Figma mapping applies.", "code-first, the mirror trails until the next requested sync", "Rules, not synced state.") — renders exclusively as a `title` attribute on the badge ([manifest-dashboard.tsx:27](../../../src/components/site/manifest-dashboard.tsx)): hover-only, invisible on touch, keyboard, and to screen readers, with no affordance a tooltip exists. | help-and-documentation | Most readers (and all assistive-tech and touch users) never see the sentence that explains why "29 commits behind" is fine; the badge label carries a judgment the reader can't check in context. | major |
| F6 | Three words for one concept on one page: dashboard item rows say "guiding", the Principles card count badge says "by judgment", and the Design-principles section's badges say "judgment" — all naming the same non-automated enforcement class. | consistency-and-standards | A reader (or agent) cross-referencing the sections must infer that guiding = judgment = by judgment; the counts stop being obviously reconcilable. | minor |
| F7 | Every judgment-enforced principle row reads "guiding · error" — a severity of "error" attached to rules that by definition never fail anything. The two halves of the meta contradict each other in the reader's language. | match-system-and-real-world | Readers either distrust the "error" label or wrongly conclude these rules fail builds; agents parsing the surface inherit the same ambiguity. | minor |
| F8 | Grammatical count mismatch in three item rows of the components card: Label, Textarea, and Blockquote read "0 axes · 1 variants". | match-system-and-real-world | Reads as generator output rather than considered copy; on a page arguing the system is "done and organized," un-pluralized counts undercut the claim. | minor |
| F9 | Runts — on the card that itself lists `no-runts`: at 1024 the Principles description strands "hook." and Conventions strands "style."; at 480 the section h2 strands "about itself" (no balanced wrapping) and the intro paragraph ends with "genuinely disagrees." alone. | no-runts | The surface visibly violates a principle it displays two hundred pixels away. | minor |
| F10 | Item-row status badges jump position with meta length: short-meta rows get right-aligned badges on the name line while long-meta rows wrap the badge to its own full-width line below — two placements alternating within one list, at both 480 and 1024. | consistency-and-standards | The eye can't scan a single badge column to find the "not synced" rows; identical status objects live in two different places depending on path length. | minor |
| F11 | The Token layer card pairs a green "light/dark parity" status with count badges directly beneath reading "63 light tokens · 36 dark tokens" — an unexplained asymmetry under a parity claim (this status has no `detail`, so no tooltip either). | match-system-and-real-world | A careful reader sees "parity" contradicted by the adjacent numbers and can't resolve it; trust in the generated statuses drops exactly where the surface claims its strongest success. | minor |
| F12 | Nothing on the dashboard is actionable: manifest paths are plain text with no repo links (sibling sections do link out), and there are no anchors between the Principles card and the Design-principles section, or the Figma-lock card and the Figma-mirror section it summarizes. | flexibility-and-efficiency-of-use | Engineers and agents who came to open the manifest must reconstruct the GitHub URL by hand; readers can't jump from summary to the detail that already exists on the same page. | minor |
| F13 | The header meta line gives sync date and commit but omits the one number that quantifies staleness — 29 commits behind — which surfaces only as the Figma lock card's badge, sixth card in the grid. | visibility-of-system-status | The decision-relevant magnitude of drift is invisible at the point where the drift is introduced and excused. | minor |
| F14 | The "uncommitted changes" badge reports that the snapshot was generated from a dirty tree on 2026-08-25, but its placement beside "Generated … · commit …" with no qualifier reads as a live claim about the repo now; its meaning is stated nowhere on the surface. | visibility-of-system-status | Readers act on a stale, ambiguous status — dismissing a real caveat or hunting for uncommitted work that has since shipped. | minor |
| F15 | The `kind` badge (outline: "enforcement", "figma mirror", "lock file") sits first in the same Inline row as the muted count badges — near-identical pill styling for a taxonomy label vs metrics; at 480 the kind reads as just another count in the run. | recognition-rather-than-recall | The card's classification — the thing that organizes the whole section — is not recognizable as such; readers must recall that the first pill is a category, not a stat. | minor |

**Per-rubric summary (color only):**

| Rubric item | Color | Note |
| --- | --- | --- |
| visibility-of-system-status | yellow | generated date/commit/sync/dirty all surfaced from data (good); drift magnitude buried (F13), dirty badge ambiguous and stale-reading (F14) |
| match-system-and-real-world | **red** | the status legend describes an amber that doesn't render (F1); "guiding · error" (F7), "1 variants" (F8), "parity" beside 63/36 (F11) compound it |
| user-control-and-freedom | green | read-only surface, no actions, no traps |
| consistency-and-standards | yellow | one gray expression for four unlike states (F2); three names for one enforcement class (F6); badge placement jumps (F10) |
| error-prevention | green | statuses generated from data rather than hand-written — prevention working as intended |
| recognition-rather-than-recall | yellow | internal taxonomy shown raw; category badges indistinguishable from count badges (F15) |
| flexibility-and-efficiency-of-use | yellow | no accelerators at all on an informational surface — no links from paths, no anchors to sibling sections (F12) |
| aesthetic-and-minimalist-design | **red** | a viewport of empty stretched card with the source-of-truth card buried (F3); a 20-row duplicate of the principles section in a worse dialect (F4) |
| error-recovery | yellow | constructive copy for non-green states exists only as hover tooltips (F5) |
| help-and-documentation | yellow | good in-context intro paragraph; per-status explanations hover-only, unreachable by touch/keyboard/screen reader (F5) |
| no-runts | yellow | four evidenced runts across both breakpoints, including the section h2 at 480 (F9) |

**Figma `0.5 Eval` page:** <https://www.figma.com/design/4wjZheQYLfBAVQ8nWn1YRR>
— page `0.5 Eval` (after `0.0 As is`): frames `L 1024 / eval` + `S 480 / eval`
(pinned duplicates, bindings intact; F1–F15 pinned on the L frame, the
480-specific F9/F10/F15 re-pinned on the S frame) and boards `Findings ledger`
· `Per-rubric summary` · `0.6 Eval Summary`. Annotation layer per the
`rules/figma.mdc` stage model — this markdown stays canonical.

## Eval Summary (0.6)

> Generation input for the design proposal — not a report.

**Top issues to fix:**

1. **Fix the status vocabulary (F1, F2).** The legend teaches an amber that
   never renders, and one gray covers four unlike meanings. The taxonomy needs
   status classes that visibly separate *never-applies* / *trailing-by-design*
   / *genuine drift* — and the founder's anchor already says why this matters
   beyond color: statuses are the enforcement story's surface.
2. **Make the taxonomy visible (F3, F4, F15).** The source-of-truth card is
   buried in row 2, the kind label reads as another count pill, and the
   biggest card duplicates a sibling section raw. Organize the manifests by
   their role in the system — not accretion order — and let the layout carry
   that grouping.
3. **Surface the enforcement story accessibly (F5, F6, F7).** What is checked,
   by which gate, and how must be readable inline — not hover-only `title`
   tooltips and self-contradicting meta ("guiding · error") — with one
   vocabulary for the enforcement classes across all sections. Note the
   structural gap from the scope note: the five gates and the six manifests
   live in different sections with no declared relationship; the design should
   decide how a manifest names its gate.
4. **Link summary to detail (F12, F13).** Paths link to the repo, cards anchor
   to their detail sections, and drift magnitude appears where drift is
   introduced.

**Tradeoffs worth preserving:**

- Everything rendered is generated from the snapshot — no hand-written status
  anywhere. Any restructure must keep the surface a pure projection of
  generated data.
- The intro paragraph is genuinely good in-context help.
- Real counts, truthful inventory: all six manifests appear, with real numbers.
- Read-only calm; error-prevention is green precisely because statuses are data.

**Don't-breaks:**

- The designed distinction "mirror trails by design ≠ genuine drift" must
  survive the status-vocabulary fix — F1/F2 are about making it visible, not
  removing it.
- Badge semantic triad stays token-driven and AA in both modes.
- 8-grid, layout primitives, semantic ramp, zero raw hex — the surface is
  currently token-clean; keep it that way through the redesign.
- Both modes stay first-class (stories run light + dark).

**Small fixes to fold into apply (real findings, mechanical fixes — not open
design questions):** F8 pluralization; F9 runts (`text-wrap: balance` /
`pretty`); F11 an explanation for parity-vs-63/36; F14 dirty-badge semantics.

## Status

ready for founder review
