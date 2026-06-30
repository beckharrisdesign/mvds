import * as React from "react"
import { cn } from "@/lib/utils"
import { SURFACE_BG, type SurfaceBg } from "./scales"

/**
 * Chrome — a sticky structural region that claims space from a viewport edge.
 *
 * Chrome is the `layout.tsx` layer of a product: it persists across route
 * changes and carries global concerns (auth state, navigation, app context).
 * Its dimensions are governed by the chrome dimension tokens in src/index.css
 * (--chrome-top-height, --chrome-left-width, etc.) — override those tokens
 * per brand to set your platform's structural proportions.
 *
 * Multiple Chrome regions at the same position stack inward, each narrowing
 * the content rectangle further.
 */
const CHROME_CLASSES = {
  top:    "sticky top-0 z-chrome w-full h-[var(--chrome-top-height)] overflow-hidden",
  bottom: "sticky bottom-0 z-chrome w-full h-[var(--chrome-bottom-height)] overflow-hidden",
  left:   "sticky top-0 z-chrome h-full w-[var(--chrome-left-width)] shrink-0 overflow-y-auto",
  right:  "sticky top-0 z-chrome h-full w-[var(--chrome-right-width)] shrink-0 overflow-y-auto",
} as const

export type ChromePosition = keyof typeof CHROME_CLASSES

function Chrome({
  position,
  bg = "background",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  position: ChromePosition
  bg?: SurfaceBg
}) {
  return (
    <div
      data-slot="chrome"
      data-position={position}
      className={cn(CHROME_CLASSES[position], SURFACE_BG[bg], className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Chrome }
