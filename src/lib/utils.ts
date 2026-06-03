import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Register MVDS's semantic type-ramp tokens as font-sizes. Without this,
// tailwind-merge doesn't recognize `text-h4`/`text-small`/etc. and misclassifies
// them as text-*colors* — so `cn("text-small text-muted-foreground")` would drop
// the size. Listing them in the `font-size` group keeps size and color distinct.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "small",
            "caption",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
