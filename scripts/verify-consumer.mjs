// Consumer-path verification — proves the documented install actually works.
//
//   npm run verify:consumer            install from the PUBLIC npm registry
//   npm run verify:consumer -- --local pack this repo and install THAT tarball
//
// Why two modes:
//   default  answers "can a stranger follow docs/CONSUMING.md today?" — it
//            installs the PUBLISHED package exactly as a newcomer would, with no
//            auth and no .npmrc. This is the gate that catches doc drift (the
//            docs claimed GitHub Packages + a PAT long after the move to public
//            npm). It deliberately does NOT test this branch's source.
//   --local  answers "will the NEXT release still work?" — packs the working
//            tree via npm pack and installs that tarball instead. Run it before
//            cutting a release.
//
// Either way the assertions are the same: the starter must install clean, build
// clean, and emit CSS that proves the token layer AND the `@source` line landed.
//
// Exit codes: 0 = the path works. 1 = it does not (with the reason printed).

import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const STARTER = join(ROOT, "examples", "starter")
const LOCAL = process.argv.includes("--local")

function run(cmd, args, cwd, label) {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}   (${label})\n`)
  execFileSync(cmd, args, { cwd, stdio: "inherit" })
}

const failures = []
function assert(condition, what, why) {
  if (condition) {
    console.log(`  ✓ ${what}`)
  } else {
    console.log(`  ✗ ${what}`)
    failures.push(`${what} — ${why}`)
  }
}

// --- 0. sanity ------------------------------------------------------------------
if (!existsSync(join(STARTER, "package.json"))) {
  console.error(`No starter app at ${STARTER}`)
  process.exit(1)
}

// --- 1. clean the starter so the install is genuinely fresh ---------------------
// A stranger has no node_modules and no lockfile. Neither may we.
for (const junk of ["node_modules", "package-lock.json", "dist"]) {
  rmSync(join(STARTER, junk), { recursive: true, force: true })
}

// --- 2. install ------------------------------------------------------------------
// No .npmrc is written anywhere: if the package needed auth, this step fails —
// which is precisely the regression we want to catch.
let tarball = null
if (LOCAL) {
  const packDir = mkdtempSync(join(tmpdir(), "mvds-pack-"))
  run("npm", ["run", "build:lib"], ROOT, "build the library first")
  const packed = execFileSync("npm", ["pack", "--pack-destination", packDir], {
    cwd: ROOT,
  })
    .toString()
    .trim()
    .split("\n")
    .pop()
  tarball = join(packDir, packed)
  console.log(`\nPacked working tree → ${tarball}`)
}

run("npm", ["install", "--no-audit", "--no-fund"], STARTER, "fresh install")
if (LOCAL) {
  run(
    "npm",
    ["install", tarball, "--no-audit", "--no-fund"],
    STARTER,
    "overlay the local tarball"
  )
}

// --- 3. build --------------------------------------------------------------------
run("npm", ["run", "build"], STARTER, "typecheck + vite build")

// --- 4. assert the build actually produced a styled app -------------------------
const assetsDir = join(STARTER, "dist", "assets")
const cssFile = existsSync(assetsDir)
  ? readdirSync(assetsDir).find((f) => f.endsWith(".css"))
  : null

console.log("\nChecking the emitted CSS:")
if (!cssFile) {
  failures.push("no CSS emitted — the Tailwind/Vite wiring did not run")
  console.log("  ✗ a stylesheet was emitted")
} else {
  const css = readFileSync(join(assetsDir, cssFile), "utf8")

  // The token layer arrived (styles.css import resolved).
  assert(
    css.includes("--background:") && css.includes("--primary:"),
    "token layer is present",
    "the @import of @beckharrisdesign/mvds/styles.css did not resolve"
  )

  // Dark mode ships as a `.dark` class on a root ancestor, not
  // prefers-color-scheme. The DIRECT proof it survived the build is the raw
  // `.dark { --token: … }` override block from styles.css passing through as
  // plain CSS — this holds regardless of whether any component happens to use a
  // `dark:` utility. (A `dark:` utility ALSO compiles, against the token layer's
  // `@custom-variant dark (&:is(.dark *))`, into `:is(.dark *)` selectors — but
  // that is the indirect signal; assert the token block head-on.)
  assert(
    /\.dark\s*\{[^}]*--background/.test(css),
    "dark-mode token overrides are emitted",
    "the .dark { … } token block from styles.css did not survive the build"
  )

  // The semantic type ramp made it through as real utilities.
  assert(
    /\.text-h2\b/.test(css),
    "semantic type ramp is emitted",
    "the @theme type ramp did not become utilities"
  )

  // THE @source CHECK. `bg-success` and `rounded-xl` appear only inside the
  // PACKAGE's components (badge.tsx / card.tsx in dist-lib), never in the
  // starter's own source. If the @source line pointing at dist-lib were missing,
  // Tailwind could not see them and would emit neither — the classic
  // "components render but are unstyled" failure.
  assert(
    /\.bg-success\b/.test(css) || css.includes("bg-success"),
    "package-only utilities are emitted (@source dist-lib works)",
    "Tailwind never scanned dist-lib — components would render unstyled"
  )
  assert(
    /\.rounded-xl\b/.test(css),
    "package component utilities are emitted",
    "Tailwind never scanned dist-lib — components would render unstyled"
  )

  console.log(`\n  (${cssFile}, ${(css.length / 1024).toFixed(1)} kB)`)
}

// --- 5. report --------------------------------------------------------------------
const source = LOCAL ? "the LOCAL working tree" : "the PUBLISHED npm package"
if (failures.length) {
  console.error(`\n✗ Consumer path is broken against ${source}:\n`)
  for (const f of failures) console.error(`  · ${f}`)
  console.error("")
  process.exit(1)
}
console.log(`\n✓ Consumer path verified against ${source}.`)
console.log("  A fresh clone can install with no auth and build a styled app.\n")
