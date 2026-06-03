import * as React from "react"
import { cn } from "@/lib/utils"
import { HEIGHT, WIDTH, type SpaceSize } from "./scales"

/**
 * Spacer — explicit empty space. With a `size` it's a fixed gap on the chosen
 * axis (block = height, inline = width). Without a size it's flexible: it grows
 * to push siblings apart inside a flex parent (e.g. left group | Spacer | right).
 */
function Spacer({
  size,
  axis = "block",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  size?: SpaceSize
  axis?: "block" | "inline"
}) {
  if (size == null) {
    return (
      <div data-slot="spacer" aria-hidden className={cn("flex-1", className)} {...props} />
    )
  }
  return (
    <div
      data-slot="spacer"
      aria-hidden
      className={cn("shrink-0", axis === "inline" ? WIDTH[size] : HEIGHT[size], className)}
      {...props}
    />
  )
}

export { Spacer }
