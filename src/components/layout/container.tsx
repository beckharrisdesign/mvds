import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Container — centers content and caps its width, with responsive horizontal
 * padding. Max widths reference the breakpoint scale (src/index.css). This is
 * the outermost layout primitive: page shells, sections, prose.
 */
const MAX = {
  sm: "max-w-[40rem]",
  md: "max-w-[48rem]",
  lg: "max-w-[64rem]",
  xl: "max-w-[80rem]",
  "2xl": "max-w-[96rem]",
  prose: "max-w-prose",
  full: "max-w-full",
} as const

export type ContainerSize = keyof typeof MAX

function Container({
  size = "xl",
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: ContainerSize }) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", MAX[size], className)}
      {...props}
    />
  )
}

export { Container }
