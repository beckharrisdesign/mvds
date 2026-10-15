import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollRegion,
} from "@/components/ui/table"
import { Stack } from "@/components/layout"
import type { PrincipleRecord } from "./manifest-snapshot.types"
import {
  principleDisplayId,
  sortPrinciplesForIndex,
  sourceLabel,
} from "./principle-display"

/**
 * Intro → Design principles — the technical index, rendered through Table
 * (openspec: add-table-component). Driven by the live manifest snapshot.
 *
 * The column set is data, declared once and read three times — header, body,
 * TableEmpty's colSpan (D4). Four columns: `title` restated the description and
 * went (D12). Enforcement is a category, not a health state: `muted` means a
 * machine check exists, `outline` means guiding (D11).
 */
const COLUMNS: {
  key: string
  label: string
  render: (p: PrincipleRecord) => React.ReactNode
}[] = [
  {
    key: "id",
    label: "ID",
    // The id's real job is being copied into `// mvds-allow <id>`: a measure
    // on the content, breaking at hyphens first, never a declared width (D2).
    render: (p) => (
      <code className="block max-w-[32ch] font-mono text-small wrap-anywhere">
        {principleDisplayId(p)}
      </code>
    ),
  },
  {
    key: "description",
    label: "What it says",
    render: (p) => (
      <span className="block min-w-[16ch] max-w-[60ch]">{p.description}</span>
    ),
  },
  {
    key: "enforcement",
    label: "Enforcement",
    render: (p) =>
      p.enforcement === "automated" ? (
        <Badge variant="muted">enforced</Badge>
      ) : (
        <Badge variant="outline">guiding</Badge>
      ),
  },
  { key: "source", label: "Source", render: (p) => sourceLabel(p) },
]

function PrinciplesIndex({ principles }: { principles: PrincipleRecord[] }) {
  const rows = sortPrinciplesForIndex(principles)
  const captionId = React.useId()

  return (
    <Stack gap={24}>
      <Stack gap={8} className="max-w-prose">
        <h1 className="text-h1">Design principles</h1>
        <p className="text-body text-muted-foreground">
          From{" "}
          <code className="font-mono text-small">principles.config.mjs</code>.
          The id is the machine key the gate reads and the one you copy into{" "}
          <code className="font-mono text-small">// mvds-allow</code>. Nielsen
          Norman heuristics carry an{" "}
          <code className="font-mono text-small">nn##-</code> prefix so they
          sort by heuristic number — the gate still uses the stable id.
        </p>
      </Stack>

      <TableScrollRegion aria-labelledby={captionId}>
        <Table>
          <TableCaption id={captionId}>
            MVDS design principles · {rows.length} records
          </TableCaption>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty
                colSpan={COLUMNS.length}
                title="No principles in the manifest."
                hint="principles.config.mjs has no records to show."
              />
            ) : (
              rows.map((p) => (
                <TableRow key={p.id}>
                  {COLUMNS.map((c) => (
                    <TableCell key={c.key}>{c.render(p)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableScrollRegion>
    </Stack>
  )
}

export { PrinciplesIndex }
