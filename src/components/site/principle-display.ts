import type { PrincipleRecord } from "./manifest-snapshot.types"

/**
 * Display helpers for principles in Storybook Intro.
 * Machine `id` stays stable for the gate / `mvds-allow`; NN/g rows can show a
 * `nn##-…` label so they sort and read by heuristic number.
 */

export function heuristicNumber(principle: PrincipleRecord): number | null {
  const ref = principle.source.ref
  if (!ref) return null
  const m = /Heuristic\s+(\d+)/i.exec(ref)
  return m ? Number(m[1]) : null
}

/** Label for the id column — prefixes NN/g rows with nn##-. */
export function principleDisplayId(principle: PrincipleRecord): string {
  const n = heuristicNumber(principle)
  if (n == null) return principle.id
  return `nn${String(n).padStart(2, "0")}-${principle.id}`
}

/** House rules first (manifest order), then adopted sorted by heuristic #. */
export function sortPrinciplesForIndex(
  principles: PrincipleRecord[]
): PrincipleRecord[] {
  const authored = principles.filter((p) => p.source.kind === "founder")
  const adopted = principles
    .filter((p) => p.source.kind === "external")
    .slice()
    .sort((a, b) => (heuristicNumber(a) ?? 99) - (heuristicNumber(b) ?? 99))
  return [...authored, ...adopted]
}

export function sourceLabel(principle: PrincipleRecord): string {
  if (principle.source.kind === "founder") return "MVDS"
  const n = heuristicNumber(principle)
  return n != null ? `NN/g H${n}` : principle.source.name
}
