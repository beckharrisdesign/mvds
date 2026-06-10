// Manifest snapshot generator — aggregates every MVDS manifest (principles,
// Figma component manifests, conventions, figma.lock.json, the token layer,
// the spacing scale) into one committed JSON the landing page renders as
// object cards: name, path, counts, and code-vs-Figma mapping status.
//
//   npm run generate:snapshot     → writes src/generated/manifest-snapshot.json
//
// The snapshot is DETERMINISTIC per commit: `generatedAt` is the HEAD commit
// date (not wall clock) and the write is skipped when the output is
// byte-identical, so regenerating on a clean tree never churns the file. It is
// committed so vite dev / Storybook / vitest work on a fresh clone with no
// pre-hook; `prebuild` and build-site.mjs regenerate it before any deploy.
//
// Status semantics (maps onto the Badge triad — see AGENTS.md):
//   success     = in-sync: the lock matches the manifest / lock current at HEAD
//   neutral     = informational, or not synced yet / lock trailing HEAD — the
//                 EXPECTED state in a code-first repo (the mirror trails)
//   destructive = genuine disagreement (lock variant drift, light/dark token
//                 mismatch) — something a sync or token fix must resolve

import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "src", "generated", "manifest-snapshot.json")

// --- load every manifest -------------------------------------------------------
const { default: baseManifest } = await import(
  pathToFileURL(join(ROOT, "principles.config.mjs"))
)
const { resolveManifest, selectContextLayers } = await import(
  pathToFileURL(join(ROOT, "principles.resolve.mjs"))
)
const { default: componentManifests } = await import(
  pathToFileURL(join(ROOT, "figma", "components.config.mjs"))
)
const { default: conventions } = await import(
  pathToFileURL(join(ROOT, "figma", "conventions.mjs"))
)
const lock = JSON.parse(readFileSync(join(ROOT, "figma", "figma.lock.json"), "utf8"))
const css = readFileSync(join(ROOT, "src", "index.css"), "utf8")

const principles = resolveManifest(baseManifest, selectContextLayers()).principles

// --- git metadata (absent outside a repo — degrade, don't throw) ----------------
function git(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
  } catch {
    return null
  }
}

const commit = git("rev-parse --short HEAD") ?? "unknown"
const generatedAt = git("log -1 --format=%cI") ?? "unknown"
// The snapshot itself is excluded — its own regeneration must not flip the flag.
const dirty = (git("status --porcelain") ?? "")
  .split("\n")
  .filter((l) => l && !l.includes("src/generated/manifest-snapshot.json"))
  .length > 0
const behind = git(`rev-list --count ${lock.syncedFromCommit}..HEAD`)
const commitsBehind = behind === null ? null : Number(behind)

// --- token-layer counts (cheap regex over src/index.css) ------------------------
const colorUtilities = [...css.matchAll(/^\s*--color-[\w-]+:/gm)].length
const radiusSteps = [...css.matchAll(/^\s*--radius-[\w-]+:/gm)].length
// Ramp BASE steps only — sub-properties are --text-x--line-height etc.
const rampSteps = [...css.matchAll(/^\s*--(text-[\w-]+):/gm)]
  .map((m) => m[1])
  .filter((name) => !name.includes("--")).length

const propsOf = (block) =>
  new Set([...block.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]))
const lightProps = propsOf(css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "")
const darkProps = propsOf(css.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? "")
// `radius` is a dimension, identical across modes — defined once in :root.
const MODE_INVARIANT = new Set(["radius"])
const lightOnly = [...lightProps].filter(
  (p) => !darkProps.has(p) && !MODE_INVARIANT.has(p)
)
const darkOnly = [...darkProps].filter((p) => !lightProps.has(p))
const parityOk = lightOnly.length === 0 && darkOnly.length === 0

// --- status helpers --------------------------------------------------------------
const WORST = { destructive: 2, neutral: 1, success: 0 }
const worstLevel = (statuses) =>
  statuses.reduce((a, s) => (WORST[s.level] > WORST[a] ? s.level : a), "success")

// --- cards ------------------------------------------------------------------------
const principlesCard = {
  id: "principles",
  name: "Principles",
  path: "principles.config.mjs",
  kind: "enforcement",
  description:
    "Golden rules encoded as data — machine-enforced by check:principles and the edit-guard hook.",
  counts: [
    { label: "principles", value: principles.length },
    { label: "enabled", value: principles.filter((p) => p.enabled).length },
    {
      label: "error severity",
      value: principles.filter((p) => p.severity === "error").length,
    },
  ],
  status: { level: "neutral", label: "code-only", detail: "No Figma mapping applies." },
  items: principles.map((p) => ({
    name: p.id,
    meta: `${p.check.kind} · ${p.severity}${p.enabled ? "" : " · disabled"}`,
  })),
}

const componentItems = componentManifests.map((m) => {
  const declared = m.axes.reduce((n, axis) => n * axis.options.length, 1)
  const entry = lock.components?.[m.name]
  const synced = entry ? Object.keys(entry.variants ?? {}).length : 0
  const status =
    !entry || !entry.componentSetId
      ? { level: "neutral", label: "not synced" }
      : synced === declared
        ? { level: "success", label: `synced ${synced}/${declared}` }
        : { level: "destructive", label: `drift ${synced}/${declared}` }
  return {
    name: m.name,
    meta: `${m.axes.length} ${m.axes.length === 1 ? "axis" : "axes"} · ${declared} variants · ${m.code.file}`,
    status,
  }
})

