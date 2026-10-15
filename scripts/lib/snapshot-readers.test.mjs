// Proof for the no-orphan-output gate.
//
// The case that matters is the first one: a field the generator emits, types
// and nobody reads must FAIL. `commitsBehind` did exactly that for months, and
// a passing build said nothing — which is why this test exists and why the rule
// in AGENTS.md is that a new check ships with a case that fails without it.

import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  EMITTED_BUT_UNREAD,
  checkSnapshotReaders,
  snapshotKeys,
} from "./snapshot-readers.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

/** The app's own readers, the same set the generator passes in. */
function appSources(dir = join(ROOT, "src"), acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (name !== "generated") appSources(full, acc)
    } else if (/\.(ts|tsx)$/.test(name) && name !== "manifest-snapshot.types.ts") {
      acc.push({ file: full.slice(ROOT.length + 1), text: readFileSync(full, "utf8") })
    }
  }
  return acc
}

const sources = appSources()
const liveSnapshot = JSON.parse(
  readFileSync(join(ROOT, "src/generated/manifest-snapshot.json"), "utf8")
)

describe("checkSnapshotReaders", () => {
  it("passes the committed snapshot as it stands", () => {
    expect(checkSnapshotReaders(liveSnapshot, { sources })).toEqual([])
  })

  it("R1: fails a field the generator emits that nothing under src/ names", () => {
    // `commitsBehind` itself, put back: computed, typed, and read by nobody.
    const snapshot = { ...liveSnapshot, commitsBehind: 14 }
    const problems = checkSnapshotReaders(snapshot, { sources })
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain("R1")
    expect(problems[0]).toContain("commitsBehind")
  })

  it("R1: accepts a field once the app reads it", () => {
    const snapshot = { ...liveSnapshot, commitsBehind: 14 }
    const withReader = [
      ...sources,
      { file: "src/components/site/x.tsx", text: "const n = snapshot.commitsBehind" },
    ]
    expect(checkSnapshotReaders(snapshot, { sources: withReader })).toEqual([])
  })

  it("R1: the types file is excluded, because a declaration is not a reader", () => {
    // This exclusion is the gate. `commitsBehind` was declared in
    // manifest-snapshot.types.ts and typechecked perfectly for months while
    // nothing rendered it — count the declaration as evidence and the orphan
    // is invisible again.
    expect(sources.map((s) => s.file)).not.toContain(
      "src/components/site/manifest-snapshot.types.ts"
    )
    expect(readFileSync(join(ROOT, "src/components/site/manifest-snapshot.types.ts"), "utf8"))
      .toContain("generatedAt") // declared there, and still an EMITTED_BUT_UNREAD entry
    expect(Object.keys(EMITTED_BUT_UNREAD)).toContain("generatedAt")
  })

  it("R2: fails a carve-out for a field that is no longer emitted", () => {
    const problems = checkSnapshotReaders(liveSnapshot, {
      sources,
      carveOuts: { ...EMITTED_BUT_UNREAD, longGone: "a reason long enough to pass the length floor" },
    })
    expect(problems.join("\n")).toMatch(/R2.*longGone.*no longer emits/s)
  })

  it("R2: fails a carve-out for a field the app does read", () => {
    const problems = checkSnapshotReaders(liveSnapshot, {
      sources,
      carveOuts: { ...EMITTED_BUT_UNREAD, commit: "a reason long enough to pass the length floor" },
    })
    expect(problems.join("\n")).toMatch(/R2.*commit.*reads it/s)
  })

  it("R2: fails a carve-out whose reason is a placeholder", () => {
    const problems = checkSnapshotReaders(liveSnapshot, {
      sources,
      carveOuts: { ...EMITTED_BUT_UNREAD, dirty: "tbd" },
    })
    expect(problems.join("\n")).toMatch(/R2.*dirty.*no real reason/s)
  })

  it("walks nested keys, not just the top level", () => {
    const keys = snapshotKeys(liveSnapshot)
    expect(keys).toContain("generatedAt") // top level
    expect(keys).toContain("verifiedAt") // gates[].verifiedAt
    expect(keys).toContain("tally") // elements[].tally
  })
})
