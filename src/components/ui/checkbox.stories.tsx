import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import { Stack } from "@/components/layout"
import { Inline } from "@/components/layout"

/**
 * Checkbox — a single boolean control. The visible box is 16px, but the
 * invisible hit target expands to 40×32 (on-grid) so it stays easy to tap.
 * Pair it with Label via `htmlFor`, or hand the pair to the Field scaffold
 * for help/error wiring.
 */
const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive checked/disabled from Controls. */
export const Playground: Story = {
  args: { defaultChecked: true, "aria-label": "Playground checkbox" },
}

/** Every state: unchecked, checked, disabled (both), and invalid. */
export const States: Story = {
  render: () => (
    <Stack gap={16}>
      <Inline gap={8} align="center">
        <Checkbox id="cb-unchecked" />
        <Label htmlFor="cb-unchecked">Unchecked</Label>
      </Inline>
      <Inline gap={8} align="center">
        <Checkbox id="cb-checked" defaultChecked />
        <Label htmlFor="cb-checked">Checked</Label>
      </Inline>
      <Inline gap={8} align="center">
        <Checkbox id="cb-disabled" disabled />
        <Label htmlFor="cb-disabled">Disabled</Label>
      </Inline>
      <Inline gap={8} align="center">
        <Checkbox id="cb-disabled-checked" disabled defaultChecked />
        <Label htmlFor="cb-disabled-checked">Disabled + checked</Label>
      </Inline>
      <Inline gap={8} align="center">
        <Checkbox id="cb-invalid" aria-invalid />
        <Label htmlFor="cb-invalid">Invalid</Label>
      </Inline>
    </Stack>
  ),
}

/** Toggles on click and reflects state to assistive tech. */
export const Interaction: Story = {
  render: () => (
    <Inline gap={8} align="center">
      <Checkbox id="cb-play" />
      <Label htmlFor="cb-play">Accept terms</Label>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Accept terms" })
    await expect(box).not.toBeChecked()
    await userEvent.click(box)
    await expect(box).toBeChecked()
  },
}
