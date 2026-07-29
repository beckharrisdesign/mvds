#!/usr/bin/env node
// Live check: the public view-only Figma share actually opens for a stranger.
//
//   npm run verify:figma-share
//
// Why this exists:
//   A raw curl (no User-Agent) gets CloudFront 403 even when the share is
//   public — that is bot blocking, not "file is private". HEAD also lies
//   (Figma returns 404). The regression we care about is the founder
//   accidentally revoking "anyone with the link" — then a real browser GET
//   stops serving the file. This gate does that GET.
//
// What it asserts:
//   1. URL opens Foundations & Starters (lock.pages.foundations), never
//      Sync Reports (lock.pages.syncReports).
//   2. GET with a browser User-Agent returns HTTP 200.
//   3. Response identifies MVDS Core (not a generic login / error shell).
//
// Exit 0 = share is publicly reachable. Exit 1 = it is not (with reasons).

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  FIGMA_PUBLIC_SHARE,
  figmaPublicUrl,
} from "../src/components/site/figma-public-share.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const lock = JSON.parse(
  readFileSync(join(ROOT, "figma", "figma.lock.json"), "utf8")
)

const failures = []
function assert(condition, what, why) {
  if (condition) {
    console.log(`  ✓ ${what}`)
  } else {
    console.log(`  ✗ ${what}`)
    failures.push(`${what} — ${why}`)
  }
}

const url = figmaPublicUrl(lock.fileKey)
console.log(`\nPublic Figma share\n  ${url}\n`)

// --- 1. URL shape vs lock -------------------------------------------------------
const foundationsHyphen = lock.pages.foundations.replaceAll(":", "-")
const syncReportsHyphen = lock.pages.syncReports.replaceAll(":", "-")

assert(
  FIGMA_PUBLIC_SHARE.topPageNodeId === foundationsHyphen,
  `top page node-id is Foundations & Starters (${foundationsHyphen})`,
  `got ${FIGMA_PUBLIC_SHARE.topPageNodeId}; lock.pages.foundations is ${lock.pages.foundations}`
)
assert(
  FIGMA_PUBLIC_SHARE.syncReportsNodeId === syncReportsHyphen,
  `sync-reports sentinel matches lock (${syncReportsHyphen})`,
  `got ${FIGMA_PUBLIC_SHARE.syncReportsNodeId}; lock.pages.syncReports is ${lock.pages.syncReports}`
)
assert(
  url.includes(`node-id=${foundationsHyphen}`),
  "share URL opens Foundations & Starters",
  `URL missing node-id=${foundationsHyphen}`
)
assert(
  !url.includes(`node-id=${syncReportsHyphen}`),
  "share URL does not open Sync Reports (internal)",
  `URL contains node-id=${syncReportsHyphen}`
)
assert(
  url.includes(`t=${FIGMA_PUBLIC_SHARE.token}`),
  "share URL carries the public view-only token",
  "token missing from URL"
)

// --- 2. Live GET (browser UA — bare curl is CloudFront-403'd on purpose) --------
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

let status = 0
let body = ""
try {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml",
    },
  })
  status = res.status
  body = await res.text()
} catch (err) {
  assert(false, "GET the public share", String(err))
}

assert(
  status === 200,
  `GET returns HTTP 200 (got ${status})`,
  status === 403
    ? "403 — share may be private again, or CloudFront blocked a non-browser request (this script sends a browser UA)"
    : `expected 200, got ${status}`
)

// File-identifying signals Figma puts on a publicly reachable design file.
// A revoked share still often returns a 200 shell — without these, treat as fail.
assert(
  body.includes("MVDS Core") || body.includes(lock.fileKey),
  "response identifies MVDS Core (public share, not a login/error shell)",
  "body has neither 'MVDS Core' nor the fileKey — share is likely private or broken"
)
assert(
  !/Error from cloudfront/i.test(body) && !/<title>ERROR<\/title>/i.test(body),
  "response is not a CloudFront error page",
  "CloudFront error body — request was bot-blocked; check User-Agent handling"
)

// --- done -----------------------------------------------------------------------
if (failures.length) {
  console.error(`\n✗ verify:figma-share failed (${failures.length}):\n`)
  for (const f of failures) console.error(`  • ${f}`)
  process.exit(1)
}
console.log("\n✓ Public Figma share is reachable and opens the top page.\n")
