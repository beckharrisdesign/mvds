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

// A state record: this sync last wrote `value` to `target`.
const wrote = (...records) =>
  parseState(records.map(([name, target, value]) => `${name}\t${target}\t${fingerprint(value)}`).join("\n"))
const present = (byTarget) => new Map(Object.entries(byTarget).map(([t, names]) => [t, new Set(names)]))

describe("planSync", () => {
  it("treats vault placeholders as unfilled, never as values to push", () => {
    for (const placeholder of ["PASTE_VALUE_HERE", "[SENSITIVE]", "", undefined]) {
      const { rows } = plan({ values: new Map([["TOKEN", placeholder]]) })
      expect(rows[0].action).toBe("unfilled")
      expect(rows[0].writes).toEqual([])
    }
  })

  it("reports a value it wrote, still in the vault and still in GitHub, as unchanged", () => {
    const { rows } = plan({ state: wrote(["TOKEN", "gh", "v1"]), deployed: present({ gh: ["TOKEN"] }) })
    expect(rows[0].action).toBe("unchanged")
    expect(rows[0].writes).toEqual([])
  })

  it("reports a value that moved in the vault as updated", () => {
    const { rows } = plan({ state: wrote(["TOKEN", "gh", "v0"]), deployed: present({ gh: ["TOKEN"] }) })
    expect(rows[0].action).toBe("updated")
    expect(rows[0].writes).toEqual([{ target: "gh", kind: "update", replaces: false }])
  })

  it("restores a secret it wrote that was then deleted from GitHub", () => {
    // Copilot on #139: the record alone said "unchanged", so --apply never
    // put the workflow's credential back.
    const { rows } = plan({ state: wrote(["TOKEN", "gh", "v1"]), deployed: present({ gh: [] }) })
    expect(rows[0].action).toBe("updated")
    expect(rows[0].writes).toEqual([{ target: "gh", kind: "restore", replaces: false }])
  })

  it("writes only the target a row gained, leaving the unchanged one alone", () => {
    // The hub hashed the value alone, so adding a target was a silent no-op.
    const { rows } = plan({
      manifest: [entry("TOKEN", ["gh", "gh-env:Production"])],
      state: wrote(["TOKEN", "gh", "v1"]),
      deployed: present({ gh: ["TOKEN"], "gh-env:Production": [] }),
    })
    expect(rows[0].action).toBe("updated")
    expect(rows[0].writes).toEqual([{ target: "gh-env:Production", kind: "add", replaces: false }])
  })

  it("warns before replacing a hand-set secret in a target the row just gained", () => {
    // Copilot on #139: with one hash per name, this was "updated" and silent.
    const { rows } = plan({
      manifest: [entry("TOKEN", ["gh", "gh-env:Production"])],
      state: wrote(["TOKEN", "gh", "v0"]),
      deployed: present({ gh: ["TOKEN"], "gh-env:Production": ["TOKEN"] }),
    })
    expect(rows[0].writes).toEqual([
      { target: "gh", kind: "update", replaces: false },
      { target: "gh-env:Production", kind: "add", replaces: true },
    ])
  })

  it("warns before a first write replaces a secret set by hand", () => {
    const { rows } = plan({ deployed: present({ gh: ["TOKEN"] }) })
    expect(rows[0].action).toBe("added")
    expect(rows[0].writes).toEqual([{ target: "gh", kind: "add", replaces: true }])
  })

  it("reports a deployed secret with no manifest row as an orphan, with who reads it", () => {
    // NPM_TOKEN in this repo: set 2026-07-15, unread since publish moved to OIDC.
    const { orphans } = plan({ deployed: present({ gh: ["TOKEN", "NPM_TOKEN"] }) })
    expect(orphans).toEqual([{ target: "gh", name: "NPM_TOKEN", readBy: [] }])
  })

  it("reports an orphan per target, not per name", () => {
    const { orphans } = plan({ deployed: present({ gh: ["TOKEN"], "gh-env:Production": ["TOKEN"] }) })
    expect(orphans).toEqual([{ target: "gh-env:Production", name: "TOKEN", readBy: ["ci.yml"] }])
  })

  it("reports a workflow secret nothing manages, but not GITHUB_TOKEN", () => {
    const { unmanaged } = plan({ workflows: workflowReading("TOKEN", "CHROMATIC_PROJECT_TOKEN", "GITHUB_TOKEN") })
    expect(unmanaged).toEqual([{ name: "CHROMATIC_PROJECT_TOKEN", readBy: ["ci.yml"] }])
  })
})

describe("applyPlan", () => {
  it("records each target the moment it is written, and only then", () => {
    const manifest = [entry("A"), entry("B", ["gh", "gh-env:Production"])]
    const values = new Map([["A", "a"], ["B", "b"]])
    const p = plan({ manifest, values, workflows: workflowReading("A", "B") })
    const calls = []
    const result = applyPlan(p, values, new Map(), (name, value, target) => {
      calls.push(`${name} → ${target}`)
      if (target === "gh-env:Production") throw new Error("HTTP 503")
    })
    expect(calls).toEqual(["A → gh", "B → gh", "B → gh-env:Production"])
    expect(result.written).toEqual(["A → gh", "B → gh"])
    expect(result.state).toEqual(wrote(["A", "gh", "a"], ["B", "gh", "b"]))
    expect(result.failed).toEqual({ name: "B", target: "gh-env:Production", message: "HTTP 503" })
  })

  it("keeps a failed update correct when the vault is rolled back afterwards", () => {
    // Copilot on #139: v0 → v1 reached gh, failed for the environment, and the
    // record still said v0 everywhere — so rolling the vault back to v0 read
    // as "unchanged" and left gh holding v1.
    const manifest = [entry("TOKEN", ["gh", "gh-env:Production"])]
    const deployed = present({ gh: ["TOKEN"], "gh-env:Production": ["TOKEN"] })
    const before = wrote(["TOKEN", "gh", "v0"], ["TOKEN", "gh-env:Production", "v0"])

    const v1 = new Map([["TOKEN", "v1"]])
    const failedRun = applyPlan(plan({ manifest, values: v1, state: before, deployed }), v1, before, (n, v, target) => {
      if (target === "gh-env:Production") throw new Error("HTTP 503")
    })
    expect(failedRun.failed?.target).toBe("gh-env:Production")

    const v0 = new Map([["TOKEN", "v0"]])
    const rollback = plan({ manifest, values: v0, state: failedRun.state, deployed })
    expect(rollback.rows[0].writes).toEqual([{ target: "gh", kind: "update", replaces: false }])
  })

  it("writes nothing for unchanged or unfilled rows", () => {
    const manifest = [entry("SAME"), entry("EMPTY")]
    const values = new Map([["SAME", "s"], ["EMPTY", "PASTE_VALUE_HERE"]])
    const state = wrote(["SAME", "gh", "s"])
    const p = plan({ manifest, values, state, deployed: present({ gh: ["SAME"] }), workflows: workflowReading("SAME", "EMPTY") })
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
    const state = wrote(["MOVED", "gh", "old"], ["SAME", "gh", "sk-gone"])
    const p = plan({ manifest, values, state, deployed: present({ gh: ["NEW", "STRAY"] }) })
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
  it("round-trips per target, sorted, and keeps an environment name with spaces", () => {
    const text = "B\tgh\tbbb\n\nA\tgh-env:Production – mvds\taaa\nBROKEN\n"
    const state = parseState(text)
    expect(state.size).toBe(2)
    expect(serializeState(state)).toBe("A\tgh-env:Production – mvds\taaa\nB\tgh\tbbb\n")
  })
})
