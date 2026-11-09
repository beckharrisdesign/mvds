// Proof for the secret sync. Most cases are a bug the hub's sync-secrets.sh
// actually shipped or actually hit (dates in scripts/lib/secret-sync.mjs); each
// feeds that input and asserts on what the plan or report SAID.

import { describe, expect, it } from "vitest"

import {
  applyPlan,
  fingerprint,
  formatPlan,
  parseState,
  planSync,
  serializeState,
  validateManifest,
} from "./secret-sync.mjs"

const entry = (name, targets = ["gh"]) => ({ name, ref: `op://BHD Labs/Item/${name}`, targets })
const workflowReading = (...names) => new Map([["ci.yml", names.map((n) => `x: \${{ secrets.${n} }}`).join("\n")]])

function plan({
  manifest = [entry("TOKEN")],
  values = new Map([["TOKEN", "v1"]]),
  state = new Map(),
  deployed = new Map([["gh", new Set()]]),
  workflows = workflowReading("TOKEN"),
} = {}) {
  return planSync({ manifest, values, state, deployed, workflows })
}

describe("planSync", () => {
  it("treats vault placeholders as unfilled, never as values to push", () => {
    for (const placeholder of ["PASTE_VALUE_HERE", "[SENSITIVE]", "", undefined]) {
      const { rows } = plan({ values: new Map([["TOKEN", placeholder]]) })
      expect(rows[0].action).toBe("unfilled")
    }
  })

  it("reports a value it wrote before, still the same in the vault, as unchanged", () => {
    const { rows } = plan({ state: new Map([["TOKEN", fingerprint("v1", ["gh"])]]) })
    expect(rows[0].action).toBe("unchanged")
  })

  it("reports a value that moved in the vault as updated", () => {
    const { rows } = plan({ state: new Map([["TOKEN", fingerprint("v0", ["gh"])]]) })
    expect(rows[0].action).toBe("updated")
  })

  it("writes a row again when only its targets changed", () => {
    // The hub hashed the value alone, so adding a target was a silent no-op.
    const state = new Map([["TOKEN", fingerprint("v1", ["gh"])]])
    const { rows } = plan({ manifest: [entry("TOKEN", ["gh", "gh-env:Production"])], state })
    expect(rows[0].action).toBe("updated")
  })

  it("warns before a first write replaces a secret set by hand", () => {
    const { rows } = plan({ deployed: new Map([["gh", new Set(["TOKEN"])]]) })
    expect(rows[0].action).toBe("added")
    expect(rows[0].replaces).toEqual(["gh"])
  })

  it("does not warn about replacing a secret this sync wrote itself", () => {
    const { rows } = plan({
      state: new Map([["TOKEN", fingerprint("v0", ["gh"])]]),
      deployed: new Map([["gh", new Set(["TOKEN"])]]),
    })
    expect(rows[0].replaces).toEqual([])
  })

  it("reports a deployed secret with no manifest row as an orphan, with who reads it", () => {
    // NPM_TOKEN in this repo: set 2026-07-15, unread since publish moved to OIDC.
    const { orphans } = plan({ deployed: new Map([["gh", new Set(["TOKEN", "NPM_TOKEN"])]]) })
    expect(orphans).toEqual([{ target: "gh", name: "NPM_TOKEN", readBy: [] }])
  })

  it("reports an orphan per target, not per name", () => {
    const { orphans } = plan({
      deployed: new Map([
        ["gh", new Set(["TOKEN"])],
        ["gh-env:Production", new Set(["TOKEN"])],
      ]),
    })
    expect(orphans).toEqual([{ target: "gh-env:Production", name: "TOKEN", readBy: ["ci.yml"] }])
  })

  it("reports a workflow secret nothing manages, but not GITHUB_TOKEN", () => {
    const { unmanaged } = plan({ workflows: workflowReading("TOKEN", "CHROMATIC_PROJECT_TOKEN", "GITHUB_TOKEN") })
    expect(unmanaged).toEqual([{ name: "CHROMATIC_PROJECT_TOKEN", readBy: ["ci.yml"] }])
  })
})

