// Upstream currency gate. MVDS copies its OpenSpec layer — the
// `experiment-hub-lite` schema, its templates, and nine `skills/*.md` — from
// experiment-hub, adapted for a design-system repo (Storybook instead of
// experiments/*/prototype, npm not pnpm, MVDS tokens + AGENTS.md). The copies are
// legitimate; what was missing is any way to notice when upstream moves. Between
// the bootstrap (PR #75) and 2026-08-21 the hub hardened its Figma gate three
// separate times and nothing here said a word.
//
//   npm run check:upstream-drift                    warn-level (CI default today)
//   node scripts/check-upstream-drift.mjs --diff    print what changed upstream
//   node scripts/check-upstream-drift.mjs --strict  exit 1 on upstream drift
//   node scripts/check-upstream-drift.mjs --json    machine-readable summary
//   node scripts/check-upstream-drift.mjs --report-md <path>   issue-ready markdown
//   node scripts/check-upstream-drift.mjs --update  re-stamp after reconciling
//
// What is watched is DATA, in .upstream/manifest.json — adding a file is one
// line there. `rules/*.mdc` is deliberately excluded: MVDS's rules are rewritten
// against AGENTS.md, so watching them would report chosen divergence forever.
//
// How it decides, and why there is no allowlist:
//
//   `.upstream/` holds the hub files VERBATIM at the commit named by the
//   manifest. That baseline splits the two kinds of difference the integration
//   review separated by hand:
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
// Reconciling (when this reports): read the diff, port what is missed hardening,
// consciously skip what is MVDS divergence, then re-stamp with --update.
//
// Warn-level on purpose: this reports on someone else's repo over the network,
// so it must never be the reason an MVDS PR cannot merge. The scheduled
// upstream-currency workflow is what makes sure a report is actually seen —
// a PR-time annotation only fires in weeks you happen to open a PR, which is
// exactly how the last drift went unnoticed for a month.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_DIR = join(ROOT, ".upstream");
const MANIFEST_PATH = join(BASELINE_DIR, "manifest.json");
const SCHEMA_PATH = join(ROOT, "openspec/schemas/experiment-hub-lite/schema.yaml");

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1];
};

const STRICT = has("--strict");
const UPDATE = has("--update");
const AS_JSON = has("--json");
const SHOW_DIFF = has("--diff") || UPDATE;
const REPORT_MD = valueOf("--report-md");
const IN_ACTIONS = Boolean(process.env.GITHUB_ACTIONS);

const plain = AS_JSON || Boolean(REPORT_MD);
const style = (code) => (s) => (plain ? s : `[${code}m${s}[0m`);
const bold = style(1);
const dim = style(2);
const red = style(31);
const green = style(32);
const yellow = style(33);

const say = (line = "") => {
  if (!AS_JSON) console.log(line);
};

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const { source: HUB, ref: REF = "main", paths: WATCHED } = manifest;

/** Group a watched path for reporting: the schema layer vs the skills layer. */
const groupOf = (path) => (path.startsWith("skills/") ? "skills" : "schema");

