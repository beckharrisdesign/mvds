import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollRegion,
} from "./table"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Stack } from "@/components/layout"
import type {
  ManifestSnapshot,
  PrincipleRecord,
} from "@/components/site/manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * Table renders tabular data with real table semantics and lets content size
 * the columns. Every state `scale-to-the-data` names is a story here — empty,
 * one, many, long, wide — and every row below is a live record from
 * `principles.config.mjs`, never a hand-written fixture (design.md D9), so the
 * stories cannot drift from the data they claim to show.
 *
 * The parts: `TableScrollRegion` (the keyboard-reachable scroll container,
 * named by the caption), `Table` (`rules`, `striped`), `TableCaption`,
 * `TableHeader` (sticky), `TableBody`, `TableRow`, `TableHead`, `TableCell`
 * and `TableEmpty` (the zero-row state, inside `<tbody>` so the headers stay).
 */
const principles = (liveSnapshot as ManifestSnapshot).principles

type Column = {
  key: string
  label: string
  render: (p: PrincipleRecord) => React.ReactNode
  align?: "right"
}

// The column set is data, declared once and read three times — header, body,
// and TableEmpty's colSpan (D4). Measures go on the cell's CONTENT: a browser
// does not honour max-width on a <td>, but it honours it on a block inside one.
const COLUMNS: Column[] = [
  {
    key: "id",
    label: "ID",
    render: (p) => (
      <code className="block max-w-[32ch] font-mono text-small wrap-anywhere">
        {p.id}
      </code>
    ),
  },
  {
    key: "description",
    label: "What it says",
    render: (p) => (
      <span className="block min-w-[16ch] max-w-[60ch]">{p.description}</span>
    ),
  },
  {
    key: "enforcement",
    label: "Enforcement",
    render: (p) =>
      p.enforcement === "automated" ? (
        <Badge variant="muted">enforced</Badge>
      ) : (
        <Badge variant="outline">guiding</Badge>
      ),
  },
  {
    key: "source",
    label: "Source",
    render: (p) => (p.source.kind === "founder" ? "MVDS" : p.source.name),
  },
]

function PrinciplesTable({
  rows,
  columns = COLUMNS,
  caption,
  rules,
  striped,
  className,
}: {
  rows: PrincipleRecord[]
  columns?: Column[]
  caption: string
  rules?: React.ComponentProps<typeof Table>["rules"]
  striped?: boolean
  className?: string
}) {
  const captionId = React.useId()
  return (
    <TableScrollRegion aria-labelledby={captionId} className={className}>
      <Table rules={rules} striped={striped}>
        <TableCaption id={captionId}>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead
                key={c.key}
                className={c.align === "right" ? "text-right" : undefined}
              >
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty
              colSpan={columns.length}
              title="Nothing matched."
              hint="There are no records in this set."
            />
          ) : (
            rows.map((p, i) => (
              <TableRow key={`${p.id}-${i}`}>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={c.align === "right" ? "text-right" : undefined}
                  >
                    {c.render(p)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableScrollRegion>
  )
}

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    rules: {
      control: "select",
      options: ["horizontal", "vertical", "both", "none"],
    },
    striped: { control: "boolean" },
  },
  args: { rules: "horizontal", striped: false },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const five = principles.slice(0, 5)

/** Caption, sticky header, five live rows. The play test checks the semantics the component exists for. */
export const Default: Story = {
  render: (args) => (
    <PrinciplesTable
      rows={five}
      caption={`MVDS design principles · ${principles.length} records · 5 shown`}
      {...args}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    // The accessible name resolves: the caption names the table AND the region.
    await expect(
      canvas.getByRole("table", { name: /MVDS design principles/ })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("region", { name: /MVDS design principles/ })
    ).toBeInTheDocument()
    // Every header cell is associated with its column.
    for (const th of canvas.getAllByRole("columnheader")) {
      await expect(th).toHaveAttribute("scope", "col")
    }
    // Hover reaches body rows only (D6, D17). The harness's userEvent.hover
    // dispatches events, not a CSS :hover state, so the check is structural:
    // the compiled rule for the row's hover utility exists, paints primary-2,
    // and is scoped to [data-slot="table-body"] — which is what keeps it off
    // <thead>. Verified by pointer in the browser on 2026-10-15 (the hovered
    // row computed oklch(0.922 0 0) = --primary-2).
    const headerRow = canvasElement.querySelector("thead tr") as HTMLElement
    const bodyRow = canvasElement.querySelector("tbody tr") as HTMLElement
    const SCOPED = "in-data-[slot=table-body]:hover:bg-primary-2"
    // The row carries only the body-scoped hover, never a bare one — and the
    // header row is the same TableRow, so the scope is what keeps it off <thead>.
    await expect(bodyRow.classList.contains(SCOPED)).toBe(true)
    await expect(bodyRow.classList.contains("hover:bg-primary-2")).toBe(false)
    await expect(headerRow.className).toBe(bodyRow.className)
    // And the scoped utility compiled: Tailwind nests the variants, so the
    // class rule's cssText holds the whole chain — the [data-slot="table-body"]
    // scope, :hover, and the declaration (inline theme → `var(--primary-2)`).
    let scopedRule: string | null = null
    const walk = (rules: CSSRuleList) => {
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule && r.selectorText.includes("table-body") && /--primary-2/.test(r.cssText)) {
          scopedRule = r.cssText
        } else if ("cssRules" in r && (r as CSSGroupingRule).cssRules.length) {
          walk((r as CSSGroupingRule).cssRules)
        }
      }
    }
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules)
      } catch {
        /* cross-origin sheet — not ours */
      }
    }
    await expect(scopedRule).not.toBeNull()
    await expect(scopedRule!).toContain('[data-slot="table-body"]')
    await expect(scopedRule!).toContain(":hover")
  },
}

