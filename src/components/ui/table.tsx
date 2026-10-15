import * as React from "react"

import { cn } from "@/lib/utils"
import { Stack } from "@/components/layout"

/**
 * Table — real table semantics, columns sized by content, every data state
 * decided (openspec: add-table-component, design.md D1–D18).
 *
 * MVDS tuning over shadcn's `table`: shadcn ships p-2 / h-10 / align-middle /
 * text-sm cells and a `hover:bg-muted/50` row; all of it is replaced here.
 * Re-apply this file's tuning after any `shadcn add table`.
 *
 * - One inset per cell: p-4 (16) on every head and cell, align-top so inline
 *   content (a Badge beside a name) sits on the first line box (D13, D18).
 * - `rules` says where the 1px `border` rules go — horizontal (default),
 *   vertical, both, none (D16). Rows and cells read it through `data-rules`.
 * - `striped` paints even body rows `primary-1`; hover is `primary-2` on body
 *   rows only, striped or not (D17). The header never hovers: muted-foreground
 *   on a hovered tint is the one pairing the contrast gate exempts (D6).
 * - The header is sticky on `--table-surface`, a token Card re-points at
 *   `card` so the header stays opaque on either surface (D3, D14).
 * - Widths are never declared here. A consumer caps a prose column with a
 *   measure (`max-w-[60ch]`) on the cell's content, never a pixel (D1, D2).
 */

const ROW_RULE =
  "group-data-[rules=horizontal]/table:border-b group-data-[rules=both]/table:border-b"
const CELL_RULE =
  "group-data-[rules=vertical]/table:not-last:border-r group-data-[rules=both]/table:not-last:border-r"

function Table({
  className,
  rules = "horizontal",
  striped = false,
  ...props
}: Omit<React.ComponentProps<"table">, "rules"> & {
  // `rules` shadows the native (and long-deprecated) <table rules> attribute on
  // purpose: the word means the same thing here, and the omission keeps the
  // union below as the prop's only type.
  /** Where the 1px rules go. Horizontal is the default; `none` removes them. */
  rules?: "horizontal" | "vertical" | "both" | "none"
  /** Paint even body rows in `primary-1` (D17). */
  striped?: boolean
}) {
  return (
    <table
      data-slot="table"
      data-rules={rules}
      data-striped={striped ? "" : undefined}
      className={cn("group/table w-full text-body text-foreground", className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "caption-top px-4 pb-4 text-left text-small text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 bg-table-surface", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-border",
        ROW_RULE,
        // Body rows only: the ancestor scope keeps hover and stripes off <thead>.
        "in-data-[slot=table-body]:hover:bg-primary-2",
        "in-data-[slot=table-body]:group-data-[striped]/table:even:not-hover:bg-primary-1",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  scope = "col",
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      scope={scope}
      data-slot="table-head"
      className={cn(
        "border-border p-4 text-left align-top text-caption text-muted-foreground",
        CELL_RULE,
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "border-border p-4 align-top text-body text-foreground",
        CELL_RULE,
        className
      )}
      {...props}
    />
  )
}

/**
 * The zero-row state, rendered INSIDE <tbody> so the column headers stay. The
 * copy is the consumer's: MVDS ships no default that could assert a cause it
 * cannot know (loading and failed-to-load are the page's states, D8).
 */
function TableEmpty({
  colSpan,
  title,
  hint,
  className,
  ...props
}: Omit<React.ComponentProps<"td">, "title"> & {
  /** The column count — read from the same `columns` the header reads (D4). */
  colSpan: number
  title: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <tr data-slot="table-empty">
      <td
        colSpan={colSpan}
        className={cn("px-4 py-8 text-center", className)}
        {...props}
      >
        <Stack gap={4} align="center">
          <span className="text-body text-foreground">{title}</span>
          {hint ? (
            <span className="text-small text-muted-foreground">{hint}</span>
          ) : null}
        </Stack>
      </td>
    </tr>
  )
}

/**
 * The keyboard-reachable scroll container every Table sits in (D3, D5, D7,
 * D10): a named `role="region"` with a tab stop, horizontal (and, under a
 * `max-h-*` class, vertical) scrolling, and CSS-only scroll edges. The name is
 * required by the type — point `aria-labelledby` at the TableCaption, or pass
 * an `aria-label` when there is no caption; both-absent does not compile.
 */
type TableScrollRegionName =
  | { "aria-labelledby": string; "aria-label"?: never }
  | { "aria-label": string; "aria-labelledby"?: never }

function TableScrollRegion({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  TableScrollRegionName) {
  return (
    <div
      role="region"
      tabIndex={0}
      data-slot="table-scroll-region"
      className={cn(
        "scroll-edges-x relative w-full overflow-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableScrollRegion,
}
