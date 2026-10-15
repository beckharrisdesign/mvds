// Code truth for a manifest axis, as pure functions over the component SOURCE
// text (openspec: add-table-component, tasks 3.8). check-figma-manifest.mjs
// used to hold `propUnionOptions` inline, where the only way to exercise it was
// to plant a prop in the repo; it lives here so a case can feed it text.
//
//   prop-union   — `size?: "a" | "b"`  → ["a", "b"]
//   prop-boolean — `striped?: boolean` → ["false", "true"]  (Figma variant
//                  options are strings; "false" first so it is the default)
//
// The boolean kind exists because Table's `striped` prop is a boolean, and
// prop-union cannot see it: its regex wants quoted members and throws
// "not found" on `boolean`, which read as "the prop does not exist".

export function propUnionOptions(src, prop, ctx) {
  const m = new RegExp(`\\b${prop}\\?\\s*:\\s*((?:"[^"]+"\\s*\\|\\s*)*"[^"]+")`).exec(src)
  if (!m) throw new Error(`${ctx}: prop union "${prop}?:" not found`)
  return [...m[1].matchAll(/"([^"]+)"/g)].map((q) => q[1])
}

export function propBooleanOptions(src, prop, ctx) {
  if (!new RegExp(`\\b${prop}\\?\\s*:\\s*boolean\\b`).test(src))
    throw new Error(`${ctx}: boolean prop "${prop}?: boolean" not found`)
  return ["false", "true"]
}
