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
// Manifest fontWeight values are ERROR-level (T5) and run in BOTH modes —
// lintBindings is per-manifest, so --file catches an unmappable weight at the
// keystroke; an unmappable weight cannot sync (no Figma face to load).
//
// Typography gate (system-level checks T1–T4/T6–T7 — full mode only, skipped
// under --file): the font family is a token, enforced in two directions
// because CI has no Figma access:
//   code ↔ conventions.typography  — record exists (T1), --font-sans family
//     (T2), @fontsource import + dependency (T3), every ramp weight mappable
//     to a Figma style (T4);
//   conventions.typography ↔ figma.lock.json — the lock records each Type/*
//     style's resolved font at last sync; a mismatch is an error (T7). A lock
//     with no typography block is a bootstrap WARNING (T6) until the first
//     font-aware token sync records reality.
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
// Guard the missing-value case (`--file` as the last arg) → treat as no file.
const singleFile = fileFlag !== -1 ? (argv[fileFlag + 1] ?? null) : null
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
      const end = src.indexOf("*/", i)
      if (end === -1) return null // unterminated block comment — fail fast, never loop
      i = end + 1
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
      const end = inner.indexOf("*/", i)
      if (end === -1) break // unterminated block comment — bail with what we have
      i = end + 1
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

function lintBindings(node, path, warns, errors, componentName) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => lintBindings(v, `${path}[${i}]`, warns, errors, componentName))
    return
  }
  if (!node || typeof node !== "object") return
  // T5 (error, not warn): a fontWeight outside the weight map cannot be
  // expressed as a Figma font style at sync time — unlike a typo'd var name,
  // there is no raw-value fallback for a missing face.
  const weightMap = conventions.typography?.weightToFigmaStyle ?? {} // absent record → T1 fires in checkTypography
  if (typeof node.fontWeight === "number" && !(node.fontWeight in weightMap)) {
    errors.push({
      component: componentName,
      message: `${path}: fontWeight ${node.fontWeight} has no Figma style in conventions.typography.weightToFigmaStyle (${Object.keys(weightMap).join("/") || "record missing"})`,
    })
  }
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
    lintBindings(v, path ? `${path}.${k}` : k, warns, errors, componentName)
  }
}

// --- typography gate (full mode only) -------------------------------------------
// The font family is a token: code ↔ conventions.typography ↔ figma.lock.json.
// CI has no Figma access, so the lock is the recorded Figma reality (written by
// the mvds-figma-token-sync skill); live hand-drift is caught at sync time.
function checkTypography(errors, warns) {
  const t = conventions.typography
  // T1 — the record itself.
  if (!t?.fontFamily || !t?.weightToFigmaStyle) {
    errors.push({
      component: "typography",
      message: `T1: figma/conventions.mjs has no typography record (fontFamily + weightToFigmaStyle) — the font family must be declared, not implied`,
    })
    return // everything below depends on it
  }
  const f = t.fontFamily

  // T2 — --font-sans in code matches the declared code family.
  const sansMatch = /--font-sans:\s*['"]([^'"]+)['"]/.exec(indexCss)
  const codeFamily = sansMatch?.[1] ?? null
  if (codeFamily !== f.code) {
    errors.push({
      component: "typography",
      message: `T2: src/index.css --font-sans is ${codeFamily ? `'${codeFamily}'` : "missing/unquoted"} but conventions.typography declares '${f.code}' — change both together (then re-run the token sync)`,
    })
  }
  if (!/--font-heading:\s*var\(--font-sans\)/.test(indexCss)) {
    warns.push({
      component: "typography",
      message: `--font-heading no longer aliases var(--font-sans) — the typography record assumes one family; extend conventions.typography if a second family is now real`,
    })
  }

  // T3 — the fontsource package is imported and declared.
  if (!indexCss.includes(`@import "${f.package}"`)) {
    errors.push({
      component: "typography",
      message: `T3: src/index.css does not @import "${f.package}" (the declared font package)`,
    })
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"))
  if (!pkg.dependencies?.[f.package] && !pkg.devDependencies?.[f.package]) {
    errors.push({
      component: "typography",
      message: `T3: package.json has no dependency on ${f.package}`,
    })
  }

  // T4 — every ramp step's weight is expressible as a Figma style.
  const stepWeights = {} // Figma style name → weight from code
  for (const [util, styleName] of Object.entries(conventions.textStyles)) {
    const w = new RegExp(`--${util}--font-weight:\\s*(\\d+)`).exec(indexCss)
    const weight = w ? Number(w[1]) : 400 // absent = CSS default 400
    stepWeights[styleName] = weight
    if (!(weight in t.weightToFigmaStyle)) {
      errors.push({
        component: "typography",
        message: `T4: ramp step ${util} uses font-weight ${weight}, which has no entry in weightToFigmaStyle (${Object.keys(t.weightToFigmaStyle).join("/")})`,
      })
    }
  }

  // T6/T7 — recorded Figma reality (the lock).
  let lock
  try {
    lock = JSON.parse(readFileSync(join(ROOT, "figma/figma.lock.json"), "utf8"))
  } catch {
    warns.push({ component: "typography", message: "figma/figma.lock.json missing or unparseable — skipping recorded-reality checks" })
    return
  }
  if (!lock.typography) {
    warns.push({
      component: "typography",
      message: `T6: figma.lock.json has no typography block — text-style fonts were never recorded; run the mvds-figma-token-sync skill to record them (until then, Figma's fonts are unverified)`,
    })
    return
  }
  const lockVar = lock.typography.fontFamilyVariable
  if (lockVar?.value !== f.figma) {
    errors.push({
      component: "typography",
      message: `T7: lock records font-sans variable value '${lockVar?.value}' but conventions declare '${f.figma}' — re-run the token sync`,
    })
  }
  for (const styleName of Object.values(conventions.textStyles)) {
    const entry = lock.typography.textStyles?.[styleName]
    if (!entry) {
      errors.push({
        component: "typography",
        message: `T7: lock has no recorded font for text style "${styleName}" — re-run the token sync`,
      })
      continue
    }
    if (entry.fontFamily !== f.figma) {
      errors.push({
        component: "typography",
        message: `T7: "${styleName}" recorded as ${entry.fontFamily} in Figma but conventions declare ${f.figma} — Figma is stale; re-run the token sync`,
      })
    }
    const expectedStyle = t.weightToFigmaStyle[stepWeights[styleName]]
    if (expectedStyle && entry.fontStyle !== expectedStyle) {
      errors.push({
        component: "typography",
        message: `T7: "${styleName}" recorded as ${entry.fontFamily} ${entry.fontStyle} but code weight ${stepWeights[styleName]} maps to ${expectedStyle} — re-run the token sync`,
      })
    }
    if (entry.bound === false) {
      warns.push({
        component: "typography",
        message: `"${styleName}" fontFamily is set directly, not bound to the font-sans variable (bind failed at last sync) — rebinding is cosmetic, values still match`,
      })
    }
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

  lintBindings(m.base, "base", warns, errors, m.name)
  lintBindings(m.perOption, "perOption", warns, errors, m.name)
}

// The system-level typography checks (T1–T4, T6–T7) are not per-component —
// full mode only (the --file path is the per-edit PostToolUse hook; keep it
// fast and scoped). T5 is the exception: it lives in lintBindings above and
// runs per-manifest in both modes.
if (!singleRel) checkTypography(errors, warns)

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
