import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent } from "storybook/test"
import { Input } from "./input"
import { Button } from "./button"
import { Field } from "@/components/forms"
import { Inline, Stack } from "@/components/layout"

/**
 * Input — the single-line text control (email capture, search, form fields).
 * shadcn-sourced, MVDS-tuned: the `size` prop mirrors Button's vocabulary
 * (sm/default/lg → 24/32/40) so an input beside a button aligns by
 * construction. Composes with Field for label/help/error wiring.
 */
const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    size: "default",
    placeholder: "you@example.com",
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive size, placeholder, and disabled from Controls. */
export const Playground: Story = {}

/** Every visible state of the control. */
export const States: Story = {
  render: (args) => (
    <Stack gap={16} className="w-80">
      <Input {...args} aria-label="Placeholder" />
      <Input {...args} aria-label="Filled" defaultValue="katy@beckharrisdesign.com" />
      <Input {...args} aria-label="Invalid" defaultValue="not-an-email" aria-invalid />
      <Input {...args} aria-label="Disabled" disabled />
    </Stack>
  ),
}

/** Each size pairs 1:1 with the matching Button size — same height by construction. */
export const SizesBesideButton: Story = {
  render: () => (
    <Stack gap={24}>
      <Inline gap={8}>
        <Input size="sm" aria-label="Small input" placeholder="you@example.com" className="w-64" />
        <Button size="sm">Subscribe</Button>
      </Inline>
      <Inline gap={8}>
        <Input size="default" aria-label="Default input" placeholder="you@example.com" className="w-64" />
        <Button size="default">Subscribe</Button>
      </Inline>
      <Inline gap={8}>
        <Input size="lg" aria-label="Large input" placeholder="you@example.com" className="w-64" />
        <Button size="lg">Subscribe</Button>
      </Inline>
    </Stack>
  ),
}

/** Composed with Field — label, help, and error wired automatically. */
export const WithField: Story = {
  render: () => (
    <Inline gap={32} align="start">
      <Field label="Email address" help="We never share your email." className="w-64">
        <Input placeholder="you@example.com" />
      </Field>
      <Field label="Email address" error="Enter a valid email address." className="w-64">
        <Input defaultValue="not-an-email" />
      </Field>
    </Inline>
  ),
}

/**
 * A11yWiring — the Field-composed input is reachable by its label, typing
 * works, and the error state carries aria-invalid.
 */
export const A11yWiring: Story = {
  render: () => (
    <Field label="Email address" error="Enter a valid email address." className="w-64">
      <Input placeholder="you@example.com" />
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText(/Email address/)
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await userEvent.type(input, "katy@beckharrisdesign.com")
    await expect(input).toHaveValue("katy@beckharrisdesign.com")
  },
}
