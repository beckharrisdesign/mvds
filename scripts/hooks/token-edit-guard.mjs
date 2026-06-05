// PostToolUse hook: when src/index.css (the token layer) is edited, run the
// token-level WCAG AA check immediately and remind that Figma is now stale.
// Catches contrast regressions at the keystroke instead of waiting for CI.
// Wired in .claude/settings.json. No-ops for any other file.

import { readFileSync } from "node:fs"
import { execSync } from "node:child_process"

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, "utf8"))
} catch {
  process.exit(0) // no/invalid stdin — nothing to do
}

const path = payload?.tool_input?.file_path ?? ""
if (!path.endsWith("src/index.css")) process.exit(0)

try {
  execSync("node scripts/check-contrast.mjs", { stdio: "pipe" })
  // A passing hook's stdout/stderr is swallowed by the harness ("silent success
  // is invisible"). Emit JSON so the Figma-stale nudge actually reaches the agent.
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          "src/index.css edited — token contrast WCAG AA check passed (light + dark). Figma (MVDS Core) is now stale; it mirrors code only on explicit request.",
      },
    })
  )
  process.exit(0)
} catch (e) {
  console.error((e.stdout?.toString() || "") + (e.stderr?.toString() || ""))
  console.error("✗ This token edit introduced a WCAG AA contrast regression — fix it before continuing.")
  process.exit(2) // surface to the agent
}
