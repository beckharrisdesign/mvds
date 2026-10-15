// Token-level WCAG AA gate. Reads the oklch token values straight from
// src/index.css (the source of truth) and asserts every intended foreground/
// background pairing clears 4.5:1 in BOTH light and dark — independent of whether
// any component story happens to render it. This closes the hole where a solid
// status color (e.g. `success`) could fail AA unnoticed because no component uses
// it. Run via `npm run check:contrast`.

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { oklchStrToRgb, contrastRatio } from "./color.mjs"
import { resolveTokenAliases } from "./lib/token-aliases.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const css = readFileSync(join(ROOT, "src/index.css"), "utf8")

// Pull every `--name: value` declaration from a `:root { ... }` / `.dark { ... }`
// block — not only oklch ones, because `--table-surface: var(--background)` is an
// alias and `--font-heading: var(--font-sans)` aliases a non-colour. Aliases are
// resolved per brand below, after the preset merge, so an alias follows the
// brand's own target; only the AA pairs' members are ever read as colours.
function parseBlock(selector) {
  const re = new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`)
  const block = css.match(re)
  if (!block) throw new Error(`Could not find ${selector} block in src/index.css`)
  const tokens = {}
  for (const line of block[1].split("\n")) {
    const m = line.match(/^\s*--([a-z0-9-]+):\s*([^;]+)/i)
    if (m) tokens[m[1]] = m[2].trim()
  }
  return tokens
}

const DEFAULTS = { light: parseBlock(":root"), dark: parseBlock(".dark") }

// --- brand presets (openspec: scoped-theming) --------------------------------
// Each src/themes/<brand>.css ships plain-declaration blocks: a light block
// ([data-brand="<brand>"]) and a dark block (.dark [data-brand=...]). Tokens a
// preset does not set INHERIT from the host brand — so each brand is checked as
// the MERGE of the defaults and its declarations, which is exactly what the
// cascade renders. Both blocks must declare the same token surface (a step
// authored in one mode only is preset drift and fails here).
const BRANDS = { default: DEFAULTS }
const completenessFailures = []
const themesDir = join(ROOT, "src/themes")
if (existsSync(themesDir)) {
  for (const file of readdirSync(themesDir).filter((f) => f.endsWith(".css"))) {
    const brand = file.replace(/\.css$/, "")
    const themeCss = readFileSync(join(themesDir, file), "utf8")
    const light = {}
    const dark = {}
    for (const m of themeCss.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const target = /\.dark/.test(m[1]) ? dark : light
      for (const line of m[2].split("\n")) {
        const d = line.match(/^\s*--([a-z0-9-]+):\s*([^;]+)/i)
        if (d) target[d[1]] = d[2].trim()
      }
    }
    const lightKeys = Object.keys(light).sort()
    const darkKeys = Object.keys(dark).sort()
    for (const k of lightKeys.filter((k) => !darkKeys.includes(k)))
      completenessFailures.push(`${brand}: --${k} authored in light only`)
    for (const k of darkKeys.filter((k) => !lightKeys.includes(k)))
      completenessFailures.push(`${brand}: --${k} authored in dark only`)
    BRANDS[brand] = {
      light: { ...DEFAULTS.light, ...light },
      dark: { ...DEFAULTS.dark, ...dark },
    }
  }
}

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
  // Table's sticky-header surface (openspec: add-table-component, D14) — an
  // alias of background in :root; resolved before pairing so a brand that
  // re-points background is checked on what the alias actually renders.
  ["foreground", "table-surface"],
  ["muted-foreground", "table-surface"],
  // status colors used AS text on the page background
  ["success", "background"],
  ["destructive", "background"],
  ["neutral", "background"],
  // Gradation-scale role contracts (openspec: stepped-scales). Steps 1–2 are
  // tint surfaces (foreground text must read on them); steps 4–5 are text-safe
  // on background/card. Step 3 is decorative — deliberately no text pairing.
  ["foreground", "primary-1"],
  ["foreground", "primary-2"],
  ["primary-4", "background"],
  ["primary-4", "card"],
  ["primary-5", "background"],
  ["primary-5", "card"],
  ["foreground", "secondary-1"],
  ["foreground", "secondary-2"],
  ["secondary-4", "background"],
  ["secondary-4", "card"],
  ["secondary-5", "background"],
  ["secondary-5", "card"],
]

const AA = 4.5
const failures = []
let checked = 0

failures.push(...completenessFailures)
for (const [brand, modes] of Object.entries(BRANDS)) {
  for (const [mode, rawTokens] of Object.entries(modes)) {
    const label = brand === "default" ? mode : `${brand}/${mode}`
    let tokens
    try {
      tokens = resolveTokenAliases(rawTokens)
    } catch (e) {
      failures.push(`${label}: ${e.message}`)
      continue
    }
    for (const [fg, bg] of AA_PAIRS) {
      if (!tokens[fg] || !tokens[bg]) {
        failures.push(`${label}: missing token ${tokens[fg] ? bg : fg}`)
        continue
      }
      const ratio = contrastRatio(oklchStrToRgb(tokens[fg]), oklchStrToRgb(tokens[bg]))
      checked++
      if (ratio < AA) failures.push(`${label}: ${fg} on ${bg} — ${ratio.toFixed(2)}:1 (needs ${AA}:1)`)
    }
  }
}

if (failures.length) {
  console.error("✗ WCAG AA token-contrast failures:")
  for (const f of failures) console.error("  " + f)
  process.exit(1)
}
const brandCount = Object.keys(BRANDS).length
console.log(
  `✓ ${checked} token pairings meet WCAG AA ${AA}:1 in light + dark across ${brandCount} brand${brandCount === 1 ? "" : "s"}.`
)