const declaredTotal = componentManifests.reduce(
  (n, m) => n + m.axes.reduce((v, a) => v * a.options.length, 1),
  0
)
const syncedTotal = Object.values(lock.components ?? {}).reduce(
  (n, e) => n + Object.keys(e.variants ?? {}).length,
  0
)
const componentsLevel = worstLevel(componentItems.map((i) => i.status))
const componentsCard = {
  id: "figma-components",
  name: "Figma component manifests",
  path: "figma/components.config.mjs",
  kind: "figma mirror",
  description:
    "Per-component variant specs, drift-guarded against the code by check:figma; the sync skill reads them as the mirror spec.",
  counts: [
    { label: "components", value: componentManifests.length },
    { label: "declared variants", value: declaredTotal },
    { label: "synced variants", value: syncedTotal },
  ],
  status:
    componentsLevel === "success"
      ? { level: "success", label: `synced ${syncedTotal}/${declaredTotal}` }
      : componentsLevel === "neutral"
        ? { level: "neutral", label: `synced ${syncedTotal}/${declaredTotal}` }
        : { level: "destructive", label: `drift ${syncedTotal}/${declaredTotal}` },
  items: componentItems,
}

const conventionsCard = {
  id: "conventions",
  name: "Conventions",
  path: "figma/conventions.mjs",
  kind: "mapping rules",
  description:
    "Mechanical code → Figma mapping, declared once: which utility binds to which variable or text style.",
  counts: [
    { label: "text styles", value: Object.keys(conventions.textStyles).length },
    { label: "spacing steps", value: conventions.spacing.scale.length },
    { label: "radius mappings", value: Object.keys(conventions.radius).length },
    {
      label: "font weights",
      value: Object.keys(conventions.typography.weightToFigmaStyle).length,
    },
  ],
  status: { level: "neutral", label: "code-only", detail: "Rules, not synced state." },
}

const derivedVariables = Object.keys(lock.derivedVariables ?? {}).filter(
  (k) => !k.startsWith("$")
).length
const lockCard = {
  id: "figma-lock",
  name: "Figma lock",
  path: "figma/figma.lock.json",
  kind: "lock file",
  description:
    "Machine-recorded Figma reality — node IDs written by the sync skills so re-syncs update in place.",
  counts: [
    { label: "components", value: Object.keys(lock.components ?? {}).length },
    { label: "derived variables", value: derivedVariables },
    { label: "pages", value: Object.keys(lock.pages ?? {}).length },
  ],
  status:
    commitsBehind === 0
      ? { level: "success", label: "current", detail: `Synced ${lock.syncedAt} at HEAD.` }
      : commitsBehind === null
        ? { level: "neutral", label: "unknown", detail: "Git history unavailable." }
        : {
            level: "neutral",
            label: `${commitsBehind} commit${commitsBehind === 1 ? "" : "s"} behind`,
            detail: `Synced ${lock.syncedAt} from ${lock.syncedFromCommit} — code-first, the mirror trails until the next requested sync.`,
          },
}

const tokensCard = {
  id: "tokens",
  name: "Token layer",
  path: "src/index.css",
  kind: "source of truth",
  description:
    "Colors (light + dark), radius, breakpoints, and the type ramp — the single source every surface reads.",
  counts: [
    { label: "color utilities", value: colorUtilities },
    { label: "light tokens", value: lightProps.size },
    { label: "dark tokens", value: darkProps.size },
    { label: "radius steps", value: radiusSteps },
    { label: "type ramp", value: rampSteps },
  ],
  status: parityOk
    ? { level: "success", label: "light/dark parity" }
    : {
        level: "destructive",
        label: "mode drift",
        detail: [
          lightOnly.length ? `light-only: ${lightOnly.join(", ")}` : null,
          darkOnly.length ? `dark-only: ${darkOnly.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      },
}

const scalesCard = {
  id: "scales",
  name: "Spacing scale",
  path: "src/components/layout/scales.ts",
  kind: "spacing scale",
  description: `The 8-grid — multiples & fractions of 8: ${conventions.spacing.scale.join(" · ")}. Purge-safe class maps for the layout primitives.`,
  counts: [{ label: "steps", value: conventions.spacing.scale.length }],
  status: {
    level: "neutral",
    label: "code-only",
    detail: "Mirrored to Figma as the Scales collection (space-{px}).",
  },
}

// --- assemble + idempotent write --------------------------------------------------
const snapshot = {
  generatedAt,
  commit,
  dirty,
  lock: {
    fileKey: lock.fileKey,
    syncedAt: lock.syncedAt,
    syncedFromCommit: lock.syncedFromCommit,
    commitsBehind,
  },
  manifests: [
    principlesCard,
    componentsCard,
    conventionsCard,
    lockCard,
    tokensCard,
    scalesCard,
  ],
}

const json = JSON.stringify(snapshot, null, 2) + "\n"
if (existsSync(OUT) && readFileSync(OUT, "utf8") === json) {
  console.log(`manifest snapshot unchanged (${commit})`)
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, json)
  console.log(`wrote src/generated/manifest-snapshot.json (${commit})`)
}
