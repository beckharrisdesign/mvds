// Vercel "Ignored Build Step" (vercel.json → ignoreCommand).
// Vercel runs this before building; exit 0 = skip the deploy, exit 1 = build.
//
// The decision lives in scripts/lib/vercel-ignore.mjs as a pure function; this
// file only gathers its inputs. VERCEL_GIT_PREVIOUS_SHA is the last commit that
// deployed for this branch, so skipped pushes accumulate until something the
// site reads changes. If git cannot produce the diff we report that and build.

import { execFileSync } from "node:child_process"

import { decideDeploy } from "./lib/vercel-ignore.mjs"

const base = process.env.VERCEL_GIT_PREVIOUS_SHA || null

let changedFiles = null
if (base) {
  try {
    changedFiles = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean)
  } catch {
    changedFiles = null
  }
}

const decision = decideDeploy({ base, changedFiles })
console.log(`vercel-ignore: ${decision.action} — ${decision.reason}`)
for (const file of decision.triggers.slice(0, 10)) console.log(`  ${file}`)

process.exit(decision.action === "skip" ? 0 : 1)
