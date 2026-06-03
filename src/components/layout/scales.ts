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
 *
 * EXCEPTION: the grid system (`grid-cols-*` / `col-span-*` / `col-start-*`) spans
 * a 12×6-breakpoint matrix that would be ~200 literal entries. Those are instead
 * safelisted via `@source inline(...)` in src/index.css and built dynamically by
 * `responsiveClasses()` below — the one sanctioned place for dynamic Tailwind
 * class names, because the full range is explicitly safelisted.
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

/* ----------------------------- Responsive grid ----------------------------- */

/** The breakpoints, in cascade order. `base` = no prefix (mobile-first). */
export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"

const BP_PREFIX: Record<Breakpoint, string> = {
  base: "",
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
  "2xl": "2xl:",
}

/**
 * A value that can be a single setting (applied at `base`) or an object that
 * cascades across breakpoints, e.g. `12` or `{ base: 4, md: 8, lg: 12 }`.
 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

/**
 * Build a responsive Tailwind class list for `util` (e.g. "grid-cols",
 * "col-span", "col-start") from a Responsive<number>. A bare number applies at
 * `base`; an object emits one class per breakpoint (`md:col-span-6`).
 *
 * These classes are safelisted via `@source inline(...)` in src/index.css, so
 * the dynamic construction here is safe (see the EXCEPTION note at the top).
 */
export function responsiveClasses(
  util: string,
  value: Responsive<number> | undefined
): string {
  if (value == null) return ""
  if (typeof value === "number") return `${util}-${value}`
  return (Object.keys(value) as Breakpoint[])
    .filter((bp) => value[bp] != null)
    .map((bp) => `${BP_PREFIX[bp]}${util}-${value[bp]}`)
    .join(" ")
}

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
