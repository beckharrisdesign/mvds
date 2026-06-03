import * as React from "react"
import { cn } from "@/lib/utils"
import { responsiveClasses, type Responsive } from "./scales"

/**
 * GridItem (alias `Col`) — a child of Grid that spans a number of columns,
 * per breakpoint. `span={{ base: 4, md: 4, lg: 6 }}` reads as: fill all 4 cols
 * of a phone grid, 4 of 8 on tablet, 6 of 12 on desktop — i.e. full → half →
 * half. Optional `start` sets the starting column line for explicit placement.
 *
 * With no `span`, it behaves as a normal one-cell grid child.
 */
function GridItem({
  span,
  start,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  span?: Responsive<number>
  start?: Responsive<number>
}) {
  return (
    <div
      data-slot="grid-item"
      className={cn(
        responsiveClasses("col-span", span),
        responsiveClasses("col-start", start),
        className
      )}
      {...props}
    />
  )
}

export { GridItem, GridItem as Col }
