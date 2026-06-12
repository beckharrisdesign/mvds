import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"
import { Inline } from "@/components/layout"

/**
 * RadioGroup — one choice among a few visible options. Items are 16px circles
 * with the same on-grid 40×32 hit target as Checkbox; the group stacks with an
 * 8px gap. For more than ~5 options reach for Select (Phase 2b) instead.
 */
const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const Option = ({
  value,
  label,
  disabled,
}: {
  value: string
  label: string
  disabled?: boolean
}) => (
  <Inline gap={8} align="center">
    <RadioGroupItem value={value} id={`rg-${value}`} disabled={disabled} />
    <Label htmlFor={`rg-${value}`}>{label}</Label>
  </Inline>
)

/** Playground — a working group with a default selection. */
export const Playground: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" aria-label="Shipping speed">
      <Option value="standard" label="Standard (3–5 days)" />
      <Option value="express" label="Express (1–2 days)" />
      <Option value="overnight" label="Overnight" />
    </RadioGroup>
  ),
}

/** States: selected, unselected, disabled item, and an invalid group. */
export const States: Story = {
  render: () => (
    <RadioGroup defaultValue="selected" aria-label="States" aria-invalid>
      <Option value="selected" label="Selected" />
      <Option value="unselected" label="Unselected" />
      <Option value="disabled" label="Disabled" disabled />
    </RadioGroup>
  ),
}

/** Selection moves on click; exactly one item is checked at a time. */
export const Interaction: Story = {
  render: () => (
    <RadioGroup defaultValue="a" aria-label="Plan">
      <Option value="a" label="Starter" />
      <Option value="b" label="Growth" />
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    const growth = canvas.getByRole("radio", { name: "Growth" })
    await userEvent.click(growth)
    await expect(growth).toBeChecked()
    await expect(canvas.getByRole("radio", { name: "Starter" })).not.toBeChecked()
  },
}
