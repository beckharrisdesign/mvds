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
//     font-aware token sync records reality. T8 compares WHICH font variable
//     each step binds (font-sans vs font-heading) rather than the family it
//     resolves to — the two are the same string while --font-heading aliases
//     --font-sans, so resolved-value comparison alone cannot see a rebinding.
//
// Sync-stamp gate (S1–S6, full mode only): holds figma.lock.json's `tokenSync`
// and `componentSync` provenance blocks to being true — shape, a `result` from a
// fixed vocabulary, zero unresolved mismatches, a non-future ISO date, a full
// 40-char SHA, and componentSync agreeing with the top-level syncedAt it
// documents. Commit RESOLVABILITY is checked only when the clone has history;
// CI's is depth-1, so asking there would fail for environmental reasons.
//
// Exit codes: 0 = clean (or warn-only). 1 = errors. 2 = errors in --file mode
// (surfaces to the agent via a PostToolUse hook, like check-principles).

import { readFileSync, readdirSync, statSync } from "node:fs"
import { execFileSync } from "node:child_process"
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

// --- coverage: the census, not the declared list ---------------------------------
// The guard used to enumerate `componentManifests` and validate what it found —
// so it answered "are the declared manifests correct?" and never "is everything
// that should be mirrored declared?". Enrollment was opt-in, which is how Input
// and Dropzone reached both code and Figma while this printed "17 ✓".
//
// These three passes invert that. They are system-level (like the typography
// gate) and run in full mode only; --file is the per-edit hook and stays scoped.

function globToRegExp(glob) {
  let out = ""
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === "*") {
      if (glob[i + 1] === "*") {
        i++
        if (glob[i + 1] === "/") i++
        out += "(?:.*/)?"
      } else out += "[^/]*"
    } else if (c === "{") {
      const end = glob.indexOf("}", i)
      out += `(?:${glob.slice(i + 1, end).split(",").map((s) => s.trim()).join("|")})`
      i = end
    } else if (c === "?") out += "[^/]"
    else out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  }
  return new RegExp(`^${out}$`)
}

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${name}`
    if (statSync(join(ROOT, rel)).isDirectory()) walkFiles(rel, acc)
    else acc.push(rel)
  }
  return acc
}

// The fingerprint: the component's destructured public prop names, sorted.
// Every layout primitive declares them the same way — `function X({ a, b, ... })`
// — so this is a stable, cheap signature. It is NOT a judgment about whether the
// component should be mirrored; it only answers "has the thing you judged
// changed shape since you judged it?"
function propSignature(src, ctx) {
  const m = src.match(/(?:export\s+)?function\s+[A-Z][A-Za-z0-9_]*\s*\(\s*\{/)
  if (!m) throw new Error(`${ctx}: no destructured component signature found`)
  const inner = sliceBalanced(src, src.indexOf("{", m.index + m[0].length - 1))
  if (inner === null) throw new Error(`${ctx}: unbalanced props destructuring`)
  const names = []
  let depth = 0
  for (const part of inner.split(/,(?![^{[]*[}\]])/)) {
    const t = part.trim()
    if (!t || t.startsWith("...")) continue
    const name = t.match(/^([A-Za-z_$][\w$]*)/)?.[1]
    if (name) names.push(name)
  }
  void depth
  return [...new Set(names)].sort().join("|")
}

function checkCoverage(errors, warns, manifests) {
  const { mirrorScope, notMirrored } = cfg
  if (!mirrorScope || !notMirrored) {
    errors.push({
      component: "coverage",
      message:
        "figma/components.config.mjs must export `mirrorScope` and `notMirrored` — without them the guard cannot tell a missing manifest from a deliberate exclusion",
    })
    return
  }

  const includes = mirrorScope.include.map(globToRegExp)
  const excludes = (mirrorScope.exclude ?? []).map(globToRegExp)
  const roots = [...new Set(mirrorScope.include.map((g) => g.split("/").slice(0, 2).join("/")))]
  const candidates = roots
    .flatMap((r) => walkFiles(r))
    .filter((f) => includes.some((re) => re.test(f)) && !excludes.some((re) => re.test(f)))
    .sort()

  const manifested = new Map(manifests.map((m) => [m.code.file, m.name]))
  const excluded = new Map(notMirrored.map((r) => [r.file, r]))

  // 1. Every candidate is mirrored or excluded — and never both. Three states,
  // no fourth. `||` alone would accept the overlap: a file that gained a
  // manifest while keeping its `notMirrored` record passes, the tally reports
  // mirrored + excluded > classified, and the staleness guard goes on policing
  // an exclusion for a component that is now mirrored. Two records disagreeing
  // in silence is the failure this gate exists to prevent, so reject the
  // overlap before accepting either classification.
  for (const file of candidates) {
    if (manifested.has(file) && excluded.has(file)) {
      errors.push({
        component: "coverage",
        message:
          `${file} is BOTH mirrored (manifest ${manifested.get(file)}) and listed in \`notMirrored\` — a file is one or the other, never both.\n` +
          `      → if it is mirrored, delete its \`notMirrored\` record\n` +
          `      → if it is deliberately native, remove its manifest from \`componentManifests\``,
      })
      continue
    }
    if (manifested.has(file) || excluded.has(file)) continue
    errors.push({
      component: "coverage",
      message:
        `${file} is neither mirrored nor excluded.\n` +
        `      → author figma/components/<name>.figma.mjs and list it in figma/components.config.mjs\n` +
        `      → or add a { file, reason, props } record to \`notMirrored\` if it is deliberately native`,
    })
  }

  // 2. Exclusion records point at files that exist and are in scope.
  for (const rec of notMirrored) {
    if (!candidates.includes(rec.file)) {
      errors.push({
        component: "coverage",
        message: `notMirrored record ${rec.file} is not a file in mirrorScope — delete the record or fix the path`,
      })
      continue
    }
    if (!rec.reason || !rec.reason.trim()) {
      errors.push({ component: "coverage", message: `notMirrored ${rec.file} has no reason` })
    }
    // 3. The staleness guard: recompute the signature and compare.
    let actual
    try {
      actual = propSignature(readFileSync(join(ROOT, rec.file), "utf8"), rec.file)
    } catch (e) {
      errors.push({ component: "coverage", message: e.message })
      continue
    }
    if (actual !== rec.props) {
      errors.push({
        component: "coverage",
        message:
          `${rec.file} changed shape since it was judged not-mirrored — re-confirm the reason, then update \`props\`.\n` +
          `      recorded:   ${rec.props}\n` +
          `      recomputed: ${actual}\n` +
          `      reason on record: "${rec.reason}"`,
      })
    }
  }

  return { classified: candidates.length, mirrored: manifested.size, excluded: excluded.size }
}

