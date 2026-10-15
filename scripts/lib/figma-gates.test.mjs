// Proof for the system-level Figma gates — the half that was missing.
//
// Every check here was written against a bug that had already shipped, and
// each case below is the bug: feed the gate the broken input and assert it
// says so. The rule (AGENTS.md) is that a new check in scripts/ arrives with a
// case that FAILS WITHOUT IT — delete the check and a test goes red, which is
// the only way to know the check is doing anything.
//
// Why assert on the error RECORDS and not an exit code: the throwaway harness
// that found the S4 date bug asserted only on `process.exitCode`, so when the
// fix crashed the gate with a RangeError it scored the crash as a pass. These
// tests read what the check actually said.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  checkConventionMappings,
  checkSyncStamps,
  checkTypography,
  conventionMappings,
} from "./figma-gates.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (p) => readFileSync(join(ROOT, p), "utf8")
const readJson = (p) => JSON.parse(read(p))

const { conventions } = await import(new URL("../../figma/conventions.mjs", import.meta.url))
const realLock = readJson("figma/figma.lock.json")
const realCss = read("src/index.css")
const realPkg = readJson("package.json")

/** Run a check over a disposable copy of an input and return what it said. */
function collect(fn) {
  const errors = []
  const warns = []
  fn(errors, warns)
  return {
    errors,
    warns,
    errorText: errors.map((e) => e.message).join("\n"),
    warnText: warns.map((w) => w.message).join("\n"),
  }
}

// ---------------------------------------------------------------------------
// S1–S6 — the sync-stamp provenance blocks
// ---------------------------------------------------------------------------

const TODAY = "2026-10-13"

/** A lock whose stamps are entirely in order — the baseline each case breaks. */
const goodLock = () => ({
  syncedAt: TODAY,
  syncedFromCommit: "a".repeat(40),
  tokenSync: {
    verifiedAt: TODAY,
    verifiedFromCommit: "b".repeat(40),
    result: "no-op",
    checked: { mismatches: 0 },
  },
  componentSync: {
    verifiedAt: TODAY,
    result: "written",
    checked: { mismatches: 0 },
  },
})

const stamps = (lock, env = {}) =>
  collect((errors, warns) =>
    checkSyncStamps(errors, warns, lock, { today: TODAY, commitExists: null, ...env })
  )

describe("checkSyncStamps", () => {
  it("passes a lock whose stamps are all in order", () => {
    const { errors, warns } = stamps(goodLock())
    expect(errors).toEqual([])
    expect(warns).toEqual([])
  })

  it("S1: warns (does not fail) when a sync has never recorded a stamp", () => {
    const lock = goodLock()
    delete lock.tokenSync
    const { errors, warnText } = stamps(lock)
    expect(errors).toEqual([])
    expect(warnText).toContain("S1")
    expect(warnText).toContain("tokenSync")
  })

  it("S2: rejects a `result` outside the vocabulary", () => {
    const lock = goodLock()
    lock.tokenSync.result = "all good!"
    expect(stamps(lock).errorText).toContain("S2")
  })

  it("S2: rejects a stamp that never says how much disagreed", () => {
    const lock = goodLock()
    delete lock.componentSync.checked.mismatches
    expect(stamps(lock).errorText).toMatch(/S2.*mismatches/s)
  })

  it("S3: rejects a stamp recording drift it then left in place", () => {
    const lock = goodLock()
    lock.tokenSync.checked.mismatches = 3
    expect(stamps(lock).errorText).toContain("S3")
  })

  it("S4: rejects a digit-shaped date that is not a real calendar day", () => {
    // "2026-13-45" passes /\d{4}-\d{2}-\d{2}/ and string-compares later than
    // today, so the first version of S4 reported it as "in the future" — and
    // the round-trip fix then threw RangeError out of Date.toISOString().
    const lock = goodLock()
    lock.tokenSync.verifiedAt = "2026-13-45"
    const { errorText } = stamps(lock)
    expect(errorText).toContain("not a real ISO")
    expect(errorText).not.toContain("in the future")
  })

  it("S4: rejects a stamp dated after today", () => {
    const lock = goodLock()
    lock.tokenSync.verifiedAt = "2099-01-01"
    expect(stamps(lock).errorText).toContain("in the future")
  })

  it("S5: rejects an abbreviated SHA on shape alone, with no repo to ask", () => {
    const lock = goodLock()
    lock.tokenSync.verifiedFromCommit = "b".repeat(7)
    expect(stamps(lock).errorText).toMatch(/S5.*40-character/s)
  })

  it("S5: rejects a well-shaped SHA that names no commit, when history can answer", () => {
    const { errorText } = stamps(goodLock(), { commitExists: () => false })
    expect(errorText).toContain("not a commit in this repository")
  })

  it("S5: skips resolvability on a shallow clone rather than failing in CI", () => {
    // CI checks out at depth 1, so the commit a stamp names is normally absent
    // there. Asking anyway would fail every CI run for environmental reasons.
    const { errors } = stamps(goodLock(), { commitExists: null })
    expect(errors).toEqual([])
  })

  it("S6: rejects a componentSync stamp that disagrees with the top-level one", () => {
    // #85: the Figma push happened, the top-level stamp moved, the map did not.
    const lock = goodLock()
    lock.componentSync.verifiedAt = "2026-09-01"
    expect(stamps(lock).errorText).toContain("S6")
  })
})

