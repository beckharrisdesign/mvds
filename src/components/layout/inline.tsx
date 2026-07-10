import * as React from "react"
import { cn } from "@/lib/utils"
import { GAP, ALIGN, JUSTIFY, type Gap, type Align, type Justify } from "./scales"

/**
 * Inline (a.k.a. Cluster) — horizontal grouping that wraps. For toolbars, tag
 * lists, button rows, anything that should flow and wrap on small screens.
 */
function Inline({
  gap = 8,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** 8-pt grid gap in px. Valid: 0 | 4 | 8 | 16 | 24 | 32 | 40 | 48 | 64 | 80 | 96 */
  gap?: Gap
  align?: Align
  justify?: Justify
  wrap?: boolean
}) {
  return (
    <div
      data-slot="inline"
      className={cn(
        "flex",
        wrap && "flex-wrap",
        GAP[gap],
        ALIGN[align],
        JUSTIFY[justify],
        className
      )}
      {...props}
    />
  )
}

export { Inline }
