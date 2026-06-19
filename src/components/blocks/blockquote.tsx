import * as React from "react"
import { cn } from "@/lib/utils"

function Blockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn(
        "border-l-4 border-primary pl-6 text-body-lg text-foreground italic",
        className
      )}
      {...props}
    />
  )
}

export { Blockquote }
