import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Badge } from "./badge"
import { Inline } from "@/components/layout"

/**
 * Badge is a small variant-driven atom for labels, tags, and statuses. Like
 * Button, its `variant` prop (a CVA variant) is what the Figma generate-library
 * flow turns into a component property.
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "muted", "outline", "destructive"],
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive every prop from the Controls panel. */
export const Playground: Story = {}

/** Every variant side by side (the set Figma maps to a `variant` property). */
export const Variants: Story = {
  render: () => (
    <Inline gap={8}>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </Inline>
  ),
}

/**
 * CssCheck — proves the token layer (`src/index.css`) loaded in Storybook and
 * the default Badge consumes `--primary` (non-transparent fill). Mirrors the
 * Button CssCheck so the same token assertion guards this atom too.
 */
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const badge = canvas.getByText("Badge")
    await expect(getComputedStyle(badge).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    )
  },
}
