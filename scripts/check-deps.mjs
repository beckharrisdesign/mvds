// Runtime dependency budget. What a consumer installs is a design constraint,
// enforced here rather than remembered.
//
//   npm run check:deps                     all three checks (CI default)
//   node scripts/check-deps.mjs --json     machine-readable summary
//   node scripts/check-deps.mjs --list     also print the resolved tree
//
// Why this exists. Until openspec: trim-runtime-dependency-graph the published
// package resolved 386 transitive packages. 302 of them were the `shadcn` CLI,
// sitting in `dependencies` to satisfy ONE line in src/index.css that supplied
// ~1.6 KB of static CSS — 78% of a consumer's install for a stylesheet. Nothing
// noticed, because every other house rule is machine-checked (check:contrast,
// check:principles, check:upstream-drift) and the dependency surface was not.
// Vendoring that CSS and scoping the Radix umbrella to the six primitives src/
// actually imports took the tree to 55. This gate keeps it there.
//
// Three checks:
//
//   1. BUDGET     — resolve `dependencies` + `peerDependencies` with
//                   `npm install --package-lock-only` (no tarballs downloaded)
//                   and fail above CEILING.
//   2. BIN-ONLY   — fail a `dependencies` entry that declares `bin` AND is
//                   referenced by no import/require/@import under src/. Both
//                   conditions required: that is the exact shape of the bug
//                   above, and a CLI the source genuinely imports still passes.
//   3. CSS DRIFT  — byte-compare src/shadcn-variants.css against the installed
//                   node_modules/shadcn/dist/tailwind.css. `shadcn` stayed in
//                   the repo as a devDependency, so the upstream is already on
//                   disk: no network fetch, no stamped baseline, no vendored
//                   copy to maintain. Deliberately NOT the .upstream/ pattern,
//                   which exists because the hub files have no npm presence.
//
// Raising CEILING is allowed and expected — it is meant to be a line someone
// edits on purpose, in the same PR that adds the dependency, not a number that
// drifts. There is no headroom for exactly that reason.

import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Maximum transitive packages a consumer may install. See header. */
const CEILING = 55;

/** Vendored upstream CSS -> the installed devDependency it was copied from. */
const VENDORED = [
  {
    local: "src/shadcn-variants.css",
    upstream: "node_modules/shadcn/dist/tailwind.css",
    pkg: "shadcn",
  },
];

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const listTree = argv.includes("--list");

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const red = (s) => (color ? `\x1b[31m${s}\x1b[0m` : s);
const green = (s) => (color ? `\x1b[32m${s}\x1b[0m` : s);
const dim = (s) => (color ? `\x1b[2m${s}\x1b[0m` : s);
const say = (...a) => { if (!asJson) console.log(...a); };

const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const deps = pkg.dependencies ?? {};
const failures = [];

/* -- 1. BUDGET ------------------------------------------------------------ */

