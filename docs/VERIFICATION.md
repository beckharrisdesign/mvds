# How we enforce

MVDS doesn’t rely on “please remember the rules.” The same intent — tokens,
spacing, stories, contrast — shows up at a few natural moments in the work.
Each moment is a gate. Miss one and a later one usually catches you.

This is the tour. The rules themselves live in [`AGENTS.md`](../AGENTS.md);
this page is only *when* they get checked.

---

## While planning

Before anyone writes UI, the system already says what “good” looks like.

- **House rules** in [`AGENTS.md`](../AGENTS.md) — spacing, tokens, layout
  primitives, Storybook as the verification surface.
- **Principles as data** in [`principles.config.mjs`](../principles.config.mjs) —
  each golden rule is a record (what it forbids, where it applies, how to fix
  it). Some are machine-checkable; some are judgment calls (the NN/g
  heuristics) that agents and humans still have to *decide*.
- **Tokens in one place** — [`src/index.css`](../src/index.css) is the color,
  type, and spacing source of truth. Planning a brand change means planning a
  token change, not a hunt through components.

If it isn’t encoded here, it isn’t a rule the repo can hold you to later.

---

## While coding

Checks that fire while the work is still on your machine — ideally before you
even think about a PR.

**As you type (agents).** Edit a source file and the principle guard re-runs
the golden-rule scan on that file. Edit the token layer and the contrast check
runs immediately (and reminds you Figma is now stale). Same scripts CI will
use — just earlier.

**When you think you’re done.** Run the ship gate locally:

```bash
npm run build
npm run check:contrast
npm run check:principles
npm test
```

That’s typecheck + build, token contrast (light and dark), the principle
manifest, and every Storybook story in real Chromium with accessibility
checks — again in light and dark.

**Before the commit lands on the wrong branch.** A local git hook blocks
commits straight to `main` and nudges branch names toward `feat/…`, `fix/…`,
and friends. That’s workflow hygiene, not a quality check.

ESLint is there for ordinary JS/TS hygiene. It is *not* how we enforce the
design-system golden rules — those ride the principle script above.

---

## While testing

Once the branch is on GitHub, the repo re-runs the spine and adds a few checks
that only make sense remotely.

**On every PR (must pass).** Build the app and the publishable library. Re-run
token contrast and principles. Check that the Figma component manifest still
matches the code. Run the full Storybook suite in Chromium — light and dark,
render + interaction + axe.

**Also on every PR (still must pass, separate jobs).** Walk the path a
newcomer actually takes: install the package into the starter (no special
auth) and prove the CSS came out right. Ping the public Figma share URL so a
revoked “anyone with the link” setting can’t silently rot.

**Visual diffs (advisory).** Chromatic snapshots Storybook for pixel-level
regressions. Humans review those; they don’t block the merge on their own.

“Enforced” on a principle means the static scan (`check:principles`) — pattern
and file checks over source. Storybook in Chromium is the other half: does it
*look and behave* right, with real contrast in the DOM? Both matter; they
catch different mistakes.

---

## Out in the world

Shipping isn’t the end of the story — it’s when strangers meet the package.

**Publish.** A version tag kicks off npm publish. The tag must match
`package.json`, and packing the tarball rebuilds the library so what lands on
the registry isn’t a stale build.

**After it’s published.** The consumer-path check in CI keeps exercising the
documented install against what’s on npm (with a local-pack fallback when a
release PR bumps the pin before the version exists). That’s how we notice the
README’s two-step install stopped working for a real app.

Figma Core stays a **one-way mirror** — updated when someone asks, not on every
commit. The share-link check only proves the public URL still opens; it doesn’t
re-sync the file.

---

## One spine, four moments

| Moment | What you’re trusting |
| --- | --- |
| While planning | Rules and tokens written down as data |
| While coding | Edit guards + the local ship gate |
| While testing | CI + Storybook/Chromium (+ Chromatic for eyes) |
| Out in the world | Publish integrity + the stranger’s install path |

Nothing here invents a second policy. Later gates re-apply earlier ones, then
add the checks that only work once the code has left your laptop.
