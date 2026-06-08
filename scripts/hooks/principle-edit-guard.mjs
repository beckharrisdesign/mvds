// PostToolUse hook: when an authored .ts/.tsx source file is edited, run the
// manifest-driven principle check on just that file and surface any violation to
// the agent at the keystroke instead of waiting for CI. Parallel to token-edit-
// guard.mjs (which owns src/index.css); each no-ops outside its domain. Wired in
// .claude/settings.json.

import { readFileSync } from "node:fs"
import { execSync } from "node:child_process"

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, "utf8"))
} catch {
  process.exit(0) // no/invalid stdin — nothing to do
}

const path = (payload?.tool_input?.file_path ?? "").replace(/\\/g, "/")
// Only authored TS/TSX under src/. src/index.css is the token guard's job; this
// hook ignores it (and every non-source file).
if (!/\.(ts|tsx)$/.test(path) || !(path.startsWith("src/") || path.includes("/src/"))) {
  process.exit(0)
}

try {
  execSync(`node scripts/check-principles.mjs --file "${path}"`, { stdio: "pipe" })
  // Silent success is invisible to the agent — emit JSON so the pass is legible.
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `${path} edited — MVDS design-principle check passed.`,
      },
    })
  )
  process.exit(0)
} catch (e) {
  console.error((e.stdout?.toString() || "") + (e.stderr?.toString() || ""))
  console.error("✗ This edit violates an MVDS design principle — fix it before continuing.")
  process.exit(2) // surface to the agent
}
