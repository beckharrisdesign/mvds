// Proof for the principle patterns.
//
// A regex is the easiest thing in this repo to get wrong in the direction that
// passes: it looks right, matches nothing, and the gate reports "✓ 75 files
// clear". So each enforced principle gets fed the violation it was written for
// AND the legitimate forms it must not flag — the false-negative half matters
// just as much, since a rule that fires on `h-8` or `size-4` would be turned off
// within a day.

import { describe, expect, it } from "vitest"

import { isSuppressed, scanText } from "./principle-scan.mjs"

const { default: manifest } = await import("../../principles.config.mjs")
const byId = (id) => {
  const p = manifest.principles.find((x) => x.id === id)
  if (!p) throw new Error(`no principle "${id}" in the manifest`)
  return p
}

/** Snippets the principle flags in one line of source. */
const hits = (id, line) => scanText(line, byId(id)).map((f) => f.snippet)
const flags = (id, line) => hits(id, line).length > 0

describe("no-fixed-content-dimensions", () => {
  const id = "no-fixed-content-dimensions"

  it.each([
    ['<th className="w-[180px]">Name</th>', "the table column width that started this"],
    ['<div className="min-h-[48px]">', "a pinned row height"],
    ['<div className="max-w-[320px]">', "a px cap on a content axis"],
    ['<div className="md:w-[240px] lg:w-[320px]">', "behind a responsive variant"],
    ['<div className="basis-[200px]">', "a flex basis in px"],
    ["<div style={{ width: 180 }}>", "React's bare number, which means px"],
    ['<div style={{ maxWidth: "320px" }}>', "a quoted px string"],
    ["<div style={{ width: 180, height: 48 }}>", "both, on one line"],
  ])("flags %j — %s", (line) => {
    expect(flags(id, line)).toBe(true)
  })

  it.each([
    ['<div className="w-[var(--chrome-left-width)]">', "bound to a token"],
    ['<p className="max-w-[29ch]">', "a measure in ch"],
    ['<div className="max-w-[40rem]">', "the Container ladder"],
    ['<div className="w-full min-w-0 truncate">', "intrinsic sizing, the sanctioned fix"],
    ['<button className="h-8 px-4">', "an on-grid control metric"],
    ['<svg className="size-4" />', "an icon glyph size"],
    ['<div className="rounded-[4px]">', "border-radius — a dimension, exempt"],
    ["<div style={{ width: px }}>", "a variable, not a literal"],
    ["<div style={{ width: `${(px / 1536) * 100}%` }}>", "a computed percentage"],
    ['<div className="aspect-[16/9]">', "a ratio"],
  ])("leaves %j alone — %s", (line) => {
    expect(hits(id, line)).toEqual([])
  })

  it("allow-lists hairlines: a 1-2px rule is a stroke, not a size", () => {
    expect(hits(id, '<div className="h-[1px] bg-border" />')).toEqual([])
    expect(hits(id, '<div className="dark:h-[2px]" />')).toEqual([])
    // …but 3px is a size again, so the allowance cannot be stretched.
    expect(flags(id, '<div className="h-[3px]" />')).toBe(true)
  })

  it("honours an inline mvds-allow", () => {
    const line = '<th className="w-[180px]"> // mvds-allow no-fixed-content-dimensions — fixed by spec'
    expect(hits(id, line)).toEqual([])
  })
})

// The extraction into scripts/lib must not have changed what the pre-existing
// patterns match. These are the regression cases for that move.
describe("the patterns that were already enforced", () => {
  it("no-margin-spacing flags a margin but allows mx-auto", () => {
    expect(flags("no-margin-spacing", '<div className="mt-4">')).toBe(true)
    expect(hits("no-margin-spacing", '<Container className="mx-auto">')).toEqual([])
  })

  it("no-raw-flex-grid flags raw layout utilities", () => {
    expect(flags("no-raw-flex-grid", '<div className="flex items-center">')).toBe(true)
    expect(hits("no-raw-flex-grid", "<Stack gap={16}>")).toEqual([])
  })

  it("no-hardcoded-color flags a palette step and a hex, not the token ramps", () => {
    expect(flags("no-hardcoded-color", '<p className="text-slate-500">')).toBe(true)
    expect(flags("no-hardcoded-color", 'color: "#ff0000"')).toBe(true)
    expect(hits("no-hardcoded-color", '<p className="text-muted-foreground">')).toEqual([])
    expect(hits("no-hardcoded-color", '<p className="text-gray-500 bg-primary-2">')).toEqual([])
  })

  it("reports every match on a line, with 1-based line numbers", () => {
    const src = ['<div className="mt-4">', "", '<div className="mb-8 ml-2">'].join("\n")
    expect(scanText(src, byId("no-margin-spacing"))).toEqual([
      { line: 1, snippet: "mt-4" },
      { line: 3, snippet: "mb-8" },
      { line: 3, snippet: "ml-2" },
    ])
  })
})

describe("isSuppressed", () => {
  it("suppresses only the listed ids, and everything when bare", () => {
    expect(isSuppressed("x // mvds-allow", "anything")).toBe(true)
    expect(isSuppressed("x // mvds-allow: no-runts, no-margin-spacing", "no-runts")).toBe(true)
    expect(isSuppressed("x // mvds-allow: no-runts", "no-margin-spacing")).toBe(false)
    expect(isSuppressed("x // nothing here", "no-runts")).toBe(false)
  })
})

describe("the manifest's guiding records", () => {
  // A guiding principle is upheld by judgment, so there is no pattern to test.
  // What IS checkable is that it is shaped to be usable: an eval lens the design
  // gate can actually ask, and no file scope pretending it is scanned.
  it.each(manifest.principles.filter((p) => p.check.kind === "guiding").map((p) => p.id))(
    "%s carries an eval lens and no file scope",
    (id) => {
      const p = byId(id)
      expect(p.evalLens, `${id} has no evalLens`).toBeTruthy()
      expect(p.scope.include).toEqual([])
    }
  )
})