/** Zero rows: the headers stay, TableEmpty says what is absent (D8). */
export const Empty: Story = {
  render: (args) => (
    <PrinciplesTable rows={[]} caption="MVDS design principles · 0 records" {...args} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nothing matched.")).toBeInTheDocument()
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(COLUMNS.length)
  },
}

/** One row — a layout that only reads as deliberate in multiples is a bug. */
export const OneRow: Story = {
  render: (args) => (
    <PrinciplesTable
      rows={principles.slice(0, 1)}
      caption="MVDS design principles · 1 shown"
      {...args}
    />
  ),
}

/** Fifty rows in a capped region: past the first screenful every cell keeps its column name (D3). */
export const ManyRows: Story = {
  render: (args) => (
    <PrinciplesTable
      rows={Array.from({ length: 50 }, (_, i) => principles[i % principles.length])}
      caption="MVDS design principles · 50 rows"
      className="max-h-80"
      {...args}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region")
    const thead = canvasElement.querySelector("thead") as HTMLElement
    // Setting scrollTop and reading a rect forces layout synchronously — no
    // frame needed, and Chromatic's capture freezes requestAnimationFrame.
    region.scrollTop = 240
    await expect(region.scrollTop).toBeGreaterThan(0)
    // The sticky header is still at the region's top edge after scrolling.
    const regionTop = region.getBoundingClientRect().top
    const theadTop = thead.getBoundingClientRect().top
    await expect(Math.abs(theadTop - regionTop)).toBeLessThan(2)
  },
}

const longest = [...principles].sort(
  (a, b) => b.description.length - a.description.length
)[0]

/** One value longer than every sample — the real longest description, measured not estimated (D2, D9). */
export const Long: Story = {
  render: (args) => (
    <PrinciplesTable
      rows={[principles[0], longest, principles[1]]}
      caption={`MVDS design principles · longest description is ${longest.description.length} characters`}
      {...args}
    />
  ),
  play: async ({ canvas }) => {
    const region = canvas.getByRole("region")
    // The long value wraps inside its measure; nothing scrolls sideways at this width.
    await expect(region.scrollWidth).toBe(region.clientWidth)
  },
}

// One more column than the design showed — two, in fact: both are real
// record fields the index does not render (D4, D9).
const WIDE_COLUMNS: Column[] = [
  ...COLUMNS,
  { key: "check", label: "Check", render: (p) => p.checkKind },
  { key: "severity", label: "Severity", render: (p) => p.severity },
]

