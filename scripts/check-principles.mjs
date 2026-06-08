// Manifest-driven golden-rule gate. Reads the principle manifest (principles.config
// .mjs), resolves it through the context cascade (principles.resolve.mjs — no layers
// this round), then scans the source tree, asserting every enabled principle. Mirrors
// scripts/check-contrast.mjs: parse the source of truth, iterate a declared data set,
// collect failures, print a readable list, exit non-zero.
//
//   npm run check:principles            full-tree scan (CI / pre-ship gate)
//   node scripts/check-principles.mjs --file <path>   single file (edit-guard hook)
//
// Exit codes: 0 = clean (or warn-only). 1 = errors (script/CI). 2 = errors in
// --file mode (surfaces to the agent via the PostToolUse hook).

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join, relative, sep } from "node:path"
import { resolveManifest, selectContextLayers } from "../principles.resolve.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

// --- args --------------------------------------------------------------------
const argv = process.argv.slice(2)
const fileFlag = argv.indexOf("--file")
const singleFile = fileFlag !== -1 ? argv[fileFlag + 1] : null

// --- glob -> RegExp (supports **, *, ?, {a,b}) -------------------------------
function globToRegExp(glob) {
  let re = "^"
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === "*") {
      if (glob[i + 1] === "*") {
        i++
        if (glob[i + 1] === "/") {
          i++
          re += "(?:[^/]*/)*" // ** / -> zero or more path segments
        } else {
          re += ".*" // trailing ** -> anything, slashes included
        }
      } else {
        re += "[^/]*" // * -> within a segment
      }
    } else if (c === "{") {
      const end = glob.indexOf("}", i)
      const alts = glob
        .slice(i + 1, end)
        .split(",")
        .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      re += "(?:" + alts.join("|") + ")"
      i = end
    } else if (c === "?") {
      re += "[^/]"
    } else if (".+^$()|[]\\".includes(c)) {
      re += "\\" + c
    } else {
      re += c
    }
  }
  return new RegExp(re + "$")
}

const matchesAny = (path, globs) => globs.some((g) => globToRegExp(g).test(path))

// --- file enumeration --------------------------------------------------------
// Walk src/ once; principles filter this set by their own include/exclude globs.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else acc.push(relative(ROOT, full).split(sep).join("/"))
  }
  return acc
}

const ALL_FILES = (() => {
  if (singleFile) {
    // Normalise the hook-supplied path (often absolute) to ROOT-relative POSIX.
    const rel = relative(ROOT, singleFile).split(sep).join("/")
    return [rel]
  }
  return walk(join(ROOT, "src"))
})()

function filesFor(principle) {
  return ALL_FILES.filter(
    (f) =>
      matchesAny(f, principle.scope.include) &&
      !matchesAny(f, principle.scope.exclude)
  )
}

// --- checks ------------------------------------------------------------------
// Each returns findings: { file, line, snippet }[]. Line-based checks honour an
// inline escape hatch: a `mvds-allow` comment on the line suppresses all
// principles there; `mvds-allow: id1, id2` suppresses only the listed ones.
function isSuppressed(text, id) {
  const m = text.match(/mvds-allow(?::?\s*([a-z0-9,\s-]+))?/i)
  if (!m) return false
  if (!m[1]) return true // bare `mvds-allow` suppresses every principle on the line
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .includes(id)
}

function runForbidSource(file, p) {
  const out = []
  const src = readFileSync(join(ROOT, file), "utf8")
  src.split("\n").forEach((text, i) => {
    if (isSuppressed(text, p.id)) return
    const re = new RegExp(p.check.pattern.source, p.check.pattern.flags.replace("g", "") + "g")
    let m
    while ((m = re.exec(text)) !== null) out.push({ file, line: i + 1, snippet: m[0] })
  })
  return out
}

function runForbidClassName(file, p) {
  const allow = new Set(p.check.allow ?? [])
  const out = []
  const src = readFileSync(join(ROOT, file), "utf8")
  src.split("\n").forEach((text, i) => {
    if (isSuppressed(text, p.id)) return
    const re = new RegExp(p.check.pattern.source, p.check.pattern.flags.replace("g", "") + "g")
    let m
    while ((m = re.exec(text)) !== null) {
      if (allow.has(m[0])) continue
      out.push({ file, line: i + 1, snippet: m[0] })
    }
  })
  return out
}

function runRequireSibling(file, p) {
  const companion = p.check.companion(file)
  if (existsSync(join(ROOT, companion))) return []
  return [{ file, line: 0, snippet: `(missing ${companion})` }]
}

const DISPATCH = {
  "forbid-source": runForbidSource,
  "forbid-classname": runForbidClassName,
  "require-sibling-file": runRequireSibling,
}

// --- run ---------------------------------------------------------------------
const base = (await import(pathToFileURL(join(ROOT, "principles.config.mjs")))).default
const manifest = resolveManifest(base, selectContextLayers())

const active = manifest.principles.filter((p) => p.enabled && p.severity !== "off")
const findings = [] // { principle, severity, file, line, snippet }

for (const p of active) {
  const run = DISPATCH[p.check.kind]
  if (!run) throw new Error(`Unknown check kind "${p.check.kind}" for principle ${p.id}`)
  for (const file of filesFor(p)) {
    for (const hit of run(file, p)) {
      findings.push({ principle: p, severity: p.severity, ...hit })
    }
  }
}

// --- report ------------------------------------------------------------------
const errors = findings.filter((f) => f.severity === "error")
const warns = findings.filter((f) => f.severity === "warn")
const scope = singleFile ? ALL_FILES[0] : `${ALL_FILES.length} files`

if (!findings.length) {
  console.log(`✓ ${scope} clear ${active.length} enabled MVDS principles (light + dark).`)
  process.exit(0)
}

// Group findings by principle for a readable, actionable report.
const byPrinciple = new Map()
for (const f of findings) {
  if (!byPrinciple.has(f.principle.id)) byPrinciple.set(f.principle.id, [])
  byPrinciple.get(f.principle.id).push(f)
}

console.error(`✗ MVDS principle violations (${findings.length}):\n`)
for (const [id, list] of byPrinciple) {
  const p = list[0].principle
  console.error(`  [${id}] ${p.severity} — ${p.description}`)
  for (const f of list) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file
    console.error(`    ${loc}   ${f.snippet}`)
  }
  console.error(`    → ${p.fix}${p.docs ? `  (${p.docs})` : ""}\n`)
}
console.error(
  `Scanned ${scope} against ${active.length} enabled principles. ${errors.length} error(s), ${warns.length} warning(s).`
)

if (errors.length) process.exit(singleFile ? 2 : 1)
process.exit(0) // warn-only: print but don't fail
