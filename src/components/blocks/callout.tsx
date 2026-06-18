import * as React from "react"
import { cn } from "@/lib/utils"
import { Inline } from "@/components/layout"

function Callout({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
}) {
  return (
    <div
      data-slot="callout"
      className={cn("rounded-lg bg-muted p-4", className)}
      {...props}
    >
      {icon != null ? (
        <Inline gap={8} align="start">
          <span data-slot="callout-icon" className="text-muted-foreground shrink-0">
            {icon}
          </span>
          <div data-slot="callout-content" className="text-body text-foreground min-w-0">
            {children}
          </div>
        </Inline>
      ) : (
        <div data-slot="callout-content" className="text-body text-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

export { Callout }