/** One more column than the design showed: one more entry in `columns`, nothing re-decided (D4). */
export const Wide: Story = {
  render: (args) => (
    <PrinciplesTable
      rows={five}
      columns={WIDE_COLUMNS}
      caption="MVDS design principles · six columns"
      {...args}
    />
  ),
}

/**
 * At S (480px) a table wider than its region scrolls, the page does not, and a
 * keyboard user can reach the region (D10). The four-column set wraps to fit
 * 480px on its own; the six-column set cannot, which is the case the decision
 * is for — so that is the one shown.
 */
export const Narrow480: Story = {
  render: (args) => (
    <div className="max-w-[30rem]">
      <PrinciplesTable
        rows={five}
        columns={WIDE_COLUMNS}
        caption="MVDS design principles · six columns at 480px"
        {...args}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region")
    await expect(region).toHaveAttribute("tabindex", "0")
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth)
    await expect(canvasElement.scrollWidth).toBe(canvasElement.clientWidth)
  },
}

/** Where the 1px rules go (D16). */
export const Rules: Story = {
  render: () => (
    <Stack gap={32}>
      <PrinciplesTable rows={principles.slice(0, 3)} caption='rules="vertical"' rules="vertical" />
      <PrinciplesTable rows={principles.slice(0, 3)} caption='rules="both"' rules="both" />
      <PrinciplesTable rows={principles.slice(0, 3)} caption='rules="none"' rules="none" />
    </Stack>
  ),
}

/** Even body rows in primary-1; hover is primary-2 on top of a stripe (D17). */
export const Striped: Story = {
  args: { striped: true },
  render: (args) => (
    <PrinciplesTable
      rows={principles.slice(0, 6)}
      caption="MVDS design principles · striped"
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    const rows = Array.from(canvasElement.querySelectorAll("tbody tr")) as HTMLElement[]
    const bg = (el: HTMLElement) => getComputedStyle(el).backgroundColor
    // Compare computed colour to computed colour: a probe painted with the same
    // token, so the browser's own serialisation is on both sides. (Chromatic's
    // Chrome failed a raw `--primary-1` string compare that passed locally.)
    const probe = document.createElement("span")
    probe.style.backgroundColor = "var(--primary-1)"
    canvasElement.appendChild(probe)
    const step1 = bg(probe)
    probe.remove()
    await expect(step1).not.toBe("rgba(0, 0, 0, 0)")
    // Even rows paint primary-1; odd rows stay transparent; the header never stripes.
    await expect(bg(rows[1])).toBe(step1)
    await expect(bg(rows[3])).toBe(step1)
    await expect(bg(rows[0])).toBe("rgba(0, 0, 0, 0)")
    await expect(bg(canvasElement.querySelector("thead tr") as HTMLElement)).toBe("rgba(0, 0, 0, 0)")
  },
}

/** One inset per cell: a badge beside a two-line identity cell sits on the first line box (D13). */
export const InlineContent: Story = {
  render: () => {
    const captionId = React.useId()
    const members = [
      { name: "Avery Lindqvist", email: "avery@example.com", role: "Owner", teams: "Design, Engineering", amount: "$49.00" },
      { name: "Jordan Fairweather-Mackenzie", email: "jordan.fairweather-mackenzie@example.com", role: "Member", teams: "Design, Marketing, Operations, Support, Finance", amount: "$71.40" },
    ]
    return (
      <TableScrollRegion aria-labelledby={captionId}>
        <Table>
          <TableCaption id={captionId}>Members · sample data, invented</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.email}>
                <TableCell>
                  <Stack gap={0}>
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-small text-muted-foreground">{m.email}</span>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Badge variant={m.role === "Owner" ? "muted" : "outline"}>{m.role}</Badge>
                </TableCell>
                <TableCell>{m.teams}</TableCell>
                <TableCell className="text-right">{m.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScrollRegion>
    )
  },
}

/** Inside a Card the sticky header paints `card`, not `background` — no seam in dark mode (D14). */
export const InCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Design principles</CardTitle>
      </CardHeader>
      <CardContent>
        <PrinciplesTable
          rows={Array.from({ length: 24 }, (_, i) => principles[i % principles.length])}
          caption="MVDS design principles · inside a Card"
          className="max-h-80"
        />
      </CardContent>
    </Card>
  ),
}
