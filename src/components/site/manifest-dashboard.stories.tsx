import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { ElementsOfMvds } from "./manifest-dashboard"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

/**
 * ElementsOfMvds renders the generated manifest snapshot
 * (`src/generated/manifest-snapshot.json`, written by
 * `npm run generate:snapshot`) as "Elements of the MVDS": six peer cards in
 * the approved order (Principles first), each with founder-authored copy, a
 * generated tally, a disclosure listing the full inventory, and two outline
 * Button actions. No badges — live status belongs to the Verification and
 * Figma preview sections (openspec: improve-manifests-ia).
 */
const meta = {
  title: "Site/ElementsOfMvds",
  component: ElementsOfMvds,
  tags: ["autodocs", "!dev"],
  args: {
    snapshot: liveSnapshot as unknown as ManifestSnapshot,
  },
} satisfies Meta<typeof ElementsOfMvds>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Collapsed — the default state. Asserts the section heading, the approved
 * card order (Principles first), and that no Badge renders in the section.
 */
export const Collapsed: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("heading", { name: "Elements of the MVDS" })
    ).toBeInTheDocument()
    const titles = [
      ...canvasElement.querySelectorAll('[data-slot="card-title"]'),
    ].map((h) => h.textContent)
    await expect(titles[0]).toBe("Principles")
    await expect(titles).toContain("Token layer")
    await expect(titles).toContain("Skills")
    await expect(
      canvasElement.querySelectorAll('[data-slot="badge"]').length
    ).toBe(0)
    // Each count+label is one unbreakable unit. A plain joined string let the
    // browser split "10 / spacing steps" and "2 form / components" at 480
    // (openspec: improve-manifests-ia 4.1) — a defect no eye catches twice.
    const units = [
      ...canvasElement.querySelectorAll<HTMLElement>("span.whitespace-nowrap"),
    ]
    // Counting the selected nodes alone would fail open: the selector IS the
    // class under test, so stripping it from a subset drops those units out
    // of the loop and the rest still pass. Pin the count to the snapshot so
    // every generated unit has to be present.
    const expected = args.snapshot.elements.reduce(
      (n, element) => n + element.tally.length,
      0
    )
    await expect(units.length).toBe(expected)
    for (const unit of units) {
      await expect(unit.textContent?.trim()).toMatch(/^\d+ \S/)
      // getClientRects() yields one rect per inline fragment, so count the
      // distinct line tops instead: >1 means the unit split across lines.
      const lines = new Set(
        [...unit.getClientRects()].map((r) => Math.round(r.top))
      )
      await expect(lines.size).toBe(1)
    }
  },
}

/**
 * Narrow — the same unbreakable-unit guard at **480px**, the width the original
 * defect appeared at.
 *
 * `Collapsed` carries the same assertion but renders at the headless browser's
 * default width, where the tally has room and nothing wraps — so it could never
 * have caught the defect it cites. The Figma card's label grew from
 * "17 components" to "19 of 25 components mirrored" (openspec:
 * harden-figma-coverage-gate 4.2), which is the kind of growth that puts a unit
 * on a line boundary, so the narrow case now gets its own story.
 *
 * What this proves, precisely: removing `whitespace-nowrap` fails this story at
 * 480 — verified, not assumed. It fails on the unit COUNT, because the selector
 * is the class under test. The line assertion below cannot itself fire while the
 * class is present (nowrap makes an intra-unit split impossible by
 * construction); it guards the case where the no-wrap mechanism is swapped for
 * a weaker one that still matches the selector. Both are kept — the count is the
 * one with teeth, the line check is the backstop.
 */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvasElement }) => {
    const units = [
      ...canvasElement.querySelectorAll<HTMLElement>("span.whitespace-nowrap"),
    ]
    const expected = args.snapshot.elements.reduce(
      (n, element) => n + element.tally.length,
      0
    )
    await expect(units.length).toBe(expected)
    for (const unit of units) {
      const lines = new Set(
        [...unit.getClientRects()].map((r) => Math.round(r.top))
      )
      await expect(lines.size).toBe(1)
    }
  },
}

/**
 * Expanded — the Principles disclosure open, listing every principle title; the
 * toggle mirrors to "Hide the list".
 */
export const Expanded: Story = {
  play: async ({ canvas }) => {
    const toggles = canvas.getAllByRole("button", {
      name: "Show the full list",
    })
    await userEvent.click(toggles[0])
    await expect(
      canvas.getByRole("button", { name: "Hide the list" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByText("No runt stands alone")
    ).toBeInTheDocument()
  },
}

/** LiveSnapshot — the committed snapshot, exactly as the landing page ships it. */
export const LiveSnapshot: Story = {
  play: async ({ args, canvas }) => {
    // Derived from the snapshot, not written as a literal. This read `/20
    // principles/` until 2026-10-15, when adding four principle records turned a
    // green suite red for no reason but the number — the same brittleness the
    // `scale-to-the-data` principle is about, in the test rather than the UI.
    const count = args.snapshot.principles.length
    await expect(
      canvas.getByText(new RegExp(`${count} principles`))
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("link", { name: "src/index.css" })
    ).toBeInTheDocument()
  },
}
