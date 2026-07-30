import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { HowWeEnforce } from "./how-we-enforce"

const meta = {
  title: "Intro/How we enforce",
  component: HowWeEnforce,
  tags: ["autodocs"],
} satisfies Meta<typeof HowWeEnforce>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "How we enforce" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "While planning" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "While coding" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "While testing" })
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("heading", { name: "Out in the world" })
    ).toBeInTheDocument()
  },
}
