// The principle scanner, as a pure function over TEXT.
//
// `runForbidSource` and `runForbidClassName` in scripts/check-principles.mjs each
// read a file and ran the regex over its lines, which made a new pattern
// untestable: the only way to see whether it fired was to plant a violation in
// the repo, run the gate, and take it back out. A regex is exactly the kind of
// thing that looks right and matches nothing — one of this repo's four fail-open
// shapes (AGENTS.md: "A gate must be able to fail").
//
// So the matching lives here, taking text instead of a path, and
// principle-scan.test.mjs feeds each pattern the violation it was written for AND
// the legitimate forms it must not flag. The two runners are now thin wrappers
// that read the file and stamp the finding with its name.

/**
 * Inline escape hatch: a `mvds-allow` comment on the line suppresses all
 * principles there; `mvds-allow: id1, id2` suppresses only the listed ones.
 */
export function isSuppressed(text, id) {
  const m = text.match(/mvds-allow(?::?\s*([a-z0-9,\s-]+))?/i)
  if (!m) return false
  if (!m[1]) return true // bare `mvds-allow` suppresses every principle on the line
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .includes(id)
}

/**
 * Every match of `principle.check.pattern` in `src`, line by line, honouring
 * `mvds-allow` and the principle's `check.allow` token list.
 * Returns [{ line, snippet }] with 1-based line numbers.
 */
export function scanText(src, principle) {
  const allow = new Set(principle.check.allow ?? [])
  const out = []
  src.split("\n").forEach((text, i) => {
    if (isSuppressed(text, principle.id)) return
    // Fresh lastIndex per line, and force /g so one line can report twice.
    const re = new RegExp(
      principle.check.pattern.source,
      principle.check.pattern.flags.replace("g", "") + "g"
    )
    let m
    while ((m = re.exec(text)) !== null) {
      // A variant-prefixed utility (`dark:mx-4`) is allow-listed by its bare token.
      const token = m[0].includes(":") ? m[0].split(":").pop() : m[0]
      if (allow.has(token)) continue
      out.push({ line: i + 1, snippet: m[0] })
    }
  })
  return out
}
