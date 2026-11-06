// Proof for resolveTokenAliases: the bug it was written for is an alias the
// contrast gate silently skipped. Each case feeds the broken input and reads
// what the function SAID — never an exit code.
import { describe, expect, it } from "vitest"
import { resolveTokenAliases } from "./token-aliases.mjs"

describe("resolveTokenAliases", () => {
  it("resolves a one-step alias to the oklch value it points at", () => {
    const out = resolveTokenAliases({
      background: "oklch(1 0 0)",
      "table-surface": "var(--background)",
    })
    expect(out["table-surface"]).toBe("oklch(1 0 0)")
    expect(out.background).toBe("oklch(1 0 0)")
  })

  it("follows a chain of aliases", () => {
    const out = resolveTokenAliases({
      card: "oklch(0.2 0 0)",
      surface: "var(--card)",
      "table-surface": "var(--surface)",
    })
    expect(out["table-surface"]).toBe("oklch(0.2 0 0)")
  })

  it("refuses an alias that names a token the block does not declare", () => {
    // The declaration-resolves-to-nothing defect: a renamed target, an alias left behind.
    expect(() => resolveTokenAliases({ "table-surface": "var(--backgrund)" })).toThrow(
      /--table-surface aliases var\(--backgrund\), which this block does not declare/
    )
  })

  it("refuses a cycle instead of looping", () => {
    expect(() => resolveTokenAliases({ a: "var(--b)", b: "var(--a)" })).toThrow(/aliases itself/)
  })
})
