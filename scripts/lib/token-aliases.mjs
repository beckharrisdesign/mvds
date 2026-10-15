// Alias resolution for the token-contrast gate, as a pure function over a
// parsed block (openspec: add-table-component, design.md D14).
//
// `--table-surface: var(--background)` is the first token in src/index.css that
// is an ALIAS rather than an oklch value. check-contrast.mjs used to capture only
// `--name: oklch(...)` lines, so an alias was invisible to it: not checked, and
// not reported as unchecked either — the fail-open shape AGENTS.md names. This
// resolves every `var(--x)` chain inside one block to the value it points at, and
// refuses an alias that points at nothing, because a declaration that resolves
// to nothing is exactly the defect the gate exists to catch.

const ALIAS = /^var\(--([a-z0-9-]+)\)$/i

/**
 * @param {Record<string, string>} tokens  name → `oklch(...)` or `var(--name)`
 * @returns {Record<string, string>}       the same names, every value an oklch string
 * @throws when an alias names a token the block does not declare, or cycles
 */
export function resolveTokenAliases(tokens) {
  const out = {}
  for (const [name, value] of Object.entries(tokens)) {
    let v = value
    const seen = new Set([name])
    let m
    while ((m = ALIAS.exec(v))) {
      const ref = m[1]
      if (seen.has(ref)) throw new Error(`--${name} aliases itself through --${ref} — the chain never reaches a value`)
      if (!(ref in tokens))
        throw new Error(`--${name} aliases var(--${ref}), which this block does not declare — the alias resolves to nothing`)
      seen.add(ref)
      v = tokens[ref]
    }
    out[name] = v
  }
  return out
}
