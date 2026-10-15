// Proof for the Vercel ignore decision.
//
// The failure that matters is the fail-open gate in reverse: an ignore step
// that skips a deploy it should have built looks exactly like a healthy skip.
// So each case asserts WHAT decideDeploy said (action, reason, triggers), and
// the list of build inputs is checked against the build scripts themselves
// rather than trusted.

import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { BUILD_INPUTS, decideDeploy, isBuildInput } from "./vercel-ignore.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const BASE = "abc1234"

describe("decideDeploy", () => {
  it("skips when only openspec change artifacts changed", () => {
    const d = decideDeploy({
      base: BASE,
      changedFiles: [
        "openspec/changes/add-table-component/proposal.md",
        "openspec/changes/add-table-component/design.md",
        "openspec/specs/table/spec.md",
      ],
    })
    expect(d.action).toBe("skip")
    expect(d.triggers).toEqual([])
    expect(d.reason).toMatch(/none of them read by the site build/)
  })

  it("skips docs-only changes", () => {
    const d = decideDeploy({
      base: BASE,
      changedFiles: ["docs/VERIFICATION.md", "README.md", "CHANGELOG.md", "AGENTS.md"],
    })
    expect(d.action).toBe("skip")
  })

  it("builds when a src/ file changed, and names it", () => {
    const d = decideDeploy({
      base: BASE,
      changedFiles: ["openspec/changes/x/tasks.md", "src/components/ui/table.tsx"],
    })
    expect(d.action).toBe("build")
    expect(d.triggers).toEqual(["src/components/ui/table.tsx"])
  })

  it("builds when a root build input changed", () => {
    for (const file of ["package-lock.json", "principles.config.mjs", "vercel.json", "figma/figma.lock.json"]) {
      const d = decideDeploy({ base: BASE, changedFiles: ["docs/a.md", file] })
      expect(d.action, file).toBe("build")
      expect(d.triggers, file).toEqual([file])
    }
  })

  it("builds when openspec/schemas changed, though the rest of openspec/ does not", () => {
    expect(
      decideDeploy({ base: BASE, changedFiles: ["openspec/schemas/mvds-default/schema.yaml"] }).action
    ).toBe("build")
    expect(
      decideDeploy({ base: BASE, changedFiles: ["openspec/config.yaml"] }).action
    ).toBe("skip")
  })

  it("builds when there is no previous deployed commit", () => {
    for (const base of [undefined, null, ""]) {
      const d = decideDeploy({ base, changedFiles: ["openspec/changes/x/proposal.md"] })
      expect(d.action).toBe("build")
      expect(d.reason).toMatch(/no previous deployed commit/)
    }
  })

  it("builds when the diff could not be computed", () => {
    const d = decideDeploy({ base: BASE, changedFiles: null })
    expect(d.action).toBe("build")
    expect(d.reason).toMatch(/could not diff abc1234\.\.HEAD/)
  })
})

describe("BUILD_INPUTS", () => {
  it("names a reader for every entry", () => {
    for (const { path, reader } of BUILD_INPUTS) {
      expect(reader, path).toBeTruthy()
    }
  })

  it("every entry resolves to something in the repo", () => {
    // A rename that leaves a dead entry would quietly under-match.
    for (const { path } of BUILD_INPUTS) {
      expect(existsSync(join(ROOT, path)), path).toBe(true)
    }
  })

  it("covers every path the snapshot generator and the gates read", () => {
    const covered = (p) => isBuildInput(p) || isBuildInput(`${p}/`)
    const read = new Set()

    const snapshot = readFileSync(join(ROOT, "scripts/generate-manifest-snapshot.mjs"), "utf8")
    for (const m of snapshot.matchAll(/join\(ROOT,((?:\s*"[^"]+",?)+)\s*\)/g)) {
      const segments = [...m[1].matchAll(/"([^"]+)"/g)].map((s) => s[1])
      read.add(segments.join("/"))
    }

    const principles = readFileSync(join(ROOT, "scripts/check-principles.mjs"), "utf8")
    const roots = principles.match(/const ROOTS = \[([^\]]+)\]/)?.[1] ?? ""
    for (const m of roots.matchAll(/"([^"]+)"/g)) read.add(m[1])

    // Guard the guard: if the regexes stop matching, this must fail, not pass empty.
    expect(read.size).toBeGreaterThan(10)
    expect(read.has("openspec/schemas")).toBe(true)
    expect(read.has("examples")).toBe(true)

    const uncovered = [...read].filter((p) => !covered(p))
    expect(uncovered).toEqual([])
  })

  it("does not cover the files the OpenSpec loop writes on every push", () => {
    expect(isBuildInput("openspec/changes/add-table-component/proposal.md")).toBe(false)
    expect(isBuildInput("openspec/specs/table/spec.md")).toBe(false)
  })
})
