import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { PrinciplesIndex } from "./principles-index"
import type { ManifestSnapshot } from "./manifest-snapshot.types"
import liveSnapshot from "@/generated/manifest-snapshot.json"

const meta = {
  title: "Intro/Design principles",
  component: PrinciplesIndex,
  tags: ["autodocs"],
  args: {
    principles: (liveSnapshot as ManifestSnapshot).principles,
  },
} satisfies Meta<typeof PrinciplesIndex>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Design principles" })
    ).toBeInTheDocument()
    // Real table semantics (openspec: add-table-component): the caption names
    // the table, every header cell is a column header, 24 live rows render.
    await expect(
      canvas.getByRole("table", { name: /MVDS design principles · 24 records/ })
    ).toBeInTheDocument()
    await expect(canvas.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "ID",
      "What it says",
      "Enforcement",
      "Source",
    ])
    await expect(canvas.getByText("no-hardcoded-color")).toBeInTheDocument()
    await expect(canvas.getAllByText("enforced").length).toBeGreaterThan(0)
    await expect(canvas.getAllByText("guiding").length).toBeGreaterThan(0)
    // NN/g display id prefix (machine id unchanged in the gate)
    await expect(
      canvas.getByText("nn01-visibility-of-system-status")
    ).toBeInTheDocument()
  },
}
