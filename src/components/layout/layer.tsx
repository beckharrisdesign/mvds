import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Layer — a z-elevated surface that renders above the layout entirely.
 *
 * Encodes the platform z-layer vocabulary. The four levels cover every
 * above-layout use case: overlay (backdrop/scrim), float (FABs, tooltips),
 * modal (dialogs, sheets, drawers), toast (alerts, always topmost).
 *
 * The z-level tokens (--z-overlay … --z-toast) in src/index.css are the
 * source of truth — shadcn Dialog/Sheet/Toast reference these same tokens.
 * Use Layer directly for custom overlay needs; prefer the shadcn components
 * for standard patterns.
 *
 * `fixed inset-0` is the default geometry; override inset-* via className
 * for partial overlays (e.g. a tray anchored to one edge).
 */
const LAYER_Z = {
  overlay: "z-overlay",
  float:   "z-float",
  modal:   "z-modal",
  toast:   "z-toast",
} as const

export type LayerLevel = keyof typeof LAYER_Z

function Layer({
  level = "modal",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  level?: LayerLevel
}) {
  return (
    <div
      data-slot="layer"
      data-level={level}
      className={cn("fixed inset-0", LAYER_Z[level], className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Layer }
