// Cascade resolution for the principle manifest. Folds an ordered list of context
// layers (company -> experiment -> product, most-specific LAST) over the base
// manifest, last-writer-wins per field per principle — exactly like CSS specificity
// or a token cascade. A layer can disable a principle, downgrade error->warn, widen
// an exclude glob, or swap a check threshold.
//
// Round one ships with NO layers wired: the runner calls resolveManifest(base) and
// gets the base back. This function is the seam Phase 3 (the principle-encoding
// engine) grows into.

/**
 * @typedef {import('./principles.types').PrincipleManifest} PrincipleManifest
 * @typedef {import('./principles.types').ContextLayer} ContextLayer
 */

/**
 * @param {PrincipleManifest} base
 * @param {ContextLayer[]} [layers]
 * @returns {PrincipleManifest}
 */
// Shallow clone that preserves function/RegExp references (a check's `companion`
// or `pattern`) while isolating the fields a layer may mutate. structuredClone
// can't carry functions, so we copy by hand.
const clonePrinciple = (p) => ({
  ...p,
  scope: { include: [...p.scope.include], exclude: [...p.scope.exclude] },
  check: { ...p.check },
})

export function resolveManifest(base, layers = []) {
  const byId = new Map(base.principles.map((p) => [p.id, clonePrinciple(p)]))
  for (const layer of layers) {
    for (const o of layer.overrides ?? []) {
      const p = byId.get(o.id)
      if (!p) continue // unknown id in a context layer is ignored (forward-compatible)
      if (o.enabled !== undefined) p.enabled = o.enabled
      if (o.severity !== undefined) p.severity = o.severity
      if (o.scope) p.scope = { ...p.scope, ...o.scope }
      if (o.check) Object.assign(p.check, o.check)
    }
  }
  return { version: base.version, principles: [...byId.values()] }
}

/**
 * Select the active context layers from the environment. Round one is a stub —
 * there are no contexts yet, so this always returns []. Phase 3 wires this to
 * MVDS_CONTEXT (e.g. "acme,exp-42") -> an ordered ContextLayer[].
 *
 * @returns {ContextLayer[]}
 */
export function selectContextLayers() {
  // TODO (Phase 3): read MVDS_CONTEXT, resolve names -> ContextLayer[] from a
  // contexts registry, return them base-first / most-specific-last.
  return []
}