async function fetchHubFile(path, ref) {
  const url = `https://raw.githubusercontent.com/${HUB}/${ref}/${path}`;
  const res = await fetch(url, { headers: { "User-Agent": "mvds-upstream-drift" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.text();
}

async function fetchHubHeadSha() {
  const res = await fetch(`https://api.github.com/repos/${HUB}/commits/${REF}`, {
    headers: {
      "User-Agent": "mvds-upstream-drift",
      Accept: "application/vnd.github+json",
      // Optional: lifts the 60/hr anonymous rate limit inside Actions.
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${REF}`);
  return (await res.json()).sha.slice(0, 7);
}

/** Line-level LCS. Files here are ~100-500 lines, so the O(n·m) table is fine. */
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

const changedCount = (diff) => diff.filter((line) => line.kind !== " ").length;

/** Changed lines with 2 lines of context, collapsing long quiet runs. */
function renderDiff(diff, { color }) {
  const keep = new Set();
  diff.forEach((line, index) => {
    if (line.kind === " ") return;
    for (let k = index - 2; k <= index + 2; k++) keep.add(k);
  });
  const out = [];
  let skipping = false;
  diff.forEach((line, index) => {
    if (!keep.has(index)) {
      if (!skipping) out.push(color ? dim("    …") : "…");
      skipping = true;
      return;
    }
    skipping = false;
    const text = `${line.kind} ${line.text}`;
    if (!color) {
      out.push(text);
      return;
    }
    const padded = `    ${text}`;
    out.push(
      line.kind === "+" ? green(padded) : line.kind === "-" ? red(padded) : dim(padded),
    );
  });
  return out;
}

/** The human-visible stamp in schema.yaml, kept in step with the manifest. */
function readSchemaStamp() {
  const match = readFileSync(SCHEMA_PATH, "utf8").match(
    /^x-source:\s*experiment-hub@([0-9a-f]{7,40})\s*$/m,
  );
  return match ? match[1] : null;
}

function buildReport({ stamp, head, drifted }) {
  const lines = [
    `**${HUB}** has moved since MVDS last reconciled its copy.`,
    "",
    `| | |`,
    `| --- | --- |`,
    `| MVDS stamped at | \`${stamp}\` |`,
    `| Hub \`${REF}\` at | \`${head}\` |`,
    `| Files changed upstream | ${drifted.length} of ${WATCHED.length} watched |`,
    "",
    "## What moved",
    "",
  ];
  for (const entry of drifted) {
    lines.push(
      `### \`${entry.path}\` — ${entry.lines} line(s)`,
      "",
      "```diff",
      ...renderDiff(entry.diff, { color: false }),
      "```",
      "",
    );
  }
  lines.push(
    "## How to reconcile",
    "",
    "Decide each change **row by row** — port what is missed hardening, and consciously leave what is deliberate MVDS divergence (no Code Connect, draft PRs, `feat|fix|docs|chore/` branches, Storybook instead of `experiments/*/prototype/`, npm not pnpm).",
    "",
    "Then re-stamp the baseline:",
    "",
    "```bash",
    "node scripts/check-upstream-drift.mjs --update",
    "```",
    "",
    "`--update` moves the marker — it does not decide what MVDS adopts.",
    "",
    `<sub>Opened by the \`upstream-currency\` workflow. It updates this issue while drift persists and closes it once the copy is current.</sub>`,
  );
  return lines.join("\n");
}

async function main() {
  const schemaStamp = readSchemaStamp();
  if (schemaStamp && schemaStamp !== manifest.commit && !UPDATE) {
    // The two markers must agree or "current" is meaningless.
    console.error(
      red(
        `✗ stamp mismatch: schema.yaml says ${schemaStamp}, .upstream/manifest.json says ${manifest.commit}.`,
      ),
    );
    process.exit(1);
  }

  const missing = WATCHED.filter((path) => !existsSync(join(BASELINE_DIR, path)));
  if (missing.length && !UPDATE) {
    console.error(red("✗ .upstream/ baseline is incomplete — missing:"));
    for (const path of missing) console.error(`    ${path}`);
    console.error("  Fetch them with --update, or restore from git.");
    process.exit(1);
  }

  say(bold("Upstream currency (vs experiment-hub)"));
  say(`  copy stamped at ${bold(`experiment-hub@${manifest.commit}`)}`);

  let head;
  let fetched;
  try {
    head = await fetchHubHeadSha();
    fetched = await Promise.all(
      WATCHED.map(async (path) => [path, await fetchHubFile(path, REF)]),
    );
  } catch (error) {
    // Someone else's repo, over the network. Never the reason a PR fails.
    const message = `upstream currency check skipped — could not reach ${HUB} (${error.message})`;
    if (AS_JSON) {
      console.log(JSON.stringify({ ok: true, skipped: true, reason: message }, null, 2));
    } else {
      say(yellow(`  ⚠ ${message}`));
      if (IN_ACTIONS) say(`::warning::${message}`);
    }
    process.exit(0);
  }

  say(`  hub ${REF} at ${bold(`experiment-hub@${head}`)}`);
  say("");

  const drifted = [];
  const adapted = [];
  const byGroup = { schema: { current: 0, drifted: 0 }, skills: { current: 0, drifted: 0 } };

  for (const [path, upstream] of fetched) {
    const baselinePath = join(BASELINE_DIR, path);
    const baseline = existsSync(baselinePath) ? readFileSync(baselinePath, "utf8") : "";
    const localPath = join(ROOT, path);
    const local = existsSync(localPath) ? readFileSync(localPath, "utf8") : null;

    const upstreamDiff = diffLines(baseline, upstream);
    const upstreamChanged = changedCount(upstreamDiff);
    const group = groupOf(path);

    if (local !== null) {
      const localChanged = changedCount(diffLines(baseline, local));
      if (localChanged) adapted.push({ path, lines: localChanged });
    } else {
      say(`  ${yellow("⚠")} ${path} — watched but absent locally`);
    }

    if (upstreamChanged) {
      byGroup[group].drifted++;
      drifted.push({ path, lines: upstreamChanged, diff: upstreamDiff, upstream });
      say(`  ${yellow("⚠")} ${bold(path)} — ${upstreamChanged} line(s) changed upstream`);
      if (SHOW_DIFF) renderDiff(upstreamDiff, { color: true }).forEach((l) => say(l));
    } else {
      byGroup[group].current++;
    }
  }

  say("");
  for (const [group, counts] of Object.entries(byGroup)) {
    const total = counts.current + counts.drifted;
    if (!total) continue;
    const label = `${counts.current}/${total} current`;
    say(
      counts.drifted
        ? `  ${yellow("⚠")} ${group}: ${label}, ${counts.drifted} behind`
        : `  ${green("✓")} ${group}: ${label}`,
    );
  }

  if (adapted.length) {
    // Not a problem — the reason a naive `cp -r` sync would be wrong.
    const total = adapted.reduce((sum, entry) => sum + entry.lines, 0);
    say(
      dim(
        `  MVDS adaptations vs baseline: ${total} line(s) across ${adapted.length} file(s).`,
      ),
    );
  }

  if (UPDATE) {
    for (const [path, upstream] of fetched) {
      const target = join(BASELINE_DIR, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, upstream);
    }
    manifest.commit = head;
    writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(
      SCHEMA_PATH,
      readFileSync(SCHEMA_PATH, "utf8").replace(
        /^x-source:\s*experiment-hub@[0-9a-f]{7,40}\s*$/m,
        `x-source: experiment-hub@${head}`,
      ),
    );
    say(green(`✓ baseline + stamps re-stamped to experiment-hub@${head}.`));
    say("  Now reconcile the LOCAL files by hand: port missed hardening, and");
    say("  leave deliberate MVDS divergence alone. --update moves the marker,");
    say("  it does not decide what to adopt.");
    return;
  }

  const summary = drifted.length
    ? `OpenSpec copy is behind experiment-hub@${head} — ${drifted.length} of ${WATCHED.length} watched file(s) changed upstream`
    : `OpenSpec copy is current with experiment-hub@${head}.`;

  if (REPORT_MD && drifted.length) {
    writeFileSync(REPORT_MD, `${buildReport({ stamp: manifest.commit, head, drifted })}\n`);
  }

  if (AS_JSON) {
    console.log(
      JSON.stringify(
        {
          ok: drifted.length === 0,
          skipped: false,
          stamp: manifest.commit,
          head,
          watched: WATCHED.length,
          drifted: drifted.map((entry) => ({ path: entry.path, lines: entry.lines })),
        },
        null,
        2,
      ),
    );
  } else if (!drifted.length) {
    say(green(`✓ ${summary}`));
  } else {
    say(yellow(`⚠ ${summary}`));
    if (!SHOW_DIFF) say(dim("  Run with --diff to see what changed upstream."));
    say(dim("  Reconcile row by row, then: node scripts/check-upstream-drift.mjs --update"));
    if (IN_ACTIONS) {
      say(`::warning file=.upstream/manifest.json::${summary}`);
    }
  }

  if (drifted.length && STRICT) process.exit(1);
}

await main();
