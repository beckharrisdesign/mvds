import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { PackageDocs } from "./package-docs"

const meta = {
  title: "Site/PackageDocs",
  component: PackageDocs,
  tags: ["autodocs", "!dev"],
} satisfies Meta<typeof PackageDocs>

export default meta
type Story = StoryObj<typeof meta>

/** Default — package identity, quick-start steps, and full-guide link. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Quick start")).toBeInTheDocument()
    await expect(canvas.getByText("Full install guide →")).toBeInTheDocument()
    await expect(canvas.getByText("1 · Configure .npmrc")).toBeInTheDocument()
  },
}