function resolveTree() {
  const dir = mkdtempSync(path.join(tmpdir(), "mvds-deps-"));
  try {
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: "mvds-dep-budget-probe",
        version: "1.0.0",
        private: true,
        dependencies: { ...deps, ...(pkg.peerDependencies ?? {}) },
      })
    );
    execFileSync("npm", ["install", "--package-lock-only", "--silent"], {
      cwd: dir,
      stdio: "ignore",
    });
    const lock = JSON.parse(
      readFileSync(path.join(dir, "package-lock.json"), "utf8")
    );
    return Object.keys(lock.packages)
      .filter((p) => p.startsWith("node_modules/"))
      .map((p) => p.replace(/^node_modules\//, ""))
      .sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

say(dim("resolving dependencies + peers (no tarballs downloaded)…"));
const tree = resolveTree();

if (tree.length > CEILING) {
  // Name the direct dependencies carrying the most weight, so the failure says
  // what to look at rather than just that a number moved.
  const byOwner = Object.keys(deps)
    .map((d) => ({
      dep: d,
      owns: tree.filter((t) => t === d || t.startsWith(`${d}/`)).length,
    }))
    .sort((a, b) => b.owns - a.owns)
    .slice(0, 5);
  failures.push(
    [
      `${red("✗")} dependency budget exceeded: ${tree.length} packages, ceiling ${CEILING} (+${tree.length - CEILING})`,
      "    heaviest direct dependencies:",
      ...byOwner.map((o) => `      ${o.owns.toString().padStart(4)}  ${o.dep}`),
      "    Raise CEILING in scripts/check-deps.mjs in this PR if the growth is intended.",
    ].join("\n")
  );
} else {
  say(
    `${green("✓")} dependency budget: ${tree.length}/${CEILING} packages` +
      (tree.length < CEILING ? dim(`  (${CEILING - tree.length} under)`) : "")
  );
}
if (listTree) for (const t of tree) say(dim(`      ${t}`));

/* -- 2. BIN-ONLY ---------------------------------------------------------- */

function sourceText() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|css|mjs)$/.test(entry))
        out.push(readFileSync(full, "utf8"));
    }
  };
  walk(path.join(ROOT, "src"));
  return out.join("\n");
}

const src = sourceText();
for (const dep of Object.keys(deps)) {
  const manifest = path.join(ROOT, "node_modules", dep, "package.json");
  if (!existsSync(manifest)) continue;
  const meta = JSON.parse(readFileSync(manifest, "utf8"));
  if (!meta.bin) continue;
  // Referenced by any import/require/@import, bare or subpath?
  const referenced = new RegExp(
    `["']${dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/[^"']*)?["']`
  ).test(src);
  if (!referenced) {
    failures.push(
      [
        `${red("✗")} ${dep} declares "bin" and is imported nowhere under src/`,
        `    A CLI does not belong in "dependencies" — every consumer installs it.`,
        `    Move it to "devDependencies"; invoke it with npx.`,
      ].join("\n")
    );
  }
}
if (!failures.some((f) => f.includes('declares "bin"')))
  say(`${green("✓")} no tooling-only packages in dependencies`);

/* -- 3. CSS DRIFT --------------------------------------------------------- */

for (const { local, upstream, pkg: name } of VENDORED) {
  const localPath = path.join(ROOT, local);
  const upstreamPath = path.join(ROOT, upstream);
  if (!existsSync(localPath)) {
    failures.push(`${red("✗")} vendored file missing: ${local}`);
    continue;
  }
  if (!existsSync(upstreamPath)) {
    say(
      dim(`  ~ ${name} not installed — skipping drift check for ${local}`)
    );
    continue;
  }
  // The vendored file is the upstream body plus a provenance header. Compare
  // only the body: everything from the first line of upstream onward.
  const upstreamBody = readFileSync(upstreamPath, "utf8");
  const localBody = readFileSync(localPath, "utf8");
  if (!localBody.endsWith(upstreamBody)) {
    failures.push(
      [
        `${red("✗")} ${local} has drifted from ${upstream}`,
        `    Re-copy the body, update the version + sha256 in its header, and re-run the gates.`,
        `    The declarations drive component states, so a diff is a visual change.`,
      ].join("\n")
    );
  } else {
    say(`${green("✓")} ${local} matches ${name}@${JSON.parse(readFileSync(path.join(ROOT, "node_modules", name, "package.json"), "utf8")).version}`);
  }
}

/* -- report --------------------------------------------------------------- */

if (asJson) {
  console.log(
    JSON.stringify(
      { count: tree.length, ceiling: CEILING, ok: failures.length === 0, failures: failures.length, tree },
      null,
      2
    )
  );
}

if (failures.length) {
  if (!asJson) {
    console.error("");
    for (const f of failures) console.error(f);
    console.error("");
  }
  process.exit(1);
}

say(green(`\n✓ dependency budget clean — ${tree.length}/${CEILING} packages.`));