// --- lock reconciliation ----------------------------------------------------------
// Both directions, over EVERY entry in lock.components regardless of Figma node
// kind: 16 carry a componentSetId, but Label / Textarea / Blockquote are single
// components (componentId, null componentSetId). Keying this check on
// componentSetId would skip exactly those three — a fail-open hole inside the
// check meant to close fail-open holes.
function checkLockReconciliation(errors, warns, manifests) {
  let lock
  try {
    lock = JSON.parse(readFileSync(join(ROOT, "figma/figma.lock.json"), "utf8"))
  } catch (e) {
    errors.push({ component: "lock", message: `figma/figma.lock.json unreadable: ${e.message}` })
    return null
  }
  const declared = new Set(manifests.map((m) => m.name))
  for (const name of Object.keys(lock.components ?? {})) {
    if (declared.has(name)) continue
    const entry = lock.components[name]
    const kind = entry.componentSetId ? "component set" : "single component"
    errors.push({
      component: "lock",
      message: `${name} (${kind}) is recorded in figma.lock.json but no manifest declares it — the mirror holds something nobody declared`,
    })
  }
  for (const m of manifests) {
    if (!(m.name in (lock.components ?? {}))) {
      warns.push({
        component: "lock",
        message: `${m.name} is manifested but absent from figma.lock.json — not yet synced (legitimate before the next component sync)`,
      })
    }
  }
  return lock
}

// --- sync-stamp gate (full mode only) ---------------------------------------------
// The two sync skills each write a provenance block into figma.lock.json —
// `tokenSync` and `componentSync`. Until now NOTHING checked them: they were
// records whose only job is to be true, with no gate holding them to it, which is
// this repo's signature defect (#115's fail-open coverage, #121's walk-vs-check
// count, the font binding that resolved to the same string either way). A stamp
// nobody verifies decays into the thing it was written to prevent.
//
// CI runs on a DEPTH-1 clone (ci.yml's checkout sets no fetch-depth), so the
// commit a stamp names is normally absent here. SHA *shape* is therefore a hard
// error — a pure string check, identical everywhere — while *resolvability* is
// attempted only when the repo has the history to answer, and skipped silently
// otherwise. A gate that fails in CI for environmental reasons is worse than none.
const SYNC_RESULTS = new Set(["no-op", "written"])

