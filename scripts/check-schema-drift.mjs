// OpenSpec schema-currency gate. `openspec/schemas/experiment-hub-lite/` is a
// COPY of experiment-hub's schema, adapted for a design-system repo (Storybook
// instead of experiments/*/prototype, npm not pnpm, MVDS tokens + AGENTS.md).
// The copy is legitimate; what was missing is any way to notice when upstream
// moves. Between the bootstrap (PR #75) and 2026-08-21 the hub hardened its
// Figma gate three separate times and nothing here said a word.
//
//   npm run check:schema-drift              warn-level (CI default today)
//   node scripts/check-schema-drift.mjs --strict   exit 1 on upstream drift
//   node scripts/check-schema-drift.mjs --diff     print the full upstream diff
//
// How it decides, and why there is no allowlist:
//
//   `.upstream/` holds the hub files VERBATIM at the commit named by `x-source`
//   in schema.yaml. That baseline splits the two kinds of difference the
//   integration review separated by hand:
//
//     upstream vs baseline  → what the hub changed since we copied  → THE SIGNAL
//     local    vs baseline  → our deliberate adaptations            → expected
//
//   Diffing local against hub HEAD directly would mix the two and need a
//   hand-maintained allowlist of ~40 adapted lines in a ~100-line schema —
//   permanently noisy, and wrong the first time someone edits an adapted line.
//   Anchoring on the baseline needs no allowlist and has no false positives:
//   an empty upstream-vs-baseline diff means the copy is current, full stop.
//
// Reconciling (when this warns): read the printed diff, port what is missed
// hardening, consciously skip what is MVDS divergence, then re-stamp BOTH the
// `x-source` line and `.upstream/` to the new hub commit — one command:
//
//   node scripts/check-schema-drift.mjs --update
//
// Warn-level on purpose: this reports on someone else's repo over the network,
// so it must never be the reason an MVDS PR cannot merge. Promote it to
// `--strict` in ci.yml once it has been quiet for a few PRs.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_DIR = join(ROOT, "openspec/schemas/experiment-hub-lite");
const BASELINE_DIR = join(SCHEMA_DIR, ".upstream");

const HUB = "beckharrisdesign/experiment-hub";
const HUB_SCHEMA_PATH = "openspec/schemas/experiment-hub-lite";

// Every file mirrored from the hub. Paths are identical on both sides — the
// hub prefix and the local prefix are the only difference.
const MIRRORED = [
  "schema.yaml",
  "templates/proposal.md",
  "templates/spec.md",
  "templates/design.md",
  "templates/tasks.md",
];

const argv = process.argv.slice(2);
const STRICT = argv.includes("--strict");
const SHOW_DIFF = argv.includes("--diff") || argv.includes("--update");
const UPDATE = argv.includes("--update");
const IN_ACTIONS = Boolean(process.env.GITHUB_ACTIONS);

const bold = (s) => `[1m${s}[0m`;
const dim = (s) => `[2m${s}[0m`;
const red = (s) => `[31m${s}[0m`;
const green = (s) => `[32m${s}[0m`;
const yellow = (s) => `[33m${s}[0m`;

/** The commit `x-source:` pins, e.g. "bd57a1c" from "experiment-hub@bd57a1c". */
function readStamp() {
  const schema = readFileSync(join(SCHEMA_DIR, "schema.yaml"), "utf8");
  const match = schema.match(/^x-source:\s*experiment-hub@([0-9a-f]{7,40})\s*$/m);
  return match ? match[1] : null;
}

