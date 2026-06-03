/**
 * Purge-safe class maps for the layout primitives.
 *
 * Tailwind only keeps classes it can find as COMPLETE strings in source — you
 * can never build `gap-${n}` dynamically. So every step is spelled out here once
 * and the primitives index into these maps. Keys are the spacing-scale steps
 * (see the spacing scale in src/index.css).
 */

export const GAP = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
} as const
export type Gap = keyof typeof GAP

/** Fixed block-axis sizes for Spacer (height). */
export const HEIGHT = {
  1: "h-1",
  2: "h-2",
  3: "h-3",
  4: "h-4",
  5: "h-5",
  6: "h-6",
  8: "h-8",
  10: "h-10",
  12: "h-12",
  16: "h-16",
  20: "h-20",
  24: "h-24",
} as const

/** Fixed inline-axis sizes for Spacer (width). */
export const WIDTH = {
  1: "w-1",
  2: "w-2",
  3: "w-3",
  4: "w-4",
  5: "w-5",
  6: "w-6",
  8: "w-8",
  10: "w-10",
  12: "w-12",
  16: "w-16",
  20: "w-20",
  24: "w-24",
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
