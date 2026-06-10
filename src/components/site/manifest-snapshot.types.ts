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
  manifests: ManifestCard[]
}