// ---------------------------------------------------------------------------
// T1–T8 — the font family as a token, checked against the real repo
// ---------------------------------------------------------------------------

const typography = (over = {}) =>
  collect((errors, warns) =>
    checkTypography(errors, warns, {
      conventions,
      indexCss: realCss,
      pkg: realPkg,
      lock: realLock,
      ...over,
    })
  )

describe("checkTypography", () => {
  it("passes against the repo as it stands", () => {
    expect(typography().errors).toEqual([])
  })

  it("T2: catches --font-sans moving in code without the record moving too", () => {
    const indexCss = realCss.replace(/--font-sans:\s*'[^']+'/, "--font-sans: 'Geist Variable'")
    expect(typography({ indexCss }).errorText).toContain("T2")
  })

  it("T3: catches a font package that is imported but not depended on", () => {
    const pkg = structuredClone(realPkg)
    delete pkg.dependencies?.[conventions.typography.fontFamily.package]
    delete pkg.devDependencies?.[conventions.typography.fontFamily.package]
    expect(typography({ pkg }).errorText).toContain("T3")
  })

  it("T6: warns (does not fail) on a lock that predates the typography block", () => {
    const lock = structuredClone(realLock)
    delete lock.typography
    const { errors, warnText } = typography({ lock })
    expect(errors).toEqual([])
    expect(warnText).toContain("T6")
  })

  it("T7: catches Figma holding a different font family than the record declares", () => {
    const lock = structuredClone(realLock)
    lock.typography.textStyles["Type/Body"].fontFamily = "Geist"
    expect(typography({ lock }).errorText).toContain("T7")
  })

  it("T8: catches a heading style silently rebound to the body font variable", () => {
    // The destructive case, and the reason T7 is not enough: both variables
    // resolve to "Inter" while --font-heading aliases --font-sans, so the
    // resolved-value check stays green and the damage only appears once a
    // brand gives the heading face its own family.
    const lock = structuredClone(realLock)
    const display = lock.typography.textStyles["Type/Display"]
    expect(display.boundVariable).toBe("Typography/font-heading")
    display.boundVariable = "Typography/font-sans"
    expect(display.fontFamily).toBe(realLock.typography.textStyles["Type/Display"].fontFamily)

    const { errorText } = typography({ lock })
    expect(errorText).toContain("T8")
    expect(errorText).toContain("Type/Display")
  })

  it("T8: requires every ramp step to declare which font token it binds", () => {
    const conv = structuredClone(conventions)
    delete conv.typography.fontTokenByStep["text-h2"]
    expect(typography({ conventions: conv }).errorText).toMatch(/T8.*text-h2/s)
  })
})

// ---------------------------------------------------------------------------
// M0–M6 — the closed mappings, resolved against code and the lock
// ---------------------------------------------------------------------------

const sources = [
  { file: "src/components/ui/thing.tsx", text: 'cn("bg-destructive/10 bg-muted/50")' },
]

const mappings = (over = {}) =>
  collect((errors, warns) =>
    checkConventionMappings(errors, warns, {
      conventions,
      indexCss: realCss,
      lock: realLock,
      sources,
      ...over,
    })
  )

/** A conventions clone, for breaking one record at a time. */
const conv = () => structuredClone(conventions)

