import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 border border-input bg-transparent transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-small file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      // MVDS: tuned to the 8-pt grid, mirroring Button's size vocabulary so an
      // input beside a button aligns by construction. Heights 24/32/40
      // (h-6/h-8/h-10), padding px-2=8 / px-4=16; type steps on the semantic
      // ramp (text-caption/text-small — never generic text-sm). shadcn's
      // off-grid defaults (h-9=36, px-2.5=10) were overridden; re-apply this
      // after `shadcn add`/updating.
      size: {
        sm: "h-6 rounded-[min(var(--radius-md),12px)] px-2 text-caption font-normal",
        default: "h-8 rounded-lg px-2 text-small",
        lg: "h-10 rounded-lg px-4 text-small",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
