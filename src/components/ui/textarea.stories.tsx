import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Textarea } from "./textarea"
import { Field } from "@/components/forms"
import { Stack } from "@/components/layout"

/**
 * Textarea — multi-line text input, MVDS-tuned: on-grid 8px padding (shadcn
 * ships 10px), `text-small` from the semantic ramp, 64px minimum height, and
 * content-based auto-sizing (`field-sizing-content`). Compose it into Field
 * for label/help/error wiring.
 */
const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Tell us what happened…",
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive placeholder/disabled from Controls. */
export const Playground: Story = {}

/** States: default, disabled, and invalid. */
export const States: Story = {
  render: (args) => (
    <Stack gap={16} className="w-80">
      <Textarea {...args} aria-label="Default" />
      <Textarea {...args} aria-label="Disabled" disabled />
      <Textarea {...args} aria-label="Invalid" aria-invalid />
    </Stack>
  ),
}

/**
 * InField — the intended composition: Field supplies label, help/error, and
 * the aria wiring; Textarea just renders the control.
 */
export const InField: Story = {
  render: (args) => (
    <Stack gap={24} className="w-80">
      <Field label="Description" help="Markdown is supported.">
        <Textarea {...args} />
      </Field>
      <Field label="Description" error="Description is required.">
        <Textarea {...args} />
      </Field>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const invalid = canvas.getAllByRole("textbox")[1]
    await expect(invalid).toHaveAttribute("aria-invalid", "true")
  },
}
