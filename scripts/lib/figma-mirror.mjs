// What the Figma file actually holds, as opposed to what the repo has declared
// for it.
//
// A manifest in figma/components.config.mjs says a component SHOULD appear in
// Figma. Only its entry in figma.lock.json says a sync put it there. The landing
// page's Figma card counted manifests and called them "mirrored", which held
// for as long as every manifest had been synced. Table was manifested in #131
// and never pushed, so the card claimed 20 mirrored components while the file
// held 19.

/** Variants a manifest declares: the product of its axes' option counts. */
function declaredVariants(manifest) {
  return manifest.axes.reduce((n, axis) => n * axis.options.length, 1)
}

/**
 * Split the component manifests by whether the lock records a sync.
 *
 * @param {{ name: string, axes: { options: unknown[] }[] }[]} manifests
 * @param {{ components?: Record<string, unknown> }} lock
 * @returns {{ mirrored: string[], notYetSynced: string[], mirroredVariants: number }}
 *   Names keep the manifests' order. `mirroredVariants` counts only mirrored
 *   components, because the card presents the figure as what Figma holds.
 */
export function figmaMirrorInventory(manifests, lock) {
  const synced = new Set(Object.keys(lock?.components ?? {}))
  const mirrored = manifests.filter((m) => synced.has(m.name))
  return {
    mirrored: mirrored.map((m) => m.name),
    notYetSynced: manifests.filter((m) => !synced.has(m.name)).map((m) => m.name),
    mirroredVariants: mirrored.reduce((n, m) => n + declaredVariants(m), 0),
  }
}
