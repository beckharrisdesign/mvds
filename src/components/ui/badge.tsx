import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // 8-pt grid: px-2 = 8, gap-1 = 4. text-caption is the smallest ramp step.
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-caption font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&:is(a,button)]:transition-colors [&:is(a,button)]:outline-none [&:is(a,button)]:focus-visible:border-ring [&:is(a,button)]:focus-visible:ring-3 [&:is(a,button)]:focus-visible:ring-ring/50",
  {
    // Two axes, deliberately NOT Button's emphasis ladder (Button = action loudness;
    // Badge = meaning). Tone = neutral label/tag; status = the AGENTS.md semantic
    // triad (success/neutral/destructive) as tints. See AGENTS.md "semantic triad".
    variants: {
      variant: {
        // Tone — neutral labels & tags, no status meaning.
        default: "border-transparent bg-primary text-primary-foreground",
        muted: "border-transparent bg-muted text-foreground",
        /** @deprecated Use `muted` instead. Will be removed in v1. */
        secondary: "border-transparent bg-muted text-foreground",
        outline: "border-border text-foreground",
        // Status — the semantic triad, as tints (good / in-progress / bad).
        success:
          "border-transparent bg-success/10 text-success dark:bg-success/15",
        neutral:
          "border-transparent bg-neutral/10 text-foreground dark:bg-neutral/15",
        destructive:
          "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
