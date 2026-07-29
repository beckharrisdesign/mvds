/**
 * Public view-only share of MVDS Core — URL builder.
 *
 * Constants live in `figma-public-share.json` (single source of truth for the
 * token and page node ids). This module is plain ESM so both the landing page
 * (via Vite) and `scripts/verify-figma-share.mjs` can import it without a
 * TypeScript build step.
 */

import share from "./figma-public-share.json" with { type: "json" }

export const FIGMA_PUBLIC_SHARE = share

/**
 * Public view-only link to the Figma mirror.
 * Opens Foundations & Starters — never Sync Reports.
 */
export function figmaPublicUrl(fileKey) {
  const { fileName, token, topPageNodeId, syncReportsNodeId } = share
  if (topPageNodeId === syncReportsNodeId) {
    throw new Error(
      "figmaPublicUrl: top page must not be Sync Reports — check figma-public-share.json"
    )
  }
  return `https://www.figma.com/design/${fileKey}/${fileName}?node-id=${topPageNodeId}&t=${token}`
}
