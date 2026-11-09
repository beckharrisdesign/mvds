// Push secrets from 1Password to GitHub Actions.
//
//   npm run sync:secrets              preview — reports, writes nothing
//   npm run sync:secrets -- --apply   write the changes
//
// The vault is the master copy; GitHub holds a derived one. This only ever
// pushes outward, never reads a deployed value back into the vault — GitHub
// cannot return one anyway. Preview is the default because a command that
// writes by default is a foot-gun for one flag on something run a few times a
// year. Ported from experiment-hub's scripts/sync-secrets.sh; the decisions are
// in scripts/lib/secret-sync.mjs, and this file only touches the world.
//
// The state file (.secrets-sync-state, gitignored) holds a SHA-256 per secret
// of what was last written, never a value. It lives in the MAIN checkout, so a
// run from any worktree reads the same record. Its honest limitation: a value
// changed in GitHub's UI directly is invisible here, and keeps reporting
// "unchanged" until the vault value moves. Don't edit secrets there by hand.
//
// What to do when it fails, and how to rotate each credential:
// docs/SECRETS_RUNBOOK.md.

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { applyPlan, formatPlan, parseState, planSync, serializeState, validateManifest } from "./lib/secret-sync.mjs"
import { REPO, SECRETS, VAULT } from "./secrets.manifest.mjs"

const apply = process.argv.includes("--apply")
const RUNBOOK = "docs/SECRETS_RUNBOOK.md"

function fail(message) {
  console.error(`  ✗ ${message}`)
  process.exit(1)
}

/** Run a CLI, capturing its output. Nothing it prints reaches the terminal, so
 *  a value read from the vault cannot be echoed by accident. */
function run(cmd, args, input) {
  return execFileSync(cmd, args, {
    input,
    encoding: "utf8",
    stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
  })
}

function has(cmd) {
  try {
    run("which", [cmd])
    return true
  } catch {
    return false
  }
}

// --- the manifest first: a malformed record stops the run, never skips -------
const errors = validateManifest(SECRETS)
if (errors.length) fail(`scripts/secrets.manifest.mjs is malformed:\n      ${errors.join("\n      ")}`)

// --- preflight: fail with a cause, not a stack trace -------------------------
if (!has("op")) fail("1Password CLI not found. brew install 1password-cli")
try {
  run("op", ["vault", "get", VAULT])
} catch {
  // `op vault list` is the readiness check; `op whoami` lies under app integration.
  fail(`Cannot read vault '${VAULT}'. Unlock the 1Password app, then check with: op vault list  (more: ${RUNBOOK})`)
}
if (!has("gh")) fail("GitHub CLI not found. brew install gh")
try {
  run("gh", ["auth", "status"])
} catch {
  fail("GitHub CLI is not signed in. gh auth login")
}

// --- gather ------------------------------------------------------------------
const values = new Map()
for (const { name, ref } of SECRETS) {
  try {
    values.set(name, run("op", ["read", "--no-newline", ref]))
  } catch {
    values.set(name, undefined) // reported as "not filled in the vault yet"
  }
}

const targets = new Set(["gh", ...SECRETS.flatMap((s) => s.targets)])
const deployed = new Map()
for (const target of targets) {
  const scope = target === "gh" ? [] : ["--env", target.slice("gh-env:".length)]
  try {
    const listed = JSON.parse(run("gh", ["secret", "list", "--repo", REPO, ...scope, "--json", "name"]))
    deployed.set(target, new Set(listed.map((s) => s.name)))
  } catch (error) {
    fail(`Could not list ${target} secrets on ${REPO}: ${String(error.stderr || error.message).trim()}`)
  }
}

const root = run("git", ["rev-parse", "--show-toplevel"]).trim()
const workflowDir = path.join(root, ".github/workflows")
const workflows = new Map(
  readdirSync(workflowDir)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => [`.github/workflows/${f}`, readFileSync(path.join(workflowDir, f), "utf8")]),
)

// The main checkout, whichever worktree this runs from.
const commonDir = path.resolve(root, run("git", ["rev-parse", "--git-common-dir"]).trim())
const statePath = path.join(path.dirname(commonDir), ".secrets-sync-state")
const state = parseState(existsSync(statePath) ? readFileSync(statePath, "utf8") : "")

// --- decide, report, and (only with --apply) write --------------------------
const plan = planSync({ manifest: SECRETS, values, state, deployed, workflows })
console.log(formatPlan(plan, { apply }))
if (!apply) process.exit(0)

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

// Retry with backoff: GitHub's API 503'd three times in the hub's first apply
// (2026-08-17), and each flare aborted the run at one variable. A real failure
// still aborts after the last attempt, before that row is recorded.
function setSecret(name, value, target) {
  const scope = target === "gh" ? [] : ["--env", target.slice("gh-env:".length)]
  for (let attempt = 1; ; attempt++) {
    try {
      // The value goes over stdin, never argv, so it is not visible in `ps`.
      run("gh", ["secret", "set", name, "--repo", REPO, ...scope], value)
      return
    } catch (error) {
      if (attempt === 5) throw new Error(String(error.stderr || error.message).trim())
      console.error(`    … GitHub API hiccup writing ${name} — retry ${attempt}/4 in ${attempt * 5}s`)
      sleep(attempt * 5000)
    }
  }
}

const result = applyPlan(plan, values, state, setSecret)
writeFileSync(statePath, serializeState(result.state))
if (result.failed) {
  fail(
    `${result.failed.name} → ${result.failed.target} failed: ${result.failed.message}\n` +
      `      Recorded ${result.written.length} row(s) that fully succeeded; re-run to retry the rest.`,
  )
}
console.log(`\n  Wrote ${result.written.length} secret(s). GitHub values take effect on the next workflow run.`)