async function fetchHubFile(path, ref) {
  const url = `https://raw.githubusercontent.com/${HUB}/${ref}/${HUB_SCHEMA_PATH}/${path}`;
  const res = await fetch(url, { headers: { "User-Agent": "mvds-schema-drift" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.text();
}

/** Current sha of hub main, so a re-stamp can name it. */
async function fetchHubHeadSha() {
  const res = await fetch(`https://api.github.com/repos/${HUB}/commits/main`, {
    headers: {
      "User-Agent": "mvds-schema-drift",
      Accept: "application/vnd.github+json",
      // Optional: lifts the 60/hr anonymous rate limit inside Actions.
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — hub main`);
  const body = await res.json();
  return body.sha.slice(0, 7);
}

/** Line-level LCS. Files here are ~100 lines, so the O(n·m) table is free. */
function lcsTable(a, b) {
  const table = Array.from({ length: a.length + 1 }, () =>
    new Uint32Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

/** Unified-ish diff: changed lines with a little context, enough to read. */
function diffLines(before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const table = lcsTable(a, b);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ kind: " ", text: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ kind: "-", text: a[i++] });
    } else {
      out.push({ kind: "+", text: b[j++] });
    }
  }
  while (i < a.length) out.push({ kind: "-", text: a[i++] });
  while (j < b.length) out.push({ kind: "+", text: b[j++] });
  return out;
}

function changedCount(diff) {
  return diff.filter((line) => line.kind !== " ").length;
}

/** Print changed lines with 2 lines of context, collapsing long quiet runs. */
function printDiff(diff) {
  const keep = new Set();
  diff.forEach((line, index) => {
    if (line.kind === " ") return;
    for (let k = index - 2; k <= index + 2; k++) keep.add(k);
  });
  let skipping = false;
  diff.forEach((line, index) => {
    if (!keep.has(index)) {
      if (!skipping) console.log(dim("    …"));
      skipping = true;
      return;
    }
    skipping = false;
    const text = `    ${line.kind} ${line.text}`;
    if (line.kind === "+") console.log(green(text));
    else if (line.kind === "-") console.log(red(text));
    else console.log(dim(text));
  });
}

async function main() {
  const stamp = readStamp();
  if (!stamp) {
    console.error(
      red("✗ schema.yaml has no `x-source: experiment-hub@<sha>` stamp."),
    );
    console.error("  The drift check cannot anchor without one.");
    process.exit(1);
  }

  const missingBaseline = MIRRORED.filter(
    (path) => !existsSync(join(BASELINE_DIR, path)),
  );
  if (missingBaseline.length) {
    console.error(red("✗ .upstream/ baseline is incomplete — missing:"));
    for (const path of missingBaseline) console.error(`    ${path}`);
    console.error("  Re-create it with --update, or restore from git.");
    process.exit(1);
  }

  console.log(bold("OpenSpec schema currency"));
  console.log(`  copy stamped at ${bold(`experiment-hub@${stamp}`)}`);

  let head;
  let fetched;
  try {
    head = await fetchHubHeadSha();
    fetched = await Promise.all(
      MIRRORED.map(async (path) => [path, await fetchHubFile(path, "main")]),
    );
  } catch (error) {
    // Someone else's repo, over the network. Never the reason a PR fails.
    const message = `schema drift check skipped — could not reach ${HUB} (${error.message})`;
    console.log(yellow(`  ⚠ ${message}`));
    if (IN_ACTIONS) console.log(`::warning::${message}`);
    process.exit(0);
  }

  console.log(`  hub main  at ${bold(`experiment-hub@${head}`)}`);
  console.log("");

  const drifted = [];
  const adapted = [];

  for (const [path, upstream] of fetched) {
    const baseline = readFileSync(join(BASELINE_DIR, path), "utf8");
    const local = readFileSync(join(SCHEMA_DIR, path), "utf8");

    const upstreamDiff = diffLines(baseline, upstream);
    const localDiff = diffLines(baseline, local);
    const upstreamChanged = changedCount(upstreamDiff);
    const localChanged = changedCount(localDiff);

    if (localChanged) adapted.push({ path, lines: localChanged });

    if (upstreamChanged) {
      drifted.push({ path, lines: upstreamChanged, diff: upstreamDiff, upstream });
      console.log(
        `  ${yellow("⚠")} ${bold(path)} — ${upstreamChanged} line(s) changed upstream since ${stamp}`,
      );
      if (SHOW_DIFF) printDiff(upstreamDiff);
    } else {
      console.log(`  ${green("✓")} ${path} — current with hub main`);
    }
  }

  console.log("");
  if (adapted.length) {
    // Not a problem — the reason a naive `cp -r` sync would be wrong. Printed
    // so the size of the intentional divergence stays visible.
    console.log(
      dim(
        `  MVDS adaptations vs baseline: ${adapted
          .map((entry) => `${entry.path} (${entry.lines})`)
          .join(", ")}`,
      ),
    );
  }

  if (!drifted.length) {
    console.log(green("✓ schema copy is current with experiment-hub main."));
    return;
  }

  if (UPDATE) {
    for (const entry of drifted) {
      writeFileSync(join(BASELINE_DIR, entry.path), entry.upstream);
    }
    const schemaPath = join(SCHEMA_DIR, "schema.yaml");
    writeFileSync(
      schemaPath,
      readFileSync(schemaPath, "utf8").replace(
        /^x-source:\s*experiment-hub@[0-9a-f]{7,40}\s*$/m,
        `x-source: experiment-hub@${head}`,
      ),
    );
    console.log(
      green(`✓ baseline + x-source re-stamped to experiment-hub@${head}.`),
    );
    console.log(
      "  Now reconcile the LOCAL files by hand: port missed hardening, and",
    );
    console.log(
      "  leave deliberate MVDS divergence alone. --update moves the marker,",
    );
    console.log("  it does not decide what to adopt.");
    return;
  }

  const summary = `OpenSpec schema copy is behind experiment-hub@${head} — ${drifted
    .map((entry) => `${entry.path} (${entry.lines} lines)`)
    .join(", ")}`;

  console.log(yellow(`⚠ ${summary}`));
  if (!SHOW_DIFF) {
    console.log(dim("  Run with --diff to see what changed upstream."));
  }
  console.log(
    dim(
      "  Reconcile row by row, then: node scripts/check-schema-drift.mjs --update",
    ),
  );
  if (IN_ACTIONS) {
    console.log(
      `::warning file=openspec/schemas/experiment-hub-lite/schema.yaml::${summary}`,
    );
  }

  process.exit(STRICT ? 1 : 0);
}

await main();
