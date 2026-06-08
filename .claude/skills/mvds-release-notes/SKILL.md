---
name: mvds-release-notes
description: Draft a release-notes entry for the most recently merged PR in beckharrisdesign/mvds. Surfaces founder intent, classifies the change, and links every related artifact (commits, Figma, Chromatic, Storybook). Post as a PR comment.
---

# MVDS release-notes drafter

## Steps

1. **Find and read the PR.** Use `mcp__github__list_pull_requests` (state: closed,
   sort: updated, desc, limit 5) to identify the most recently merged PR. Then read
   its title, description, and full diff before proceeding — classification must be
   based on what the code actually changed, not just the title.

2. **Classify the change.** Decide:
   - **Internal-only** (tests, CI, build tooling, comments, dead-code removal, pure
     refactors with no behavior change) → post a single comment:
     `Internal change — no release note.` Stop here.
   - **User-visible** (new feature, behavior change, bug fix, breaking change,
     new script/command contributors use) → continue.

3. **Draft the entry in two parts.**

   **Prose (2–4 sentences):**
   - Sentence 1 — **founder intent**: name the principle or commitment this change
     reflects (e.g. accessibility as a baseline, not a polish step; design fidelity
     between code and Figma; build confidence through automated gates). Write it for
     a mixed audience — a user who benefits, an investor evaluating the product, a
     future collaborator understanding what we stand for. Do not start with the
     feature name; start with the intent.
   - Sentences 2–3 — **what changed**: describe concretely what is new or fixed and
     what people can now do or rely on. Imperative voice. No file paths, function
     names, commit SHAs, internal codenames, or technical jargon in the prose.

   **Related (links, gathered from the PR and its checks):**
   - **Commits** — link each commit SHA referenced or included in the PR.
   - **Figma** — link to the Figma file or frame if the PR references a design
     change or token sync (fileKey `C20nU0mROzk3Zr0I9BELJF` for MVDS Core).
   - **Chromatic** — link to the Chromatic build from the PR's CI checks if
     available.
   - **Storybook** — name the stories added or changed; link to a published URL
     if one exists in the PR or checks.
   - Omit any category that has no relevant artifact for this PR.

4. **Classify** under one of: `New`, `Improved`, `Fixed`, or `Breaking`.

5. **Breaking changes only:** add a `Migration` block listing exactly what users
   must do to update.

6. **Post as a PR comment** on the merged PR. Append a one-line hint:
   `Suggested changelog location: CHANGELOG.md (root)` — or the actual path if one
   exists; note if no changelog file exists yet.

## Format

```
## Release note

**{New | Improved | Fixed | Breaking}**

{Prose — 2 to 4 sentences}

**Related**
- Commits: {links}
- Figma: {link or "—"}
- Chromatic: {link or "—"}
- Storybook: {story names / link or "—"}

---
_Suggested changelog location: …_
```
