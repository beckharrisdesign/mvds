# How we enforce

We don’t ask anyone to memorize a style guide and hope for the best. The same
expectations — tokens, spacing, stories, contrast — show up at a few natural
points in the work. Miss one, and a later check usually catches it.

**Primary surface:** this tour ships in Storybook under **Intro → How we
enforce** (alongside Start here, Design principles, and Get started). This
markdown file is the agent-readable twin — same story, greppable in the repo.

The rules themselves live in [`AGENTS.md`](../AGENTS.md). This page is only
about *when* those checks run.

---

## While planning

Before UI gets written, we write down what “good” means so people and agents
share one picture. The house rules spell out spacing, tokens, and layout
primitives. Design principles live as structured records — what each rule is
about, where it applies, how to fix a miss — so the system can check the
mechanical ones later and leave the judgment calls (like the usability
heuristics we adopted) to humans and agents who still have to decide. Color,
type, and spacing all start in one token file
([`src/index.css`](../src/index.css)). If a brand or product change isn’t
planned there, it isn’t something the repo can hold you to afterward.

---

## While coding

While the work is still on your machine, we try to catch drift early. When an
agent edits a source file, a guard re-scans that file against the golden rules;
when someone touches the token layer, contrast is checked right away (and
you’re reminded that the Figma mirror is now stale). Before you call a change
done, you run the same ship gate CI will run: build and typecheck, token
contrast in light and dark, the principle scan, and every Storybook story in
real Chromium — again in both themes, with accessibility checks. A small git
hook also keeps commits off `main` so the work rides a branch and a PR.

Ordinary linting is still there for JavaScript hygiene; it is not how we
enforce the design-system rules.

```bash
npm run build
npm run check:contrast
npm run check:principles
npm test
```

---

## While testing

Once the branch is on GitHub, the repo runs that spine again — and adds checks
that only make sense remotely. Every pull request must build the app and the
publishable library, re-check contrast and principles, confirm the Figma
component manifest still matches the code, and run the full Storybook suite in
Chromium with accessibility. Separate jobs walk the path a newcomer actually
takes (install the package into the starter with no special auth and prove the
CSS came out right) and ping the public Figma share so a revoked link can’t
quietly rot. Chromatic takes visual snapshots for human review; those diffs
inform the conversation but don’t block the merge on their own.

One job reports rather than gates: our OpenSpec process layer — the schema, its
templates, and nine agent skills — is copied from experiment-hub, and a currency
check re-fetches the originals to say what changed upstream since we copied
them. It warns and never fails, because it describes another repo over the
network, which is no reason an MVDS pull request can’t merge.

That warning is the weaker half. A PR annotation only appears in a week someone
opens a pull request, which is how a month of upstream improvements went
unnoticed once already — so a scheduled run does the same check weekly and
opens an issue with the diff, closing it once the copy is current again. See
[`.upstream/`](../.upstream/README.md).

When we say a principle is “enforced,” we mean the static scan over source —
patterns and required story files. Storybook in the browser is the other half:
does it look and behave right, with real contrast in the DOM? They catch
different kinds of mistakes.

---

## Out in the world

Shipping is when strangers meet the package. A version tag publishes to npm;
the tag has to match the package version, and packing the release rebuilds the
library so the registry never gets a stale build. After it’s out, CI keeps
exercising the documented install against what’s actually on npm — so we notice
when the two-step “install and wire CSS” path stops working for a real app.

The Figma Core file stays a one-way mirror, updated when someone asks, not on
every commit. The share check only proves the public URL still opens.

---

## One spine, four moments

| Moment | What you’re trusting |
| --- | --- |
| While planning | Rules and tokens written down as data |
| While coding | Edit guards + the local ship gate |
| While testing | CI + Storybook in Chromium (+ Chromatic for eyes) |
| Out in the world | Publish integrity + the stranger’s install path |

Nothing here invents a second policy. Later gates re-apply earlier ones, then
add the checks that only work once the code has left your laptop.
