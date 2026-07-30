import { Badge } from "@/components/ui/badge"
import { Grid, Stack } from "@/components/layout"
import type { PrincipleRecord } from "./manifest-snapshot.types"
import {
  principleDisplayId,
  sortPrinciplesForIndex,
  sourceLabel,
} from "./principle-display"

/**
 * Intro → Design principles — technical index (human title ahead of id).
 * Driven by the live manifest snapshot; deeper than the landing card list.
 */

function PrinciplesIndex({ principles }: { principles: PrincipleRecord[] }) {
  const rows = sortPrinciplesForIndex(principles)

  return (
    <Stack gap={24}>
      <Stack gap={8} className="max-w-prose">
        <h1 className="text-h1">Design principles</h1>
        <p className="text-body text-muted-foreground">
          From{" "}
          <code className="font-mono text-small">principles.config.mjs</code>.
          Human title first (what it’s about); id is the machine key. Nielsen
          Norman heuristics show a{" "}
          <code className="font-mono text-small">nn##-</code> prefix so they
          sort by heuristic number — the gate still uses the stable id.
        </p>
      </Stack>

      <Stack gap={0} className="border-border rounded-lg border">
        <Grid
          cols={{ base: 1, lg: 5 }}
          gap={16}
          className="border-border border-b px-4 py-3"
        >
          <span className="text-caption text-muted-foreground font-medium">
            human title
          </span>
          <span className="text-caption text-muted-foreground font-medium">
            id
          </span>
          <span className="text-caption text-muted-foreground font-medium">
            description (manifest)
          </span>
          <span className="text-caption text-muted-foreground font-medium">
            enforcement
          </span>
          <span className="text-caption text-muted-foreground font-medium">
            source
          </span>
        </Grid>
        <Stack gap={0}>
          {rows.map((p) => {
            const automated = p.enforcement === "automated"
            return (
              <Grid
                key={p.id}
                cols={{ base: 1, lg: 5 }}
                gap={16}
                className="border-border border-b px-4 py-3 last:border-b-0"
              >
                <span className="text-small text-foreground font-medium">
                  {p.title}
                </span>
                <code className="text-small text-muted-foreground font-mono break-all">
                  {principleDisplayId(p)}
                </code>
                <span className="text-small text-muted-foreground">
                  {p.description}
                </span>
                <span>
                  <Badge variant={automated ? "success" : "neutral"}>
                    {automated ? "enforced" : "judgment"}
                  </Badge>
                </span>
                <span className="text-small text-muted-foreground">
                  {sourceLabel(p)}
                </span>
              </Grid>
            )
          })}
        </Stack>
      </Stack>
    </Stack>
  )
}

export { PrinciplesIndex }
