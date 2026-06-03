import * as React from "react"
import { cn } from "@/lib/utils"
import { GAP, responsiveClasses, type Gap, type Responsive } from "./scales"

/**
 * Grid — a column field that cascades across breakpoints. `cols` is the number
 * of columns, either fixed or per-breakpoint; `gap` is the gutter (8-pt grid).
 * Children are `GridItem`s that span columns; bare children occupy one cell.
 *
 *   <Grid cols={{ base: 4, md: 8, lg: 12 }} gap={16}>
 *     <GridItem span={{ base: 4, md: 4, lg: 6 }}>…</GridItem>
 *   </Grid>
 *
 * = a 4-col phone grid → 8-col tablet → 12-col desktop, with that item going
 * full-width → half → half. (Breakpoints are viewport-based: sm/md/lg/xl/2xl.)
 */
function Grid({
  cols = 12,
  gap = 16,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  cols?: Responsive<number>
  gap?: Gap
}) {
  return (
    <div
      data-slot="grid"
      className={cn(
        "grid",
        responsiveClasses("grid-cols", cols),
        GAP[gap],
        className
      )}
      {...props}
    />
  )
}

export { Grid }
