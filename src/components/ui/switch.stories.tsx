import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { Switch } from "./switch"
import { Label } from "./label"
import { Stack } from "@/components/layout"
import { Inline } from "@/components/layout"

/**
 * Switch — an instant on/off toggle (no submit step implied). MVDS-tuned
 * tracks sit on the grid: 24×40 (`default`) and 16×32 (`sm`), replacing
 * shadcn's off-grid 18.4×32. Use Checkbox instead when the choice is part
 * of a form submission.
 */
const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive size/checked/disabled from Controls. */
export const Playground: Story = {
  args: { defaultChecked: true, "aria-label": "Playground switch" },
}

/** Both sizes in every state. */
export const States: Story = {
  render: () => (
    <Stack gap={16}>
      {(["default", "sm"] as const).map((size) => (
        <Inline key={size} gap={16} align="center">
          <Switch size={size} aria-label={`${size} off`} />
          <Switch size={size} defaultChecked aria-label={`${size} on`} />
          <Switch size={size} disabled aria-label={`${size} disabled`} />
          <Switch
            size={size}
            disabled
            defaultChecked
            aria-label={`${size} disabled on`}
          />
        </Inline>
      ))}
    </Stack>
  ),
}

/** Toggles on click and reports state via the switch role. */
export const Interaction: Story = {
  render: () => (
    <Inline gap={8} align="center">
      <Switch id="sw-play" />
      <Label htmlFor="sw-play">Email notifications</Label>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("switch", { name: "Email notifications" })
    await expect(toggle).not.toBeChecked()
    await userEvent.click(toggle)
    await expect(toggle).toBeChecked()
  },
}
