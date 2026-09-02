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
  play: async ({ canvas, canvasElement }) => {
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
  },
}

/**
 * Expanded — the Principles disclosure open, listing all twenty principle
 * titles; the toggle mirrors to "Hide the list".
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
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/20 principles/)).toBeInTheDocument()
    await expect(
      canvas.getByRole("link", { name: "src/index.css" })
    ).toBeInTheDocument()
  },
}
