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
    await expect(canvas.getByText("human title")).toBeInTheDocument()
    await expect(
      canvas.getByText("Don’t drift from the color tokens")
    ).toBeInTheDocument()
    await expect(canvas.getByText("no-hardcoded-color")).toBeInTheDocument()
    // NN/g display id prefix (machine id unchanged in the gate)
    await expect(
      canvas.getByText("nn01-visibility-of-system-status")
    ).toBeInTheDocument()
  },
}
