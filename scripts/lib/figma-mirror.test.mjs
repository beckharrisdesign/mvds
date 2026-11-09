// Proof for the Figma card's mirrored count.
//
// The bug: the card counted every manifest in figma/components.config.mjs as
// "mirrored", so a component declared but never synced (Table, after #131)
// raised the count and appeared in the list. Each case feeds the split a
// manifest the lock doesn't know, and asserts on what it returned.

import { describe, expect, it } from "vitest"

import { figmaMirrorInventory } from "./figma-mirror.mjs"

const manifest = (name, ...optionCounts) => ({
  name,
  axes: optionCounts.map((n) => ({ options: Array.from({ length: n }, (_, i) => i) })),
})
const lockWith = (...names) => ({
  components: Object.fromEntries(names.map((n) => [n, { componentSetId: "1:1" }])),
})

describe("figmaMirrorInventory", () => {
  it("does not count a manifested component the lock has no entry for", () => {
    const result = figmaMirrorInventory(
      [manifest("Button", 3, 2), manifest("Table", 4, 2)],
      lockWith("Button"),
    )

    expect(result.mirrored).toEqual(["Button"])
    expect(result.notYetSynced).toEqual(["Table"])
  })

  it("counts variants for mirrored components only", () => {
    const result = figmaMirrorInventory(
      [manifest("Button", 3, 2), manifest("Table", 4, 2)],
      lockWith("Button"),
    )

    expect(result.mirroredVariants).toBe(6)
  })

  it("counts a component with no axes as one variant", () => {
    const result = figmaMirrorInventory([manifest("Card")], lockWith("Card"))

    expect(result.mirroredVariants).toBe(1)
  })

  it("ignores a lock entry with no manifest", () => {
    const result = figmaMirrorInventory([manifest("Button", 2)], lockWith("Button", "Retired"))

    expect(result.mirrored).toEqual(["Button"])
    expect(result.notYetSynced).toEqual([])
  })

  it("reports nothing mirrored when the lock has no components yet", () => {
    const result = figmaMirrorInventory([manifest("Button", 2)], {})

    expect(result.mirrored).toEqual([])
    expect(result.notYetSynced).toEqual(["Button"])
    expect(result.mirroredVariants).toBe(0)
  })
})