function checkSyncStamps(errors, warns, lock) {
  // Resolvability is only meaningful with history. `--is-shallow-repository`
  // prints "true" on CI's depth-1 clone; anything else (or a git failure) means
  // do not ask.
  let canResolve = false
  try {
    canResolve =
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "false"
  } catch {
    canResolve = false
  }

  const today = new Date().toISOString().slice(0, 10)

  for (const [key, shaField] of [
    ["tokenSync", "verifiedFromCommit"],
    ["componentSync", null], // documents the top-level syncedFromCommit
  ]) {
    const b = lock[key]
    // S1 — the block exists at all. Absent is a bootstrap state (a fresh lock,
    // or one predating these blocks), so warn rather than fail: the same
    // treatment T6 gives a missing typography block.
    if (!b) {
      warns.push({
        component: "sync-stamp",
        message: `S1: figma.lock.json has no \`${key}\` block — that sync has never recorded what it verified; run the matching sync skill (until then its provenance is unverified)`,
      })
      continue
    }

    // S2 — shape and vocabulary. `result` is an enum so it cannot drift into
    // free text that reads fine and means nothing.
    if (!SYNC_RESULTS.has(b.result)) {
      errors.push({
        component: "sync-stamp",
        message: `S2: ${key}.result is ${JSON.stringify(b.result)}, not one of ${[...SYNC_RESULTS].join("/")} — the outcome must be a known value, not prose`,
      })
    }
    const mism = b.checked?.mismatches
    if (typeof mism !== "number") {
      errors.push({
        component: "sync-stamp",
        message: `S2: ${key}.checked.mismatches is missing or not a number — a stamp must say how much disagreed, even when the answer is zero`,
      })
    } else if (mism !== 0) {
      // S3 — a recorded sync that found drift and left it is a record of a known
      // problem, parked. Either fix the drift or do not claim the sync ran.
      errors.push({
        component: "sync-stamp",
        message: `S3: ${key}.checked.mismatches is ${mism}, not 0 — a stamp recording unresolved drift is a known problem left in place; re-run the sync and fix what it found`,
      })
    }

    // S4 — the date is a real ISO day and not in the future. The shape regex
    // alone is not enough: "2026-13-45" is digit-shaped, so it passed the
    // pattern and then string-compared later than today, reporting a nonsense
    // date as "in the future". Round-trip through Date so only real calendar
    // days get that far.
    // NB: Date.toISOString() THROWS RangeError on an Invalid Date, so the
    // getTime() check has to come first — reaching for the round-trip directly
    // killed the gate with a stack trace instead of reporting the bad value.
    const dateShaped = /^\d{4}-\d{2}-\d{2}$/.test(b.verifiedAt ?? "")
    const parsed = dateShaped ? new Date(`${b.verifiedAt}T00:00:00Z`) : null
    const realDate =
      parsed !== null &&
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === b.verifiedAt
    if (!realDate) {
      errors.push({
        component: "sync-stamp",
        message: `S4: ${key}.verifiedAt is ${JSON.stringify(b.verifiedAt)}, not a real ISO YYYY-MM-DD date`,
      })
    } else if (b.verifiedAt > today) {
      errors.push({
        component: "sync-stamp",
        message: `S4: ${key}.verifiedAt is ${b.verifiedAt}, which is in the future (today is ${today}) — a stamp cannot describe a run that has not happened`,
      })
    }

    // S5 — the commit it names. componentSync explains the top-level stamp, so
    // that is the SHA it is held to; tokenSync carries its own.
    const sha = shaField ? b[shaField] : lock.syncedFromCommit
    const label = shaField ? `${key}.${shaField}` : "syncedFromCommit"
    if (!/^[0-9a-f]{40}$/i.test(sha ?? "")) {
      errors.push({
        component: "sync-stamp",
        message: `S5: ${label} is ${JSON.stringify(sha)}, not a full 40-character SHA — an abbreviated or missing commit cannot be verified later`,
      })
    } else if (canResolve) {
      let exists = true
      try {
        execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], {
          cwd: ROOT,
          stdio: "ignore",
        })
      } catch {
        exists = false
      }
      if (!exists) {
        errors.push({
          component: "sync-stamp",
          message: `S5: ${label} names ${sha.slice(0, 7)}, which is not a commit in this repository — the stamp points at nothing (same shape as the #124 mapping that named a token that no longer existed)`,
        })
      }
    }
  }

  // S6 — componentSync and the top-level stamp describe ONE event, so they must
  // agree. Divergence is exactly the #85 failure the lock's own $comment
  // records: the Figma push happened, the stamp moved, and the map did not.
  const cs = lock.componentSync
  if (cs && /^\d{4}-\d{2}-\d{2}$/.test(cs.verifiedAt ?? "") && cs.verifiedAt !== lock.syncedAt) {
    errors.push({
      component: "sync-stamp",
      message: `S6: componentSync.verifiedAt (${cs.verifiedAt}) disagrees with the top-level syncedAt (${lock.syncedAt}) — they record the same run, so one was moved without the other`,
    })
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
  // --font-heading is modelled as its own token (conventions.typography.fontHeading),
  // so it no longer aliasing font-sans is a SUPPORTED move, not a warning — that is
  // the point of themeable-typography. What must hold is that the record keeps up:
  // once the alias breaks, the two Figma variables carry different families and the
  // declared `figma` value for the heading face has to say so.
  const headingAliases = /--font-heading:\s*var\(--font-sans\)/.test(indexCss)
  const h = t.fontHeading
  if (!h?.figmaVariable) {
    errors.push({
      component: "typography",
      message: `T2: conventions.typography has no fontHeading record — the ramp binds two font variables (see fontTokenByStep), so both must be declared`,
    })
  } else if (headingAliases && h.figma !== f.figma) {
    errors.push({
      component: "typography",
      message: `T2: --font-heading still aliases var(--font-sans) so both faces resolve to '${f.figma}', but conventions declares the heading face as '${h.figma}' — fix the record or break the alias in src/index.css`,
    })
  } else if (!headingAliases && h.aliasOf) {
    warns.push({
      component: "typography",
      message: `--font-heading no longer aliases var(--font-sans), but conventions.typography.fontHeading still records aliasOf: '${h.aliasOf}' — drop aliasOf and set its own \`figma\` family, then re-run the token sync`,
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
        message: `"${styleName}" fontFamily is set directly, not bound to a font variable (bind failed at last sync) — rebinding is cosmetic, values still match`,
      })
    }
  }

  // T8 — WHICH font variable each step binds.
  //
  // T7 above compares the RESOLVED family, and that is not enough: --font-heading
  // aliases --font-sans today, so both variables read "Inter" and a sync that
  // rebound every style to font-sans would pass every check while quietly
  // destroying the heading/body split. It would surface only once a brand gave the
  // heading face its own family — as headings rendering in the body font, with a
  // green gate. So compare the binding itself, by name, not the value it happens
  // to resolve to.
  const varByToken = { [f.token]: f.figmaVariable, [h?.token]: h?.figmaVariable }
  for (const [util, styleName] of Object.entries(conventions.textStyles)) {
    const wantToken = t.fontTokenByStep?.[util]
    if (!wantToken) {
      errors.push({
        component: "typography",
        message: `T8: conventions.typography.fontTokenByStep has no entry for ramp step ${util} — every step must declare which font token it binds`,
      })
      continue
    }
    const wantVar = varByToken[wantToken]
    if (!wantVar) {
      errors.push({
        component: "typography",
        message: `T8: ramp step ${util} declares font token '${wantToken}', which matches no declared font record (${Object.keys(varByToken).filter(Boolean).join("/")})`,
      })
      continue
    }
    const entry = lock.typography.textStyles?.[styleName]
    if (!entry) continue // already reported by T7
    if (!entry.boundVariable) {
      warns.push({
        component: "typography",
        message: `T8: lock records no boundVariable for "${styleName}" — which font variable it binds is unverified; re-run the token sync`,
      })
      continue
    }
    if (entry.boundVariable !== wantVar) {
      errors.push({
        component: "typography",
        message: `T8: "${styleName}" is bound to ${entry.boundVariable} in Figma but ramp step ${util} declares '${wantToken}' (${wantVar}) — the two faces resolve to the same family today, so this will NOT show up as a wrong font until the heading face diverges; re-run the token sync or fix fontTokenByStep`,
      })
    }
  }
}

