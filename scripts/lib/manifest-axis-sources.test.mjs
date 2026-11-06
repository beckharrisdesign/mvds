// Proof for the axis-source extractors. The case this file was written for:
// a boolean prop declared as a prop-union axis reads as "not found", so the
// manifest would carry the axis unverified. Assert on what each function says.
import { describe, expect, it } from "vitest"
import { propBooleanOptions, propUnionOptions } from "./manifest-axis-sources.mjs"

const SRC = `
function Table({ rules = "horizontal", striped = false }: Props & {
  rules?: "horizontal" | "vertical" | "both" | "none"
  striped?: boolean
}) {}
`

describe("propUnionOptions", () => {
  it("reads the quoted members of a prop union in source order", () => {
    expect(propUnionOptions(SRC, "rules", "Table")).toEqual(["horizontal", "vertical", "both", "none"])
  })
  it("cannot see a boolean prop — which is why prop-boolean exists", () => {
    expect(() => propUnionOptions(SRC, "striped", "Table")).toThrow(/prop union "striped\?:" not found/)
  })
})

describe("propBooleanOptions", () => {
  it("maps a boolean prop to the two variant options, false first", () => {
    expect(propBooleanOptions(SRC, "striped", "Table")).toEqual(["false", "true"])
  })
  it("refuses a prop that is not declared boolean", () => {
    expect(() => propBooleanOptions(SRC, "rules", "Table")).toThrow(/boolean prop "rules\?: boolean" not found/)
  })
})
