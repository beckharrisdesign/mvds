import * as React from "react"
import { cn } from "@/lib/utils"
import {
  GAP,
  COLS,
  COLS_SM,
  COLS_MD,
  COLS_LG,
  type Gap,
  type Cols,
  type ResponsiveCols,
} from "./scales"

/**
 * Grid — responsive columns. `cols` sets the base count; `sm`/`md`/`lg` override
 * at breakpoints (the responsive DNA). e.g. <Grid cols={1} md={2} lg={3} gap={4}>
 * is the classic 1→2→3 card layout.
 */
function Grid({
  cols = 1,
  sm,
  md,
  lg,
  gap = 4,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  cols?: Cols
  sm?: ResponsiveCols
  md?: ResponsiveCols
  lg?: ResponsiveCols
  gap?: Gap
}) {
  return (
    <div
      data-slot="grid"
      className={cn(
        "grid",
        COLS[cols],
        sm && COLS_SM[sm],
        md && COLS_MD[md],
        lg && COLS_LG[lg],
        GAP[gap],
        className
      )}
      {...props}
    />
  )
}

export { Grid }
