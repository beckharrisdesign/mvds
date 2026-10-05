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
    // Keep the lockfile's packages map: the "heaviest" ranking below needs the
    // resolved dependency EDGES, not the install paths.
    return { packages: lock.packages };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Resolve `name` as required from the package at lockfile key `fromKey`,
 * mirroring node resolution: look in that package's own node_modules, then walk
 * up. `fromKey` is "" for the root.
 */
function resolveFrom(packages, fromKey, name) {
  let base = fromKey;
  for (;;) {
    const candidate = `${base ? `${base}/` : ""}node_modules/${name}`;
    if (packages[candidate]) return candidate;
    if (!base) return null;
    const cut = base.lastIndexOf("/node_modules/");
    base = cut === -1 ? "" : base.slice(0, cut);
  }
}

/**
 * How many packages each direct dependency actually pulls in, by walking
 * resolved dependency edges from it.
 *
 * Counting install-path prefixes does NOT work: npm hoists transitive
 * dependencies to top-level paths, so every direct dependency scores 1 and the
 * package responsible for a breach never appears. Shared packages are counted
 * for every dependency that can reach them, so the columns do not sum to the
 * total — the ranking answers "what does this one drag in", not "who owns what".
 */
function weightByDependency(packages, directNames) {
  return directNames
    .map((name) => {
      const root = resolveFrom(packages, "", name);
      if (!root) return { dep: name, owns: 0 };
      const seen = new Set([root]);
      const queue = [root];
      while (queue.length) {
        const key = queue.shift();
        const meta = packages[key] ?? {};
        for (const child of Object.keys({
          ...(meta.dependencies ?? {}),
          ...(meta.optionalDependencies ?? {}),
        })) {
          const resolved = resolveFrom(packages, key, child);
          if (resolved && !seen.has(resolved)) {
            seen.add(resolved);
            queue.push(resolved);
          }
        }
      }
      return { dep: name, owns: seen.size };
    })
    .sort((a, b) => b.owns - a.owns);
}

say(dim("resolving dependencies + peers (no tarballs downloaded)…"));
const { packages: lockPackages } = resolveTree();
const tree = Object.keys(lockPackages)
  .filter((p) => p.startsWith("node_modules/"))
  .map((p) => p.replace(/^node_modules\//, ""))
  .sort();

if (tree.length > CEILING) {
  // Name the direct dependencies carrying the most weight, so the failure says
  // what to look at rather than just that a number moved.
  const byOwner = weightByDependency(lockPackages, Object.keys(deps)).slice(0, 5);
  failures.push(
    [
      `${red("✗")} dependency budget exceeded: ${tree.length} packages, ceiling ${CEILING} (+${tree.length - CEILING})`,
      "    heaviest direct dependencies (packages reachable from each):",
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

/**
 * Every module specifier `src/` actually imports.
 *
 * Deliberately NOT "does this package name appear in quotes anywhere": an
 * ordinary string (`const label = "some-cli"`) or a commented-out import would
 * make an unused bin-declaring dependency pass, and this check failing OPEN is
 * the one outcome that matters — it exists to catch a CLI sitting in
 * `dependencies`. Comments are stripped, then only real import/require/@import
 * syntax is matched.
 */
function importedSpecifiers() {
  const specs = new Set();
  const PATTERNS = [
    /\bimport\s+[^;'"]*?\bfrom\s*["']([^"']+)["']/g, // import x from "p"
    /\bimport\s*["']([^"']+)["']/g, //                    import "p"
    /\bexport\s+[^;'"]*?\bfrom\s*["']([^"']+)["']/g, // export … from "p"
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g, //        require("p")
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, //         import("p")
    /@import\s+(?:url\(\s*)?["']([^"']+)["']/g, //        @import "p"
  ];
  const stripComments = (text) =>
    text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|css|mjs)$/.test(entry)) {
        const text = stripComments(readFileSync(full, "utf8"));
        for (const re of PATTERNS)
          for (const m of text.matchAll(re)) specs.add(m[1]);
      }
    }
  };
  walk(path.join(ROOT, "src"));
  return specs;
}

const specifiers = importedSpecifiers();
for (const dep of Object.keys(deps)) {
  const manifest = path.join(ROOT, "node_modules", dep, "package.json");
  if (!existsSync(manifest)) continue;
  const meta = JSON.parse(readFileSync(manifest, "utf8"));
  if (!meta.bin) continue;
  // Imported bare (`"pkg"`) or by subpath (`"pkg/thing.css"`)?
  const referenced = [...specifiers].some(
    (spec) => spec === dep || spec.startsWith(`${dep}/`)
  );
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
  // The vendored file is a provenance header followed by the upstream body.
  // Strip exactly that header, then require FULL equality — `endsWith` would
  // accept anything inserted between the two (`body { display: none }` and the
  // drift check still passes), which defeats the only guard that the copy is
  // faithful.
  const upstreamBody = readFileSync(upstreamPath, "utf8");
  const vendored = readFileSync(localPath, "utf8");
  const localBody = vendored.replace(/^\/\*[\s\S]*?\*\/\s*\n/, "");
  if (localBody !== upstreamBody) {
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
