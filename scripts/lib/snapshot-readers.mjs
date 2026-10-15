// No-orphan-output gate for the manifest snapshot (R1–R2).
//
// `commitsBehind` was computed by the generator, declared in
// manifest-snapshot.types.ts, and read by NOTHING. It survived like that for
// months, and worse: twice during the 2026-10-13 Figma syncs I justified a
// re-stamp of figma.lock.json by claiming it would make "the landing page's
// commitsBehind" honest — a page that has never rendered the field. A tsc pass
// cannot see this; an unread field typechecks perfectly.
//
// So the generator now has to prove the other half. Every key it emits must
// either be NAMED somewhere under src/, or sit in the census below with a
// reason. Three states, no silence — the same shape as conventions' and the
// lock's `notMirrored`.
//
// LIMIT, stated plainly: reader evidence is by NAME, not by resolved type, so a
// key whose name collides with an unrelated identifier (`label`, `items`) reads
// as covered when it might not be. That is a deliberate trade: a precise check
// needs the type graph, and a name-based one still catches the case this exists
// for — a field NOBODY ever named. Where it is weak it is weak toward passing a
// live field, never toward failing a good one.
//
// Note the app reads the JSON through a cast to `ManifestSnapshot`, so an
// emitted key with no entry in the interface is unreachable from the page at
// all; R1 reports it as the orphan it is without needing to parse the types.

/**
 * Keys the generator emits deliberately, for a reader that is not the page.
 * A reason is required, and R2 fails an entry that has become stale.
 */
export const EMITTED_BUT_UNREAD = {
  generatedAt:
    "Provenance inside the committed artifact. The snapshot is deterministic per commit, so this is the HEAD commit date, not wall clock — it is what makes a snapshot diff legible in review and lets anyone reading the JSON date it without reaching for git. Never rendered: the page dates itself from `commit`.",
  dirty:
    "Build-integrity flag. True means the snapshot was generated from a tree with uncommitted changes, i.e. it does not describe any commit. Its reader is the human reviewing a snapshot diff — a `dirty: true` landing in a PR is the signal that someone committed a local-only regen. Deliberately not rendered; the page must not show a half-state as fact.",
  syncedFromCommit:
    "The commit the Figma mirror reflects, carried through from figma.lock.json. The page renders only `syncedAt` (figma-mirror.tsx), because a date is what a visitor can use; the SHA is for whoever wants to diff code against the mirror, and check:figma's S5 holds it to being a real commit.",

  // The three principle fields the cards deliberately do not show. The reason
  // is already written in prose at the top of principles-panel.tsx: these are
  // data for their consumers — docs, agents, the discovery eval — not card
  // copy. The snapshot is a committed artifact, not only page input.
  rationale:
    "Per-principle WHY, published for docs and agents rather than rendered. principles-panel.tsx states this outright: `rationale` and `evalLens` are data for their consumers, not card copy — a card that recited both would bury the rule it is there to state.",
  severity:
    "The manifest's error/warn/off level. The page shows the honest distinction a reader can act on — `enforcement`: automated (a check fails the build) vs judgment — and severity is the gate's own dial, read by principles.config.mjs and check:principles, not by a visitor.",
  checkKind:
    "Which machine check backs a principle (forbid-source, forbid-classname, require-sibling-file, guiding). Published so an agent can tell a regex-enforced rule from a guiding one without loading the manifest; the page says automated-vs-judgment instead, which is the same split in the reader's terms.",
}

/** Every distinct key name anywhere in the snapshot. */
export function snapshotKeys(snapshot) {
  const keys = new Set()
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== "object") return
    for (const [k, v] of Object.entries(node)) {
      keys.add(k)
      walk(v)
    }
  }
  walk(snapshot)
  return keys
}

/** Is `key` named as a read anywhere in this source text? */
function isRead(text, key) {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(
    // property access · bracket access · named inside a braced binding/literal
    `\\.${k}\\b|\\[\\s*["'\`]${k}["'\`]\\s*\\]|\\{[^{}]*\\b${k}\\b[^{}]*\\}`
  ).test(text)
}

/**
 * R1/R2 over an emitted snapshot.
 * `sources` is [{ file, text }] for the app's own code — NOT the generator, not
 * src/generated, and not the types file (a declaration is not a reader).
 * Returns a list of problem strings; empty means clean.
 */
export function checkSnapshotReaders(snapshot, { sources, carveOuts = EMITTED_BUT_UNREAD }) {
  const problems = []
  const keys = snapshotKeys(snapshot)
  const readerOf = (key) => sources.find(({ text }) => isRead(text, key))?.file ?? null

  for (const key of [...keys].sort()) {
    if (readerOf(key)) continue
    if (key in carveOuts) continue
    problems.push(
      `R1: the snapshot emits \`${key}\` but nothing under src/ ever names it — give it a reader, delete it, or add it to EMITTED_BUT_UNREAD in scripts/lib/snapshot-readers.mjs with the reason it is written anyway (see \`commitsBehind\`, which lived here unread for months)`
    )
  }

  for (const [key, reason] of Object.entries(carveOuts)) {
    if (!keys.has(key)) {
      problems.push(
        `R2: EMITTED_BUT_UNREAD carves out \`${key}\`, which the snapshot no longer emits — delete the entry`
      )
      continue
    }
    const reader = readerOf(key)
    if (reader) {
      problems.push(
        `R2: EMITTED_BUT_UNREAD carves out \`${key}\` as unread, but ${reader} reads it — delete the entry`
      )
    }
    if (typeof reason !== "string" || reason.trim().length < 20) {
      problems.push(
        `R2: EMITTED_BUT_UNREAD[\`${key}\`] has no real reason — a carve-out without one is a silence with a key`
      )
    }
  }
  return problems
}
