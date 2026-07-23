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
 * can only ever point at the file the sync actually wrote to.
 */

const REPO_URL = "https://github.com/beckharrisdesign/mvds"

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

/** The Figma mirror this repo syncs into (fileKey comes from figma.lock.json). */
export function figmaUrl(fileKey: string): string {
  return `https://www.figma.com/design/${fileKey}/MVDS`
}

export { REPO_URL }
