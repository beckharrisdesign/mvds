import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { IntroStartHere } from "./intro-start-here"

const meta = {
  title: "Intro/Start here",
  component: IntroStartHere,
  tags: ["autodocs"],
} satisfies Meta<typeof IntroStartHere>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Start here" })
    ).toBeInTheDocument()
    await expect(canvas.getByText(/Design principles/)).toBeInTheDocument()
    await expect(canvas.getByText(/How we enforce/)).toBeInTheDocument()
    await expect(canvas.getByText(/Get started/)).toBeInTheDocument()
  },
}
