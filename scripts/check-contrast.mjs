// Token-level WCAG AA gate. Reads the oklch token values straight from
// src/index.css (the source of truth) and asserts every intended foreground/
// background pairing clears 4.5:1 in BOTH light and dark — independent of whether
// any component story happens to render it. This closes the hole where a solid
// status color (e.g. `success`) could fail AA unnoticed because no component uses
// it. Run via `npm run check:contrast`.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { oklchStrToRgb, contrastRatio } from "./color.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const css = readFileSync(join(ROOT, "src/index.css"), "utf8")

// Pull `--name: oklch(...)` declarations from a `:root { ... }` / `.dark { ... }` block.
function parseBlock(selector) {
  const re = new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`)
  const block = css.match(re)
  if (!block) throw new Error(`Could not find ${selector} block in src/index.css`)
  const tokens = {}
  for (const line of block[1].split("\n")) {
    const m = line.match(/--([a-z0-9-]+):\s*(oklch\([^;]+\))/i)
    if (m) tokens[m[1]] = m[2].trim()
  }
  return tokens
}

const MODES = { light: parseBlock(":root"), dark: parseBlock(".dark") }

// Intended TEXT pairings that must meet WCAG AA 4.5:1 (normal text). [fg, bg].
// muted-foreground is the documented exception — AA only on background/card,
// never on muted — so it is checked on background/card, not on muted.
const AA_PAIRS = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["neutral-foreground", "neutral"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  // status colors used AS text on the page background
  ["success", "background"],
  ["destructive", "background"],
  ["neutral", "background"],
]

const AA = 4.5
const failures = []
let checked = 0

for (const [mode, tokens] of Object.entries(MODES)) {
  for (const [fg, bg] of AA_PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      failures.push(`${mode}: missing token ${tokens[fg] ? bg : fg}`)
      continue
    }
    const ratio = contrastRatio(oklchStrToRgb(tokens[fg]), oklchStrToRgb(tokens[bg]))
    checked++
    if (ratio < AA) failures.push(`${mode}: ${fg} on ${bg} — ${ratio.toFixed(2)}:1 (needs ${AA}:1)`)
  }
}

if (failures.length) {
  console.error("✗ WCAG AA token-contrast failures:")
  for (const f of failures) console.error("  " + f)
  process.exit(1)
}
console.log(`✓ ${checked} token pairings meet WCAG AA ${AA}:1 in light + dark.`)
