// System-level Figma gate checks, as PURE FUNCTIONS over their inputs.
//
// These used to live inline in scripts/check-figma-manifest.mjs, reading
// module-scope state (the parsed conventions, src/index.css, the lock) and
// shelling out to git mid-check. That made them unreachable from a test: the
// only way to exercise S4's "2026-13-45" case was to edit figma.lock.json in
// place, run the CLI, read the exit code and put the file back — which is
// exactly what the throwaway harness that FOUND that bug did, and it scored a
// RangeError crash as a pass because an exit code cannot tell a caught error
// from an uncaught one.
//
// So the inputs are parameters now, and the tests in figma-gates.test.mjs call
// these directly and assert on the returned error/warning records. Nothing
// about what they check changed in the move.
//
// The CLI (scripts/check-figma-manifest.mjs) reads the files, answers "can this
// clone resolve a commit?", and passes both in.

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
export const SYNC_RESULTS = new Set(["no-op", "written"])

// `today` is injected rather than read from the clock so S4's "is this date in
// the future?" arm is testable without time-travelling the machine.
// `commitExists` is null when the clone cannot answer (CI's depth-1 checkout),
// which is the whole reason S5 splits SHAPE from RESOLVABILITY — see above.
export function checkSyncStamps(errors, warns, lock, { today, commitExists = null }) {

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
    } else if (commitExists) {
      if (!commitExists(sha)) {
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
export function checkTypography(errors, warns, { conventions, indexCss, pkg, lock }) {
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

  // T6/T7 — recorded Figma reality (the lock). The caller passes null when the
  // file is missing or unparseable, and has already reported that.
  if (!lock) {
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

// --- convention mappings (M0–M6, full mode only) ----------------------------------
// figma/conventions.mjs holds two kinds of entry: RULES over an open set, which
// stay prose, and MAPPINGS over a closed set. A mapping is a record with a
// `source`, a `target` and a finite `members` list, and these checks expand it
// and hold BOTH sides to resolving:
//
//   M0  the record is one this gate understands (unknown source/target kind fails
//       rather than being skipped — a mapping nobody checks is the whole defect)
//   M1  every member's CSS custom property is really declared in src/index.css
//   M2  every member's Figma variable is really recorded in figma.lock.json
//   M3  census forward: no token in src/index.css matching the source pattern is
//       left unclaimed by a member
//   M4  census back: no variable in the lock matching the target pattern is left
//       unclaimed by a member
//   M5  for utility-sourced mappings, every `bg-X/N` in src/ is a member or a
//       declared `notMirrored` carve-out (and a carve-out for a member is stale)
//   M6  a `px` fallback map is recomputed from the token layer, so a rebased
//       --radius fails here instead of shipping Figma at the old proportions
//
// Discovered by SHAPE, not by a list of paths: add a `{ source, target, members }`
// record anywhere in conventions and it is checked from that moment. That is
// deliberate — the alternative is a second list to keep in step, which is the
// class of bug these checks exist to catch.

const VARIABLE_NAME = /^(Color|Sizing|Spacing|Typography)\/[A-Za-z0-9_.-]+$/

/** Every Figma VARIABLE name figma.lock.json records, however it is nested. */
export function lockVariableNames(lock) {
  const names = new Set()
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== "object") return
    for (const [k, v] of Object.entries(node)) {
      // Variables appear as map KEYS ("Sizing/z-toast": "VariableID:…") and as
      // referenced VALUES (a text style's `name`/`boundVariable`). Both count as
      // recorded; `Type/*` text styles are styles, not variables, so they are
      // outside VARIABLE_NAME on purpose.
      if (VARIABLE_NAME.test(k)) names.add(k)
      if ((k === "name" || k === "boundVariable") && typeof v === "string" && VARIABLE_NAME.test(v)) {
        names.add(v)
      }
      walk(v)
    }
  }
  walk(lock)
  return names
}

/** Every closed mapping in `conventions`, found by shape. */
export function conventionMappings(conventions) {
  const found = []
  const walk = (node, path) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return
    if (node.source && node.target && Array.isArray(node.members)) {
      found.push({ path, record: node })
      return // a mapping's own fields are not further mappings
    }
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k)
  }
  walk(conventions, "")
  return found
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")

/** `--chrome-{name}` → { expand(member), discover: /^--chrome-(…)$/ }. */
function compilePattern(pattern) {
  const i = pattern.indexOf("{name}")
  if (i === -1) return null
  const prefix = pattern.slice(0, i)
  const suffix = pattern.slice(i + "{name}".length)
  return {
    prefix,
    suffix,
    expand: (name) => prefix + name + suffix,
    // `*`, not `+`: a family's BASE is the member with no suffix, so its member
    // name is the empty string (radius: "" → `--radius` → `Sizing/radius`). With
    // `+` the census silently skipped it — M1/M2 still resolved the declared
    // member, but M3/M4 could never report it missing, which is half a check.
    discover: new RegExp(`^${escapeRe(prefix)}([A-Za-z0-9_-]*)${escapeRe(suffix)}$`),
  }
}

/** CSS custom properties declared anywhere in a stylesheet. */
function declaredCssVars(css) {
  return new Set([...css.matchAll(/^[ \t]*(--[A-Za-z0-9_-]+)[ \t]*:/gm)].map((m) => m[1]))
}

export function checkConventionMappings(errors, warns, { conventions, indexCss, lock, sources }) {
  const mappings = conventionMappings(conventions)
  if (!mappings.length) {
    errors.push({
      component: "conventions",
      message: `M0: figma/conventions.mjs declares no { source, target, members } mapping — the closed mappings were converted to records so they could be resolved; prose-only means nothing is checked again`,
    })
    return
  }

  const cssVars = declaredCssVars(indexCss)
  const figmaVars = lockVariableNames(lock)

  for (const { path, record } of mappings) {
    const src = compilePattern(record.source.pattern ?? "")
    const tgt = compilePattern(record.target.pattern ?? "")

    // M0 — refuse to silently skip a record this gate does not understand.
    if (record.target.kind !== "figma-variable" || !tgt) {
      errors.push({
        component: "conventions",
        message: `M0: ${path}.target is { kind: ${JSON.stringify(record.target.kind)}, pattern: ${JSON.stringify(record.target.pattern)} } — the target must be kind "figma-variable" with a {name} placeholder, or this mapping cannot be resolved`,
      })
      continue
    }
    if (!["css-var", "utility"].includes(record.source.kind) || !src) {
      errors.push({
        component: "conventions",
        message: `M0: ${path}.source is { kind: ${JSON.stringify(record.source.kind)}, pattern: ${JSON.stringify(record.source.pattern)} } — source.kind must be "css-var" or "utility" with a {name} placeholder; teach this gate the new kind rather than leaving it unchecked`,
      })
      continue
    }
    if (!record.members.length || new Set(record.members).size !== record.members.length) {
      errors.push({
        component: "conventions",
        message: `M0: ${path}.members is ${JSON.stringify(record.members)} — a closed mapping needs at least one member and no duplicates`,
      })
    }

    // M1 — the source side resolves.
    if (record.source.kind === "css-var") {
      for (const name of record.members) {
        const v = src.expand(name)
        if (!cssVars.has(v)) {
          errors.push({
            component: "conventions",
            message: `M1: ${path} maps member "${name}" from ${v}, which src/index.css does not declare — the mapping names a token that does not exist (the #124 failure: source renamed, mapping left behind)`,
          })
        }
      }
      // M3 — and nothing in code is left unclaimed.
      for (const v of cssVars) {
        const m = src.discover.exec(v)
        if (m && !record.members.includes(m[1])) {
          errors.push({
            component: "conventions",
            message: `M3: src/index.css declares ${v} but ${path}.members does not list "${m[1]}" — a new token in this family must be mapped (or the family's pattern narrowed), never left to sync as nothing`,
          })
        }
      }
    }

    // M2 — the target side resolves against recorded Figma reality.
    for (const name of record.members) {
      const v = tgt.expand(name)
      if (!figmaVars.has(v)) {
        errors.push({
          component: "conventions",
          message: `M2: ${path} maps member "${name}" to ${v}, which figma.lock.json does not record — either the variable was renamed in Figma, or it was never created; fix the mapping or re-run the matching sync`,
        })
      }
    }
    // M4 — and nothing recorded in Figma is left unclaimed.
    for (const v of figmaVars) {
      const m = tgt.discover.exec(v)
      if (m && !record.members.includes(m[1])) {
        errors.push({
          component: "conventions",
          message: `M4: figma.lock.json records ${v} but ${path}.members does not list "${m[1]}" — the mirror holds a variable this mapping does not claim`,
        })
      }
    }

    // M5 — utility-sourced mappings are censused against the code that uses them.
    if (record.source.kind === "utility") {
      const carveOuts = record.notMirrored ?? {}
      for (const [name, reason] of Object.entries(carveOuts)) {
        if (record.members.includes(name)) {
          errors.push({
            component: "conventions",
            message: `M5: ${path}.notMirrored carves out "${name}", which is also a member — the carve-out is stale; delete it`,
          })
        } else if (typeof reason !== "string" || reason.trim().length < 20) {
          errors.push({
            component: "conventions",
            message: `M5: ${path}.notMirrored["${name}"] has no real reason — a carve-out without one is a silence with a key`,
          })
        }
      }
      // `bg-{name}/{alpha}` → /\bbg-([A-Za-z0-9_-]+)\/\d+/
      const [, alphaSep] = /\{name\}(.*)\{alpha\}/.exec(record.source.pattern) ?? []
      const usage = new RegExp(
        `\\b${escapeRe(src.prefix)}([A-Za-z0-9_-]+)` +
          (alphaSep === undefined ? escapeRe(src.suffix) : `${escapeRe(alphaSep)}\\d+`),
        "g"
      )
      const seen = new Map() // token → first file that used it
      for (const { file, text } of sources ?? []) {
        for (const m of text.matchAll(usage)) {
          if (!seen.has(m[1])) seen.set(m[1], file)
        }
      }
      for (const [name, file] of seen) {
        if (record.members.includes(name) || name in carveOuts) continue
        errors.push({
          component: "conventions",
          message: `M5: ${file} uses ${src.prefix}${name}/N, but ${path} neither maps "${name}" nor carves it out — add the tint variable and list it, or declare why Figma does not mirror it`,
        })
      }
    }

    // M6 — the px fallback map is recomputed, not trusted.
    if (record.px) checkPxFallback(errors, warns, path, record, indexCss)
  }
}

// A `px` map records what a sync writes where no binding is possible, so it has
// to agree with the token layer it claims to mirror. The ramp is authored as
// `var(--radius)` / `calc(var(--radius) * N)`, so recompute from the base.
function checkPxFallback(errors, warns, path, record, indexCss) {
  const base = /--radius:\s*([\d.]+)rem/.exec(indexCss)
  if (!base) {
    warns.push({
      component: "conventions",
      message: `M6: ${path}.px cannot be verified — src/index.css declares no \`--radius: <n>rem\` base to compute from`,
    })
    return
  }
  const basePx = Number(base[1]) * 16 // rem → px at the 16px root this ramp assumes
  const src = compilePattern(record.source.pattern)
  for (const [name, declared] of Object.entries(record.px)) {
    if (!record.members.includes(name)) {
      errors.push({
        component: "conventions",
        message: `M6: ${path}.px has an entry for "${name}", which is not a member — delete it or add the member`,
      })
      continue
    }
    const decl = new RegExp(`${escapeRe(src.expand(name))}:\\s*([^;]+);`).exec(indexCss)
    if (!decl) continue // M1 already reported the missing token
    const expr = decl[1].trim()
    let computed = null
    if (/^var\(--radius\)$/.test(expr)) computed = basePx
    else {
      const mul = /^calc\(\s*var\(--radius\)\s*\*\s*([\d.]+)\s*\)$/.exec(expr)
      if (mul) computed = basePx * Number(mul[1])
      // The BASE itself is authored as a rem length, not as a multiple of
      // anything — it is what the multiples are multiples OF. Converting it is
      // still a real check: it holds the declared px to the rem actually in the
      // token layer, so a rebase to 0.5rem fails instead of reading as 10px.
      else {
        const rem = /^([\d.]+)rem$/.exec(expr)
        if (rem) computed = Number(rem[1]) * 16
      }
    }
    if (computed === null) {
      warns.push({
        component: "conventions",
        message: `M6: ${path}.px["${name}"] cannot be verified — ${src.expand(name)} is \`${expr}\`, which is neither var(--radius) nor calc(var(--radius) * n)`,
      })
      continue
    }
    if (Math.abs(computed - declared) > 0.01) {
      errors.push({
        component: "conventions",
        message: `M6: ${path}.px["${name}"] says ${declared}px but ${src.expand(name)} computes to ${Math.round(computed * 100) / 100}px from --radius: ${base[1]}rem — the raw value a sync would write is wrong`,
      })
    }
  }
}

// --- M7: a manifest binding's FIGMA target ----------------------------------------
// `lintBindings` in check-figma-manifest.mjs resolves a manifest's `{ var: "x" }`
// against src/index.css and stops there. So the CODE side of every binding has
// been checked for months and the FIGMA side never was — half a check, which is
// this repo's defect class C.
//
// It had a live instance. button.figma.mjs and select.figma.mjs bind cornerRadius
// to `{ var: "radius" }`; a sync resolves that to `Sizing/radius`; and until
// 2026-10-15 figma.lock.json recorded no such name while conventions.mjs mapped
// `rounded-lg` to it. Three bindings pointing at a variable nothing claimed, with
// a green gate. (The variable did exist — the lock was the stale side — but
// nothing here could tell those two cases apart, which is the point.)
//
// Only tokens inside a declared MAPPING are checked, and that restraint is
// deliberate rather than lazy:
//   · `{ var: "space-24" }` → the Spacing/ collection, which the lock does not
//     record at all (see the note on conventions.spacing) — claiming it would
//     fail the gate for what we have not written down, not for what is wrong;
//   · `{ var: "muted-foreground" }` → colour, which is a RULE over an open set,
//     not a mapping, so there is no finite target list to resolve against.
// A token in neither category is simply not this check's business.
export function checkManifestBindingTargets(errors, warns, { conventions, lock, manifests }) {
  const figmaVars = lockVariableNames(lock)
  const cssMappings = conventionMappings(conventions).filter(
    (m) => m.record.source.kind === "css-var"
  )

  for (const manifest of manifests) {
    for (const [token, path] of collectVarBindings(manifest)) {
      for (const { path: mapPath, record } of cssMappings) {
        const src = compilePattern(record.source.pattern)
        const tgt = compilePattern(record.target.pattern)
        if (!src || !tgt) continue // M0 already reported this record
        const m = src.discover.exec(`--${token}`)
        if (!m) continue // not this family's token
        const member = m[1]
        if (!record.members.includes(member)) {
          errors.push({
            component: manifest.name,
            message: `M7: ${path} binds { var: "${token}" }, which belongs to the ${mapPath} family but is not one of its members (${record.members.map((x) => JSON.stringify(x)).join(", ")}) — add the member or fix the binding`,
          })
          break
        }
        const want = tgt.expand(member)
        if (!figmaVars.has(want)) {
          errors.push({
            component: manifest.name,
            message: `M7: ${path} binds { var: "${token}" }, which a sync resolves to ${want} — a name figma.lock.json does not record, so the binding points at nothing verifiable; re-run the matching sync or fix ${mapPath}`,
          })
        }
        break // first matching family wins; patterns are disjoint by construction
      }
    }
  }
}

/** Every `{ var: "<token>" }` in a manifest, as [token, path] pairs. */
function collectVarBindings(manifest) {
  const out = []
  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`))
    if (!node || typeof node !== "object") return
    for (const [k, v] of Object.entries(node)) {
      if (k === "var" && typeof v === "string") out.push([v, path])
      else walk(v, path ? `${path}.${k}` : k)
    }
  }
  walk(manifest.base, "base")
  walk(manifest.perOption, "perOption")
  return out
}
