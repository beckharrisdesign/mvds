// Figma-manifest drift gate. Reads the component manifests (figma/components.
// config.mjs) and asserts each declared axis exactly matches the component
// source it mirrors — a variant added/renamed/removed in code without a
// manifest update fails here, BEFORE a sync can push a stale mirror to Figma.
// Mirrors scripts/check-principles.mjs: import a data manifest, scan source,
// collect failures, print a readable grouped list, exit non-zero.
//
//   npm run check:figma                 full check (CI / pre-sync gate)
//   node scripts/check-figma-manifest.mjs --file <path>   single component file
//
// Truth per axis `source.kind`:
//   cva        — option keys of the named cva() call's variants.<axis> object
//   prop-union — the quoted members of the prop's TS union (size?: "a" | "b")
//   synthetic  — Figma-only axis (e.g. state), no code truth, skipped
//   manual     — escape hatch when extraction can't parse a source; skipped
//
// Also lints (warn-level) every { var } / textStyle binding against the token
// layer + conventions, catching typos like space-18 before they hit Figma.
//
// Exit codes: 0 = clean (or warn-only). 1 = errors. 2 = errors in --file mode
// (surfaces to the agent via a PostToolUse hook, like check-principles).

import { readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join, relative, sep } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

// --- args --------------------------------------------------------------------
const argv = process.argv.slice(2)
const fileFlag = argv.indexOf("--file")
const singleFile = fileFlag !== -1 ? argv[fileFlag + 1] : null
const singleRel = singleFile
  ? relative(ROOT, singleFile).split(sep).join("/")
  : null

// --- balanced-brace slicing (string- and comment-aware) ------------------------
// Returns the inner text of the {...} starting at openIdx, or null if unbalanced.
function sliceBalanced(src, openIdx) {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'" || c === "`") {
      i++
      while (i < src.length && src[i] !== c) {
        if (src[i] === "\\") i++
        i++
      }
      continue
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1
      continue
    }
    if (c === "{") depth++
    else if (c === "}") {
      depth--
      if (depth === 0) return src.slice(openIdx + 1, i)
    }
  }
  return null
}

// Top-level keys of an object literal's inner text (depth-aware, quoted or bare).
function objectKeys(inner) {
  const keys = []
  let depth = 0
  let expectKey = true
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (c === '"' || c === "'" || c === "`") {
      const start = ++i
      while (i < inner.length && inner[i] !== c) {
        if (inner[i] === "\\") i++
        i++
      }
      if (depth === 0 && expectKey) {
        let k = i + 1
        while (k < inner.length && /\s/.test(inner[k])) k++
        if (inner[k] === ":") {
          keys.push(inner.slice(start, i))
          expectKey = false
        }
      }
      continue
    }
    if (c === "/" && inner[i + 1] === "/") {
      while (i < inner.length && inner[i] !== "\n") i++
      continue
    }
    if (c === "/" && inner[i + 1] === "*") {
      i = inner.indexOf("*/", i) + 1
      continue
    }
    if (c === "{" || c === "(" || c === "[") depth++
    else if (c === "}" || c === ")" || c === "]") depth--
    else if (c === "," && depth === 0) expectKey = true
    else if (depth === 0 && expectKey && /[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < inner.length && /[\w$]/.test(inner[j])) j++
      let k = j
      while (k < inner.length && /\s/.test(inner[k])) k++
      if (inner[k] === ":") {
        keys.push(inner.slice(i, j))
        expectKey = false
      }
      i = j - 1
    }
  }
  return keys
}

