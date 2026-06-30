import * as React from "react"
import { cn } from "@/lib/utils"
import { Container, type ContainerSize } from "./container"
import { SECTION_PY, SURFACE_BG, type SectionPy, type SurfaceBg } from "./scales"

/**
 * Section — a full-width content band. The `page.tsx` layer of a product:
 * per-route, swapped on navigation, living in the space Chrome leaves behind.
 *
 * Background fills edge-to-edge; the inner Container centers content at
 * `innerSize` max-width with responsive horizontal padding. Stack Sections
 * top-to-bottom to build a page of horizontal stripes.
 */
function Section({
  bg = "background",
  py = 24,
  innerSize = "xl",
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  bg?: SurfaceBg
  py?: SectionPy
  innerSize?: ContainerSize
}) {
  return (
    <section
      data-slot="section"
      className={cn("w-full", SURFACE_BG[bg], SECTION_PY[py], className)}
      {...props}
    >
      <Container size={innerSize}>{children}</Container>
    </section>
  )
}

export { Section }