// --- run --------------------------------------------------------------------------
const cfg = await import(pathToFileURL(join(ROOT, "figma/components.config.mjs")))
const manifests = cfg.default
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

// The system-level typography (T1–T4, T6–T8) and sync-stamp (S1–S6) checks are not per-component —
// full mode only (the --file path is the per-edit PostToolUse hook; keep it
// fast and scoped). T5 is the exception: it lives in lintBindings above and
// runs per-manifest in both modes.
let coverage = null
if (!singleRel) {
  coverage = checkCoverage(errors, warns, manifests)
  const lock = checkLockReconciliation(errors, warns, manifests)
  if (lock) checkSyncStamps(errors, warns, lock)
  checkTypography(errors, warns)
}

// --- report -------------------------------------------------------------------------
const scope = singleRel
  ?? (coverage
    ? `${coverage.mirrored} mirrored \u00b7 ${coverage.excluded} excluded \u00b7 ${coverage.classified} classified`
    : `${checked.length} component manifest(s)`)
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
  // Neutral heading: `warns` carries binding, coverage, lock AND typography
  // warnings. Each line is already tagged with its `[component]`, so the
  // category survives without the heading claiming they are all bindings.
  console.error(`⚠ Warnings (${warns.length}):\n`)
  for (const w of warns) console.error(`  [${w.component}] ${w.message}`)
  console.error("")
}
console.error(
  `Checked ${scope}. ${errors.length} error(s), ${warns.length} warning(s).`
)

if (errors.length) process.exit(singleRel ? 2 : 1)
process.exit(0) // warn-only: print but don't fail
