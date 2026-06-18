import * as React from "react"
import { cn } from "@/lib/utils"
import { Container, type ContainerSize } from "@/components/layout"

function Hero({
  backgroundImage,
  containerSize = "xl",
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"section"> & {
  /** URL of the background image. A gradient scrim (background/80 → background/20) renders above it. */
  backgroundImage?: string
  containerSize?: ContainerSize
}) {
  return (
    <section
      data-slot="hero"
      className={cn("relative w-full overflow-hidden bg-muted py-24", className)}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              ...style,
            }
          : style
      }
      {...props}
    >
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20"
        />
      )}
      <Container size={containerSize} className="relative z-10">
        {children}
      </Container>
    </section>
  )
}

export { Hero }
