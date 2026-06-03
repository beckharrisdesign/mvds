import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"

/**
 * Button is the canonical variant-driven atom. Its `variant` and `size` props
 * (CVA variants) are exactly what the Figma generate-library flow turns into
 * component properties — making this the cleanest proof of the code → Figma link.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Playground — drive every prop from the Controls panel. */
export const Playground: Story = {}

/** Every variant side by side (the set Figma maps to a `variant` property). */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

/** Every size (maps to a `size` property in Figma). */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

/** Disabled state across variants. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Default</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  ),
}