describe("applyPlan", () => {
  it("records a row only after every target succeeded, so a failure retries", () => {
    const manifest = [entry("A"), entry("B", ["gh", "gh-env:Production"])]
    const values = new Map([["A", "a"], ["B", "b"]])
    const p = plan({ manifest, values, workflows: workflowReading("A", "B") })
    const calls = []
    const result = applyPlan(p, values, new Map(), (name, value, target) => {
      calls.push(`${name}@${target}`)
      if (target === "gh-env:Production") throw new Error("HTTP 503")
    })
    expect(calls).toEqual(["A@gh", "B@gh", "B@gh-env:Production"])
    expect(result.written).toEqual(["A"])
    expect([...result.state.keys()]).toEqual(["A"])
    expect(result.failed).toEqual({ name: "B", target: "gh-env:Production", message: "HTTP 503" })
  })

  it("writes nothing for unchanged or unfilled rows", () => {
    const manifest = [entry("SAME"), entry("EMPTY")]
    const values = new Map([["SAME", "s"], ["EMPTY", "PASTE_VALUE_HERE"]])
    const state = new Map([["SAME", fingerprint("s", ["gh"])]])
    const p = plan({ manifest, values, state, workflows: workflowReading("SAME", "EMPTY") })
    const calls = []
    applyPlan(p, values, state, (name) => calls.push(name))
    expect(calls).toEqual([])
  })
})

describe("formatPlan", () => {
  it("never prints a value, whatever the row's state", () => {
    const secret = "sk-test-DO-NOT-PRINT-9f3a"
    const manifest = [entry("NEW"), entry("MOVED"), entry("SAME")]
    const values = new Map([["NEW", secret], ["MOVED", secret], ["SAME", secret]])
    const state = new Map([["MOVED", fingerprint("old", ["gh"])], ["SAME", fingerprint(secret, ["gh"])]])
    const p = plan({ manifest, values, state, deployed: new Map([["gh", new Set(["NEW", "STRAY"])]]) })
    for (const apply of [true, false]) {
      const out = formatPlan(p, { apply })
      expect(out).not.toContain(secret)
      expect(out).toContain("NEW")
    }
  })

  it("says the preview wrote nothing", () => {
    expect(formatPlan(plan(), { apply: false })).toContain("Preview only — nothing was written.")
  })
})

describe("validateManifest", () => {
  it("rejects a malformed record instead of skipping it", () => {
    const errors = validateManifest([
      entry("TOKEN"),
      entry("TOKEN"),
      { name: "lower_case", ref: "op://x/y/z", targets: ["gh"] },
      { name: "PLAIN", ref: "ghp_literalvalue", targets: ["gh"] },
      { name: "NOWHERE", ref: "op://x/y/z", targets: [] },
      { name: "VERCEL", ref: "op://x/y/z", targets: ["vercel"] },
    ])
    expect(errors).toEqual([
      "TOKEN: listed twice",
      "lower_case: name must be UPPER_SNAKE_CASE",
      "PLAIN: ref must be an op:// reference",
      "NOWHERE: needs at least one target",
      'VERCEL: unknown target "vercel" (use gh or gh-env:<environment>)',
    ])
  })

  it("accepts a well-formed manifest", () => {
    expect(validateManifest([entry("A"), entry("B", ["gh", "gh-env:Production"])])).toEqual([])
  })
})

describe("state file", () => {
  it("round-trips, sorted, and ignores blank or partial lines", () => {
    const state = parseState("B bbb\n\nA aaa\nBROKEN\n")
    expect([...state]).toEqual([["B", "bbb"], ["A", "aaa"]])
    expect(serializeState(state)).toBe("A aaa\nB bbb\n")
  })
})
