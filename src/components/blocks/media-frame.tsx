import * as React from "react"
import { cn } from "@/lib/utils"

const RATIO = {
  video: "aspect-video",     // 16:9
  square: "aspect-square",   // 1:1
  portrait: "aspect-[3/4]",  // 3:4
  wide: "aspect-[2.35/1]",   // cinematic 2.35:1
} as const

export type MediaRatio = keyof typeof RATIO

function MediaFrame({
  ratio = "video",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  ratio?: MediaRatio
}) {
  return (
    <div
      data-slot="media-frame"
      className={cn("w-full overflow-hidden rounded-lg", RATIO[ratio], className)}
      {...props}
    />
  )
}

export { MediaFrame }