// --- truth extractors ----------------------------------------------------------
function cvaAxisOptions(src, exportName, axis, ctx) {
  const callIdx = src.search(new RegExp(`\\b${exportName}\\s*=\\s*cva\\s*\\(`))
  if (callIdx === -1) throw new Error(`${ctx}: cva export "${exportName}" not found`)
  const variantsMatch = /\bvariants\s*:\s*\{/.exec(src.slice(callIdx))
  if (!variantsMatch) throw new Error(`${ctx}: no variants block in "${exportName}"`)
  const variantsOpen = callIdx + variantsMatch.index + variantsMatch[0].length - 1
  const variantsInner = sliceBalanced(src, variantsOpen)
  if (variantsInner === null) throw new Error(`${ctx}: unbalanced variants block`)
  const axisMatch = new RegExp(`(?:^|[\\s{,])(?:"${axis}"|'${axis}'|${axis})\\s*:\\s*\\{`).exec(variantsInner)
  if (!axisMatch) throw new Error(`${ctx}: axis "${axis}" not found in "${exportName}"`)
  const axisOpen = axisMatch.index + axisMatch[0].length - 1
  const axisInner = sliceBalanced(variantsInner, axisOpen)
  if (axisInner === null) throw new Error(`${ctx}: unbalanced axis "${axis}" block`)
  return objectKeys(axisInner)
}

function propUnionOptions(src, prop, ctx) {
  const m = new RegExp(`\\b${prop}\\?\\s*:\\s*((?:"[^"]+"\\s*\\|\\s*)*"[^"]+")`).exec(src)
  if (!m) throw new Error(`${ctx}: prop union "${prop}?:" not found`)
  return [...m[1].matchAll(/"([^"]+)"/g)].map((q) => q[1])
}

// --- binding lint ----------------------------------------------------------------
const indexCss = readFileSync(join(ROOT, "src/index.css"), "utf8")
const { conventions } = await import(pathToFileURL(join(ROOT, "figma/conventions.mjs")))
const knownTextStyles = new Set(Object.values(conventions.textStyles))
const spaceScale = new Set(conventions.spacing.scale)

function lintBindings(node, path, warns, componentName) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => lintBindings(v, `${path}[${i}]`, warns, componentName))
    return
  }
  if (!node || typeof node !== "object") return
  if (typeof node.var === "string") {
    const space = /^space-(\d+)$/.exec(node.var)
    const ok = space
      ? spaceScale.has(Number(space[1]))
      : new RegExp(`--${node.var}\\s*:`).test(indexCss)
    if (!ok) {
      warns.push({
        component: componentName,
        message: `${path}: { var: "${node.var}" } matches no token (src/index.css) and no Scales step (${[...spaceScale].join("/")})`,
      })
    }
  }
  if (typeof node.textStyle === "string" && !knownTextStyles.has(node.textStyle)) {
    warns.push({
      component: componentName,
      message: `${path}: textStyle "${node.textStyle}" is not in the Type/ ramp (figma/conventions.mjs)`,
    })
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === "var" || k === "textStyle") continue
    lintBindings(v, path ? `${path}.${k}` : k, warns, componentName)
  }
}

// --- run --------------------------------------------------------------------------
const manifests = (await import(pathToFileURL(join(ROOT, "figma/components.config.mjs")))).default
const checked = singleRel
  ? manifests.filter((m) => m.code.file === singleRel)
  : manifests

const errors = [] // { component, message }
const warns = []

for (const m of checked) {
  const ctx = `${m.name} (${m.code.file})`
  let src
  try {
    src = readFileSync(join(ROOT, m.code.file), "utf8")
  } catch {
    errors.push({ component: m.name, message: `code file ${m.code.file} not found` })
    continue
  }

  for (const axis of m.axes) {
    const declared = axis.options.map((o) => (typeof o === "string" ? o : o.name))
    let truth
    try {
      if (axis.source.kind === "cva") {
        truth = cvaAxisOptions(src, axis.source.export, axis.source.axis, ctx)
      } else if (axis.source.kind === "prop-union") {
        truth = propUnionOptions(src, axis.source.prop, ctx)
      } else if (axis.source.kind === "synthetic" || axis.source.kind === "manual") {
        continue // no code truth to compare
      } else {
        throw new Error(`${ctx}: unknown source.kind "${axis.source.kind}" on axis "${axis.name}"`)
      }
    } catch (e) {
      errors.push({ component: m.name, message: e.message })
      continue
    }

    if (JSON.stringify(declared) !== JSON.stringify(truth)) {
      const missing = truth.filter((o) => !declared.includes(o))
      const extra = declared.filter((o) => !truth.includes(o))
      const detail =
        missing.length || extra.length
          ? [
              missing.length ? `missing from manifest: ${missing.join(", ")}` : null,
              extra.length ? `not in code: ${extra.join(", ")}` : null,
            ]
              .filter(Boolean)
              .join("; ")
          : `order differs — code: [${truth.join(", ")}], manifest: [${declared.join(", ")}]`
      errors.push({
        component: m.name,
        message: `axis "${axis.name}" drifted from ${m.code.file} (${detail}) → update figma/components/${m.name.toLowerCase()}.figma.mjs, then re-run the component sync`,
      })
    }
  }

  lintBindings(m.base, "base", warns, m.name)
  lintBindings(m.perOption, "perOption", warns, m.name)
}

// --- report -------------------------------------------------------------------------
const scope = singleRel ?? `${checked.length} component manifest(s)`
if (!errors.length && !warns.length) {
  console.log(`✓ ${scope} match their code sources (axes + bindings).`)
  process.exit(0)
}

if (errors.length) {
  console.error(`✗ Figma manifest drift (${errors.length}):\n`)
  for (const e of errors) console.error(`  [${e.component}] ${e.message}`)
  console.error("")
}
if (warns.length) {
  console.error(`⚠ Binding lint warnings (${warns.length}):\n`)
  for (const w of warns) console.error(`  [${w.component}] ${w.message}`)
  console.error("")
}
console.error(
  `Checked ${scope}. ${errors.length} error(s), ${warns.length} warning(s).`
)

if (errors.length) process.exit(singleRel ? 2 : 1)
process.exit(0) // warn-only: print but don't fail
