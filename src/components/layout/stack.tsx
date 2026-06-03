import * as React from "react"
import { cn } from "@/lib/utils"
import { GAP, ALIGN, JUSTIFY, type Gap, type Align, type Justify } from "./scales"

/**
 * Stack — vertical rhythm. Lays children in a column with consistent gap drawn
 * from the spacing scale. The workhorse primitive for forms, lists, page bodies.
 */
function Stack({
  gap = 4,
  align = "stretch",
  justify,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  gap?: Gap
  align?: Align
  justify?: Justify
}) {
  return (
    <div
      data-slot="stack"
      className={cn(
        "flex flex-col",
        GAP[gap],
        ALIGN[align],
        justify && JUSTIFY[justify],
        className
      )}
      {...props}
    />
  )
}

export { Stack }
