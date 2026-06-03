/**
 * Purge-safe class maps for the layout primitives.
 *
 * Tailwind only keeps classes it can find as COMPLETE strings in source — you
 * can never build `gap-${n}` dynamically. So every step is spelled out here once
 * and the primitives index into these maps.
 *
 * Keys are PIXELS — multiples and fractions of 8 (see the spacing scale in
 * src/index.css). 4 is a fraction (½ × 8); the rest are multiples. So `gap={16}`
 * reads as "16px" and matches the `space-16` Figma variable — no Tailwind
 * step-number guessing (where `gap-4` confusingly means 16px).
 */

export const GAP = {
  0: "gap-0",
  4: "gap-1", //  4px — ½ × 8
  8: "gap-2", //  8px
  16: "gap-4", // 16px
  24: "gap-6", // 24px
  32: "gap-8", // 32px
  40: "gap-10", // 40px
  48: "gap-12", // 48px
  64: "gap-16", // 64px
  80: "gap-20", // 80px
  96: "gap-24", // 96px
} as const
export type Gap = keyof typeof GAP

/** Fixed block-axis sizes for Spacer (height), keyed by px on the 8-pt grid. */
export const HEIGHT = {
  4: "h-1",
  8: "h-2",
  16: "h-4",
  24: "h-6",
  32: "h-8",
  40: "h-10",
  48: "h-12",
  64: "h-16",
  80: "h-20",
  96: "h-24",
} as const

/** Fixed inline-axis sizes for Spacer (width), keyed by px on the 8-pt grid. */
export const WIDTH = {
  4: "w-1",
  8: "w-2",
  16: "w-4",
  24: "w-6",
  32: "w-8",
  40: "w-10",
  48: "w-12",
  64: "w-16",
  80: "w-20",
  96: "w-24",
} as const
export type SpaceSize = keyof typeof HEIGHT

/** Base column counts (1–12). */
export const COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
} as const
export type Cols = keyof typeof COLS

/** Responsive column counts (common subset) per breakpoint. */
export const COLS_SM = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
} as const
export const COLS_MD = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
} as const
export const COLS_LG = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
} as const
export type ResponsiveCols = keyof typeof COLS_SM

export const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const
export type Align = keyof typeof ALIGN

export const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const
export type Justify = keyof typeof JUSTIFY
