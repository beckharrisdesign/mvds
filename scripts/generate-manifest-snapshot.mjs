// Manifest snapshot generator — aggregates every MVDS manifest into one
// committed JSON. The landing page renders it as "Elements of the MVDS":
// six peer elements (principles, tokens, component library, Figma library,
// workflow schemas, skills), each with an inventory tally and a full list.
//
//   npm run generate:snapshot     → writes src/generated/manifest-snapshot.json
//
// The snapshot is DETERMINISTIC per commit: `generatedAt` is the HEAD commit
// date (not wall clock) and the write is skipped when the output is
// byte-identical, so regenerating on a clean tree never churns the file. It is
// committed so vite dev / Storybook / vitest work on a fresh clone with no
// pre-hook; `prebuild` and build-site.mjs regenerate it before any deploy.
//
// The elements section carries no status: live gate results render in the
// Verification section (the `gates` array below), and mirror sync state in
// the Figma preview section (openspec: improve-manifests-ia).

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
// Checked-in Figma mirror previews — metadata only (the PNGs are imported as
// Vite assets by the component). Absent is fine: the section presence-gates on
// it, so it simply doesn't render rather than 404-ing.
const exportsPath = join(ROOT, "figma", "exports", "exports.json")
const figmaExports = existsSync(exportsPath)
  ? JSON.parse(readFileSync(exportsPath, "utf8"))
  : null
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
// Lock values are repo-controlled, but they reach a shell string — accept only
// a hex SHA before interpolating.
const syncedSha = /^[0-9a-f]{4,40}$/i.test(lock.syncedFromCommit ?? "")
  ? lock.syncedFromCommit
  : null
const behind = syncedSha ? git(`rev-list --count ${syncedSha}..HEAD`) : null
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
// Mode-INVARIANT tokens are declared once in :root by design, so their absence
// from .dark is correct — not drift. Three families qualify (see src/index.css):
//
//   radius       a dimension, identical in both modes
//   chrome-*     spatial DNA (bar heights / rail widths) — dimensions, not color
//   gray-*       the fixed black↔white ladder, declared once by design.
//   type tokens  faces (--font-*) and step sizes (--text-*-size) are
//                mode-invariant by design — type does not flip with the mode
//                (openspec: themeable-typography).
//                (The gradation scale primary-1…5 / secondary-1…5 is AUTHORED
//                per mode — openspec: stepped-scales — so it appears in both
//                blocks and needs no carve-out here.)
//
// Everything else must appear in BOTH blocks: a color token present in one mode
// only is genuine drift and stays destructive.
const RAMP_STEP = /^gray-(?:50|100|200|300|400|500|600|700|800|900|950)$/
const isModeInvariant = (p) =>
  p === "radius" ||
  p.startsWith("chrome-") ||
  p.startsWith("font-") ||
  (p.startsWith("text-") && p.endsWith("-size")) ||
  RAMP_STEP.test(p)

const lightOnly = [...lightProps].filter(
  (p) => !darkProps.has(p) && !isModeInvariant(p)
)
const darkOnly = [...darkProps].filter((p) => !lightProps.has(p))
const parityOk = lightOnly.length === 0 && darkOnly.length === 0

// --- gates ------------------------------------------------------------------------
// The landing page states that MVDS verifies itself. That claim must be EARNED at
// build time, not typed into a component — so the three fast, hermetic gates are
// actually executed here and their real exit status is recorded.
//
// `npm test` (every story in headless Chromium, light + dark) and
// `verify:consumer` (a fresh registry install) are deliberately NOT run here:
// one needs a browser, the other needs the network, and neither belongs in a
// snapshot regenerated on every build. They are recorded as `ci` gates — a
// statement about what every PR must pass, which is verifiable in ci.yml, rather
// than a claim about this particular build.
function runGate(cmd) {
  try {
    const out = execSync(cmd, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    }).toString()
    return { ok: true, out: out.trim() }
  } catch (err) {
    return { ok: false, out: (err.stdout?.toString() ?? "").trim() }
  }
}

// Pull the summary line the check scripts already print (the one starting ✓/✗).
const summarize = (out, fallback) =>
  out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("✓") || l.startsWith("✗"))
    .pop()
    ?.replace(/^[✓✗]\s*/, "") ?? fallback

const LIVE_GATES = [
  {
    id: "contrast",
    name: "Token contrast",
    detail: "Every foreground/background pairing at WCAG AA 4.5:1, light + dark.",
    command: "npm run check:contrast",
  },
  {
    id: "principles",
    name: "Design principles",
    detail: "The golden rules, machine-enforced from the principle manifest.",
    command: "npm run check:principles",
  },
  {
    id: "figma-drift",
    name: "Figma manifest drift",
    detail: "Declared component axes checked against their real code sources.",
    command: "npm run check:figma",
  },
]

