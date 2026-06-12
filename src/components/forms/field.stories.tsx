import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Field } from "./field"
import { Stack } from "@/components/layout"

/**
 * Field is the scaffold every form control plugs into: label, control slot,
 * and one line of support text (error wins over help). It owns the form
 * spacing rhythm (a single 8px gap) and wires accessibility automatically —
 * `htmlFor`, `aria-describedby`, `aria-invalid`. The Phase-2 controls
 * (Checkbox, Radio, Switch, Textarea, Select) compose into this instead of
 * re-implementing the anatomy.
 */
const meta = {
  title: "Forms/Field",
  component: Field,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    help: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
  },
  args: {
    label: "Email address",
    children: (
      <input
        type="email"
        placeholder="you@example.com"
        className="h-8 w-64 rounded-md border border-input bg-background px-2 text-small text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive"
      />
    ),
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive label, help, error, and required from Controls. */
export const Playground: Story = {}

/** Every state of the anatomy side by side. */
export const States: Story = {
  render: (args) => (
    <Stack gap={24}>
      <Field {...args} label="Default" />
      <Field {...args} label="With help" help="We never share your email." />
      <Field {...args} label="Required" required help="Needed to sign in." />
      <Field
        {...args}
        label="With error"
        help="We never share your email."
        error="Enter a valid email address."
      />
    </Stack>
  ),
}

/**
 * A11yWiring — proves the automatic wiring: the label points at the control,
 * help/error are linked via aria-describedby, and an error flips aria-invalid
 * on the control and replaces the help line.
 */
export const A11yWiring: Story = {
  args: {
    label: "Username",
    help: "Lowercase letters only.",
    error: "That username is taken.",
  },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("Username")
    await expect(input).toHaveAttribute("aria-invalid", "true")
    const description = canvas.getByRole("alert")
    await expect(description).toHaveTextContent("That username is taken.")
    await expect(input).toHaveAttribute(
      "aria-describedby",
      description.getAttribute("id") as string
    )
  },
}
