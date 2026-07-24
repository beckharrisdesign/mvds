// Refresh the checked-in Figma mirror previews (figma/exports/*.png).
//
//   npm run export:figma
//
// Code is the source of truth; the Figma file is a generated one-way mirror.
// These PNGs are a versioned snapshot of that mirror so the landing page has a
// shareable, viewable artifact that does NOT depend on the live file's private
// sharing settings (a raw link to the file 403s for anyone outside the team).
//
// This script does NOT call Figma itself — the Figma MCP lives in the agent
// session, not in Node. It prints the exact tool calls to run and then, once the
// agent has downloaded the PNGs, stamps exports.json's capture date. Run it
// through the agent after a code→Figma sync. The manual native `.fig` export
// (File → Save local copy) is separate — see figma/exports/README.md; Pro tier
// has no API for it.

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = join(ROOT, "figma", "exports")
const META = join(DIR, "exports.json")

if (!existsSync(META)) {
  console.error(`No ${META} — nothing to refresh.`)
  process.exit(1)
}

const meta = JSON.parse(readFileSync(META, "utf8"))
const stampArg = process.argv.find((a) => a.startsWith("--captured="))

if (!stampArg) {
  // Discovery mode: tell the agent exactly what to fetch. Node has no clock it
  // may use here (Date.now() is banned in workflow scripts and pointless in a
  // committed artifact), so the capture date is passed in explicitly on stamp.
  console.log("Refresh the Figma mirror previews. For each page below, call the")
  console.log("Figma MCP get_screenshot, then download the PNG to the given path:\n")
  for (const p of meta.pages) {
    console.log(`  • ${p.name}`)
    console.log(`      get_screenshot fileKey=${meta.fileKey} nodeId=${p.nodeId} maxDimension=1600`)
    console.log(`      curl -sL -o figma/exports/${p.file} "<image_url>"\n`)
  }
  console.log("Then stamp the capture date (ISO yyyy-mm-dd):")
  console.log("  node scripts/export-figma.mjs --captured=<yyyy-mm-dd>")
  process.exit(0)
}

// Stamp mode: record the capture date passed by the agent.
const captured = stampArg.split("=")[1]
if (!/^\d{4}-\d{2}-\d{2}$/.test(captured)) {
  console.error(`--captured must be yyyy-mm-dd, got "${captured}"`)
  process.exit(1)
}

const missing = meta.pages.filter((p) => !existsSync(join(DIR, p.file)))
if (missing.length) {
  console.error(
    `Missing PNGs — download them first: ${missing.map((p) => p.file).join(", ")}`
  )
  process.exit(1)
}

meta.capturedAt = captured
writeFileSync(META, JSON.stringify(meta, null, 2) + "\n")
console.log(`Stamped exports.json capturedAt=${captured} (${meta.pages.length} pages present).`)
