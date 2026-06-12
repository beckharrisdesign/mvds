import type { Meta, StoryObj } from "@storybook/react-vite"
import { Label } from "./label"
import { Stack } from "@/components/layout"

/**
 * Label is the naming half of every form control — always rendered through the
 * Field scaffold in real usage (`src/components/forms/field.tsx`), which wires
 * `htmlFor`, the required marker, and help/error text. It carries `text-small`
 * from the semantic ramp and dims itself when its peer control is disabled.
 */
const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Email address",
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive the text from the Controls panel. */
export const Playground: Story = {}

/** States — default, and dimmed alongside a disabled peer control. */
export const States: Story = {
  render: () => (
    <Stack gap={16}>
      <Stack gap={8}>
        <Label htmlFor="label-enabled">Enabled</Label>
        <input
          id="label-enabled"
          className="peer h-8 w-64 rounded-md border border-input bg-background px-2 text-small text-foreground"
        />
      </Stack>
      <Stack gap={8}>
        <input
          id="label-disabled"
          disabled
          className="peer h-8 w-64 rounded-md border border-input bg-background px-2 text-small text-foreground disabled:opacity-50"
        />
        <Label htmlFor="label-disabled">Disabled (peer)</Label>
      </Stack>
    </Stack>
  ),
}
