/**
 * Outbound links for the landing page, derived rather than hardcoded.
 *
 * Repo links are pinned to the COMMIT the page was generated from, not to
 * `main`. A `main` link 404s whenever the page is deployed from a branch whose
 * content has not landed yet (exactly what happened to the starter link on the
 * PR preview), and rots silently if a path is ever renamed. Every other number
 * on the page already describes one commit; the links now agree with them.
 *
 * The Figma link is built from the fileKey recorded in figma.lock.json, so it
 * can only ever point at the file the sync actually wrote to. The share token
 * is the public view-only link the founder published; the node-id is pinned to
 * Foundations & Starters (lock.pages.foundations = "0:1") — never Sync Reports
 * (lock.pages.syncReports = "136:2"), which is the internal audit page.
 */

const REPO_URL = "https://github.com/beckharrisdesign/mvds"

/** Public view-only share token for MVDS Core (founder-published). */
const FIGMA_SHARE_TOKEN = "w5EqXarr3p4eYxpC-1"

/**
 * Top page of the file — Foundations & Starters. Figma URL form uses hyphens
 * (`0-1`); the lock records colon form (`0:1`).
 */
const FIGMA_TOP_PAGE_NODE_ID = "0-1"

/** A repo path at the exact commit this page was built from. */
export function repoUrl(commit: string, path: string): string {
  return `${REPO_URL}/tree/${commit}/${path}`
}

/** A single file, blob view, at the build commit. */
export function repoFileUrl(commit: string, path: string): string {
  return `${REPO_URL}/blob/${commit}/${path}`
}

export function starterUrl(commit: string): string {
  return repoUrl(commit, "examples/starter")
}

/**
 * Public view-only link to the Figma mirror this repo syncs into.
 * Opens Foundations & Starters — the top page — not Sync Reports.
 */
export function figmaUrl(fileKey: string): string {
  return `https://www.figma.com/design/${fileKey}/MVDS-Core?node-id=${FIGMA_TOP_PAGE_NODE_ID}&t=${FIGMA_SHARE_TOKEN}`
}

export { REPO_URL }