const gates = LIVE_GATES.map((gate) => {
  const { ok, out } = runGate(gate.command)
  return {
    id: gate.id,
    name: gate.name,
    detail: gate.detail,
    command: gate.command,
    verifiedAt: "build",
    result: summarize(out, ok ? "passed" : "failed"),
    status: ok
      ? { level: "success", label: "passing" }
      : { level: "destructive", label: "failing" },
  }
}).concat([
  {
    id: "stories",
    name: "Stories · render + a11y",
    detail:
      "Every story runs in headless Chromium with axe, in BOTH light and dark.",
    command: "npm test",
    verifiedAt: "ci",
    result: "Required on every pull request.",
    status: { level: "success", label: "enforced in CI" },
  },
  {
    id: "consumer",
    name: "Consumer install path",
    detail:
      "The published package installed with no auth into examples/starter, built, and its CSS asserted.",
    command: "npm run verify:consumer",
    verifiedAt: "ci",
    result: "Required on every pull request.",
    status: { level: "success", label: "enforced in CI" },
  },
])

// --- cards ------------------------------------------------------------------------
// The principles, in full, for the landing page's first-class section. Carries
// provenance so a reader can tell what MVDS asserts on its own authority from
// what it adopted from published work — and follow the citation either way.
const principleRecords = principles.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  rationale: p.rationale,
  fix: p.fix,
  severity: p.severity,
  enforcement: p.check.kind === "guiding" ? "judgment" : "automated",
  checkKind: p.check.kind,
  docs: p.docs ?? null,
  source: {
    kind: p.source.kind,
    name: p.source.name,
    url: p.source.url ?? null,
    ref: p.source.ref ?? null,
  },
}))

// --- elements ---------------------------------------------------------------------
// "Elements of the MVDS" (openspec: improve-manifests-ia): six peer elements,
// each with an inventory tally and a full list behind a disclosure. Copy is
// founder-authored and lives in the component; everything here is derived
// from the repo so the section stays a projection of generated data.

import { readdirSync } from "node:fs"

const pascal = (f) =>
  f
    .replace(/\.tsx$/, "")
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")
const familyComponents = (dir) =>
  readdirSync(join(ROOT, "src", "components", dir))
    .filter((f) => f.endsWith(".tsx") && !f.includes(".stories."))
    .map(pascal)
    .sort()

const layoutComponents = familyComponents("layout")
const uiComponents = familyComponents("ui")
const blockComponents = familyComponents("blocks")
const formComponents = familyComponents("forms")

const spacingSteps = conventions.spacing.scale
const radiusNames = [...css.matchAll(/^\s*--radius-([\w-]+):/gm)].map((m) => m[1])
const rampNames = [...css.matchAll(/^\s*--(text-[\w-]+):/gm)]
  .map((m) => m[1])
  .filter((name) => !name.includes("--"))
  .map((name) => name.replace(/^text-/, ""))
// Token families are the stable grouping vocabulary of src/index.css; each
// family below is asserted against the parsed light tokens so the list cannot
// silently outlive the file.
const COLOR_FAMILIES = [
  ["background", "background"],
  ["foreground", "foreground"],
  ["card", "card"],
  ["muted", "muted"],
  ["border", "border"],
  ["primary 1\u20135", "primary-1"],
  ["secondary 1\u20135", "secondary-1"],
  ["gray 50\u2013950", "gray-500"],
  ["success", "success"],
  ["neutral", "neutral"],
  ["destructive", "destructive"],
]
for (const [label, probe] of COLOR_FAMILIES) {
  if (!lightProps.has(probe))
    throw new Error(`token family "${label}" missing from :root (probe --${probe})`)
}

const schemaDirs = readdirSync(join(ROOT, "openspec", "schemas"), {
  withFileTypes: true,
})
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
const claudeSkillDirs = readdirSync(join(ROOT, ".claude", "skills"), {
  withFileTypes: true,
})
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
const entrySkills = claudeSkillDirs.filter((n) => n.startsWith("opsx-")).sort()
const mvdsSkills = claudeSkillDirs.filter((n) => n.startsWith("mvds-")).sort()
const voiceSkills = readdirSync(join(ROOT, "skills"))
  .filter((f) => f.endsWith(".md") && !f.startsWith("openspec"))
  .map((f) => f.replace(/\.md$/, ""))
  .sort()
const ruleFiles = readdirSync(join(ROOT, "rules"))
  .filter((f) => f.endsWith(".mdc"))
  .map((f) => f.replace(/\.mdc$/, ""))
  .sort()

