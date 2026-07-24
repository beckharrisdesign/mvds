import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { PackageDocs } from "./package-docs"

const meta = {
  title: "Site/PackageDocs",
  component: PackageDocs,
  tags: ["autodocs", "!dev"],
  args: {
    commit: "abc1234",
  },
} satisfies Meta<typeof PackageDocs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default — the two-step public-npm path, plus the route to the starter app.
 *
 * The assertions below are a regression guard with history: this panel taught a
 * GitHub Packages + PAT install long after the package had moved to public npm.
 * A newcomer following it did fifteen minutes of auth work for a registry that
 * needs none, so the story now asserts the *absence* of that path as firmly as
 * the presence of the real one.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Quick start")).toBeInTheDocument()
    await expect(canvas.getByText("1 · Install")).toBeInTheDocument()
    await expect(canvas.getByText("2 · Wire the CSS")).toBeInTheDocument()
    await expect(canvas.getByText("Full install guide →")).toBeInTheDocument()

    // The starter is the recommended route for someone new — keep it reachable.
    await expect(
      canvas.getByRole("link", { name: "Open the starter →" })
    ).toHaveAttribute("href")

    // No resurrected auth ceremony: the registry is public.
    await expect(canvas.queryByText(/npm\.pkg\.github\.com/)).toBeNull()
    await expect(canvas.queryByText(/npm login/)).toBeNull()
  },
}
