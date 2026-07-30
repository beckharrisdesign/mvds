/**
 * Shape of src/generated/manifest-snapshot.json — written by
 * scripts/generate-manifest-snapshot.mjs, one record per manifest in the repo.
 * Keep this in lockstep with the generator's card builders.
 */

/** Maps 1:1 onto the Badge status triad. */
export type StatusLevel = "success" | "neutral" | "destructive"

export interface ManifestStatus {
  level: StatusLevel
  label: string
  detail?: string
}

export interface ManifestItem {
  name: string
  meta: string
  status?: ManifestStatus
}

export interface ManifestCard {
  id: string
  name: string
  path: string
  kind: string
  description: string
  counts: { label: string; value: number }[]
  status: ManifestStatus
  items?: ManifestItem[]
}

/**
 * One verification gate. `verifiedAt` distinguishes two very different claims,
 * and the UI must not blur them:
 *   "build" — the generator actually ran this command and recorded its result.
 *   "ci"    — too slow or too impure to run per build (needs a browser or the
 *             network); enforced on every pull request instead.
 */
export interface Gate {
  id: string
  name: string
  detail: string
  command: string
  verifiedAt: "build" | "ci"
  result: string
  status: ManifestStatus
}

/**
 * A design principle, with its provenance.
 *
 * `enforcement` is the honest half: `automated` means a check fails the build,
 * `judgment` means it is upheld by the people and agents doing the work. Both
 * are real rules; only one is mechanised, and the page says which is which.
 *
 * `source.kind` separates what MVDS asserts on its own authority (`founder`)
 * from what it adopted from published work (`external`, always with a URL).
 */
export interface PrincipleRecord {
  id: string
  /** Peer-facing title — what the rule is about. */
  title: string
  description: string
  rationale: string
  fix: string
  severity: Severity
  enforcement: "automated" | "judgment"
  checkKind: string
  docs: string | null
  source: {
    kind: "founder" | "external"
    name: string
    url: string | null
    ref: string | null
  }
}

export type Severity = "error" | "warn" | "off"

export interface ManifestSnapshot {
  generatedAt: string
  commit: string
  dirty: boolean
  lock: {
    fileKey: string
    syncedAt: string
    syncedFromCommit: string
    commitsBehind: number | null
  }
  gates: Gate[]
  principles: PrincipleRecord[]
  /**
   * Checked-in previews of the Figma mirror, or null if none are committed.
   * The page presence-gates on this: the live file is also a public view-only
   * share, but these versioned PNGs show parity inline with no click required.
   */
  figmaExports: {
    fileKey: string
    capturedAt: string
    pages: { id: string; name: string; file: string }[]
  } | null
  manifests: ManifestCard[]
}