const declaredTotal = componentManifests.reduce(
  (n, m) => n + m.axes.reduce((v, a) => v * a.options.length, 1),
  0
)
const STAGES =
  "proposal \u00b7 specs \u00b7 discovery (as-is, eval, summary) \u00b7 design (propose, eval delta) \u00b7 tasks"

const elements = [
  {
    id: "principles",
    name: "Principles",
    tally: [
      { label: "principles", value: principles.length },
      {
        label: "automated",
        value: principleRecords.filter((p) => p.enforcement === "automated").length,
      },
      {
        label: "by judgment",
        value: principleRecords.filter((p) => p.enforcement === "judgment").length,
      },
    ],
    lists: [{ label: null, items: principleRecords.map((p) => p.title) }],
    action: { label: "All 20 with sources", kind: "anchor", anchor: "principles" },
  },
  {
    id: "tokens",
    name: "Token layer",
    tally: [
      { label: "color utilities", value: colorUtilities },
      { label: "light tokens", value: lightProps.size },
      { label: "dark overrides", value: darkProps.size },
      { label: "spacing steps", value: spacingSteps.length },
      { label: "radius steps", value: radiusNames.length },
      { label: "ramp steps", value: rampSteps },
    ],
    lists: [
      { label: "Color", items: COLOR_FAMILIES.map(([label]) => label) },
      { label: "Type", items: rampNames },
      { label: "Spacing", items: spacingSteps.map(String) },
      { label: "Radius", items: radiusNames },
    ],
    action: { label: "src/index.css", kind: "repo-file", path: "src/index.css" },
  },
  {
    id: "components",
    name: "Component library",
    tally: [
      { label: "layout primitives", value: layoutComponents.length },
      { label: "ui components", value: uiComponents.length },
      { label: "blocks", value: blockComponents.length },
      { label: "form components", value: formComponents.length },
    ],
    lists: [
      { label: "Layout", items: layoutComponents },
      { label: "UI", items: uiComponents },
      { label: "Blocks", items: blockComponents },
      { label: "Forms", items: formComponents },
    ],
    action: { label: "src/components", kind: "repo-dir", path: "src/components" },
  },
  {
    id: "figma",
    name: "Figma library",
    tally: [
      { label: "components", value: componentManifests.length },
      { label: "declared variants", value: declaredTotal },
      { label: "text styles", value: Object.keys(conventions.textStyles).length },
      { label: "pages", value: Object.keys(lock.pages ?? {}).length },
    ],
    lists: [
      {
        label: "Collections",
        items: ["Tokens (Light / Dark)", "Scales", "Customize Here"],
      },
      { label: "Components", items: componentManifests.map((m) => m.name) },
      { label: "Pages", items: Object.keys(lock.pages ?? {}) },
    ],
    action: { label: "figma/", kind: "repo-dir", path: "figma" },
  },
  {
    id: "schemas",
    name: "Workflow schemas",
    tally: [
      { label: "schemas", value: schemaDirs.length },
      { label: "stages", value: 5 },
      { label: "eval gate", value: 1 },
    ],
    lists: [
      { label: "Schemas", items: schemaDirs },
      { label: "Stages", items: [STAGES] },
    ],
    action: { label: "openspec/", kind: "repo-dir", path: "openspec" },
  },
  {
    id: "skills",
    name: "Skills",
    tally: [
      { label: "workflow entry points", value: entrySkills.length },
      { label: "voice skills", value: voiceSkills.length },
      { label: "MVDS skills", value: mvdsSkills.length },
      { label: "rule files", value: ruleFiles.length },
    ],
    lists: [
      { label: "Entry points", items: entrySkills },
      { label: "Voice", items: voiceSkills },
      { label: "MVDS", items: mvdsSkills },
      { label: "Rules", items: ruleFiles },
    ],
    action: { label: ".claude/skills", kind: "repo-dir", path: ".claude/skills" },
  },
]

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
  gates,
  principles: principleRecords,
  figmaExports: figmaExports
    ? {
        fileKey: figmaExports.fileKey,
        capturedAt: figmaExports.capturedAt,
        pages: figmaExports.pages.map((p) => ({
          id: p.id,
          name: p.name,
          file: p.file,
        })),
      }
    : null,
  elements,
}

const json = JSON.stringify(snapshot, null, 2) + "\n"
if (existsSync(OUT) && readFileSync(OUT, "utf8") === json) {
  console.log(`manifest snapshot unchanged (${commit})`)
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, json)
  console.log(`wrote src/generated/manifest-snapshot.json (${commit})`)
}