describe("checkConventionMappings", () => {
  it("finds every closed mapping by shape", () => {
    expect(conventionMappings(conventions).map((m) => m.path)).toEqual([
      "color.tints",
      "radius",
      "spatial.chrome",
      "spatial.zLayers",
    ])
  })

  it("passes against the repo as it stands", () => {
    // The real src/ is censused by the CLI; `sources` here is a stand-in that
    // only uses mapped tokens, so M5 has nothing to say.
    expect(mappings().errors).toEqual([])
  })

  it("M0: fails a mapping whose source kind it does not understand", () => {
    // The point of M0: an unrecognised record must FAIL, not be skipped. A
    // mapping nobody checks is the defect these checks exist for.
    const c = conv()
    c.spatial.chrome.source = { kind: "vibes", pattern: "--chrome-{name}" }
    expect(mappings({ conventions: c }).errorText).toMatch(/M0.*spatial\.chrome/s)
  })

  it("M0: fails a pattern with no {name} placeholder", () => {
    const c = conv()
    c.spatial.zLayers.target.pattern = "Sizing/z-chrome"
    expect(mappings({ conventions: c }).errorText).toMatch(/M0.*spatial\.zLayers/s)
  })

  it("M0: fails when conventions has no closed mapping left at all", () => {
    expect(mappings({ conventions: { color: { fill: "bg-{token}" } } }).errorText).toContain("M0")
  })

  it("M1: catches a mapping whose source token does not exist — the #124 shape", () => {
    // #124 exactly: the z-layer tokens were renamed to --z-index-*, the mapping
    // kept saying z-{level}, and nothing resolved the sentence so nothing noticed.
    const c = conv()
    c.spatial.zLayers.source.pattern = "--z-{name}"
    const { errorText } = mappings({ conventions: c })
    expect(errorText).toContain("M1")
    expect(errorText).toContain("--z-chrome")
  })

  it("M2: catches a mapping whose Figma variable is not recorded", () => {
    // A rename on the Figma side, or a mapping that was never true: this
    // record claimed `Sizing/radius` until 2026-10-15, a name the lock has
    // never held — M0 catches that particular one first (no {name} to expand),
    // so use the templated form here.
    const c = conv()
    c.radius.target.pattern = "Sizing/corner-{name}"
    expect(mappings({ conventions: c }).errorText).toMatch(/M2.*Sizing\/corner-sm/s)
  })

  it("M3: catches a new token in the family that no member claims", () => {
    const indexCss = realCss.replace("--z-index-toast:", "--z-index-tooltip: 500;\n    --z-index-toast:")
    expect(mappings({ indexCss }).errorText).toMatch(/M3.*tooltip/s)
  })

  it("M4: catches a variable in the lock that no member claims", () => {
    const lock = structuredClone(realLock)
    lock.spatialVariables["Sizing/chrome-inline-width"] = "VariableID:1:1"
    expect(mappings({ lock }).errorText).toMatch(/M4.*chrome-inline-width/s)
  })

  it("M5: catches an alpha utility in code with neither a mapping nor a carve-out", () => {
    const text = 'cn("dark:bg-ring/30")'
    const { errorText } = mappings({ sources: [{ file: "src/x.tsx", text }] })
    expect(errorText).toContain("M5")
    expect(errorText).toContain("bg-ring/N")
  })

  it("M5: accepts a declared carve-out, and fails one that went stale", () => {
    const text = 'cn("dark:bg-input/30")'
    expect(mappings({ sources: [{ file: "src/x.tsx", text }] }).errors).toEqual([])

    const c = conv()
    c.color.tints.members.push("input") // now mapped AND carved out
    expect(mappings({ conventions: c }).errorText).toMatch(/M5.*stale/s)
  })

  it("M5: fails a carve-out whose reason is a placeholder", () => {
    const c = conv()
    c.color.tints.notMirrored.input = "n/a"
    expect(mappings({ conventions: c }).errorText).toMatch(/M5.*no real reason/s)
  })

  it("M6: catches a px fallback that disagrees with the token layer", () => {
    // Rebase the ramp in code and the recorded raw values are wrong — which is
    // what a sync would then write into Figma.
    const indexCss = realCss.replace("--radius: 0.625rem", "--radius: 0.5rem")
    const { errorText } = mappings({ indexCss })
    expect(errorText).toContain("M6")
    expect(errorText).toContain("computes to 8px")
  })

  it("M6: catches a px entry for something that is not a member", () => {
    const c = conv()
    c.radius.px["2xl"] = 18 // the phantom step this record used to carry
    expect(mappings({ conventions: c }).errorText).toMatch(/M6.*2xl/s)
  })
})
